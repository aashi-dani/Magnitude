/**
 * src/utils/physicsUtils.js
 * Physics and numerical integration utilities
 * ─────────────────────────────────────────────
 * Includes: RK4 integrator, double pendulum, projectile motion
 */

// ── Numerical Integration ────────────────────────────────────────────────────

/**
 * One step of 4th-order Runge-Kutta integration
 * @param {number[]} state  - current state vector
 * @param {number}   dt     - timestep
 * @param {Function} deriv  - f(state) → derivatives
 * @returns {number[]} new state
 */
export function rk4Step(state, dt, deriv) {
  const k1 = deriv(state);
  const k2 = deriv(state.map((s, i) => s + 0.5 * dt * k1[i]));
  const k3 = deriv(state.map((s, i) => s + 0.5 * dt * k2[i]));
  const k4 = deriv(state.map((s, i) => s + dt * k3[i]));
  return state.map((s, i) =>
    s + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
  );
}

// ── Double Pendulum ──────────────────────────────────────────────────────────

/**
 * Double pendulum equations of motion
 * State: [θ1, ω1, θ2, ω2] (angles in radians, angular velocities in rad/s)
 * @param {number[]} state
 * @param {{ m1, m2, l1, l2, g }} params
 * @returns {number[]} [dθ1, dω1, dθ2, dω2]
 */
export function doublePendulumDeriv(state, { m1, m2, l1, l2, g }) {
  const [θ1, ω1, θ2, ω2] = state;
  const dθ  = θ1 - θ2;
  const M   = 2 * m1 + m2;
  const cos2 = Math.cos(2 * dθ);
  const sinD = Math.sin(dθ);
  const cosD = Math.cos(dθ);
  const denom = M - m2 * cos2;

  const α1 = (
    -g * M * Math.sin(θ1)
    - m2 * g * Math.sin(θ1 - 2 * θ2)
    - 2 * sinD * m2 * (ω2 * ω2 * l2 + ω1 * ω1 * l1 * cosD)
  ) / (l1 * denom);

  const α2 = (
    2 * sinD * (
      ω1 * ω1 * l1 * (m1 + m2)
      + g * (m1 + m2) * Math.cos(θ1)
      + ω2 * ω2 * l2 * m2 * cosD
    )
  ) / (l2 * denom);

  return [ω1, α1, ω2, α2];
}

/**
 * Cartesian coordinates of double pendulum bobs
 * @param {number[]} state - [θ1, ω1, θ2, ω2]
 * @param {{ l1, l2 }} params
 * @param {{ x, y }} origin - pivot point in pixel space
 * @param {number} scale - pixels per meter
 * @returns {{ x1, y1, x2, y2 }}
 */
export function pendulumPositions(state, { l1, l2 }, origin, scale) {
  const [θ1, , θ2] = state;
  const x1 = origin.x + scale * l1 * Math.sin(θ1);
  const y1 = origin.y + scale * l1 * Math.cos(θ1);
  const x2 = x1 + scale * l2 * Math.sin(θ2);
  const y2 = y1 + scale * l2 * Math.cos(θ2);
  return { x1, y1, x2, y2 };
}

/**
 * Total mechanical energy of double pendulum (conservation check)
 */
export function doublePendulumEnergy(state, { m1, m2, l1, l2, g }) {
  const [θ1, ω1, θ2, ω2] = state;
  const KE = 0.5 * m1 * (l1 * ω1) ** 2
    + 0.5 * m2 * (
      (l1 * ω1) ** 2 + (l2 * ω2) ** 2
      + 2 * l1 * l2 * ω1 * ω2 * Math.cos(θ1 - θ2)
    );
  const PE = -(m1 + m2) * g * l1 * Math.cos(θ1) - m2 * g * l2 * Math.cos(θ2);
  return { KE, PE, total: KE + PE };
}

// ── Projectile Motion ────────────────────────────────────────────────────────

/**
 * Projectile motion ODE with optional quadratic air resistance
 * State: [x, y, vx, vy]
 * @param {number[]} state
 * @param {{ g, dragCoeff, mass }} params
 * @returns {number[]} derivatives
 */
export function projectileDeriv(state, { g, dragCoeff = 0, mass = 1 }) {
  const [, , vx, vy] = state;
  const speed = Math.hypot(vx, vy);
  const drag  = dragCoeff * speed;
  return [
    vx,
    vy,
    -(drag / mass) * vx,
    -g - (drag / mass) * vy,
  ];
}

/**
 * Simulate full projectile trajectory until y < 0 (ground)
 * @param {number} v0      - initial speed (m/s)
 * @param {number} angleDeg - launch angle (degrees)
 * @param {number} g       - gravitational acceleration (m/s²)
 * @param {number} drag    - drag coefficient
 * @param {number} dt      - timestep
 * @returns {Array<{x, y, vx, vy, t}>}
 */
export function simulateProjectile(v0, angleDeg, g = 9.81, drag = 0, dt = 0.02) {
  const angle = (angleDeg * Math.PI) / 180;
  let state = [0, 0, v0 * Math.cos(angle), v0 * Math.sin(angle)];
  const points = [{ x: state[0], y: state[1], vx: state[2], vy: state[3], t: 0 }];
  let t = 0;
  const params = { g, dragCoeff: drag, mass: 1 };

  while (t < 60 && points.length < 5000) {
    state = rk4Step(state, dt, s => projectileDeriv(s, params));
    t += dt;
    points.push({ x: state[0], y: state[1], vx: state[2], vy: state[3], t: +t.toFixed(3) });
    if (state[1] < -0.01 && t > 0.1) break;
  }
  return points;
}

// ── Canvas Drawing Helpers ───────────────────────────────────────────────────

/**
 * Draw a crisp arrow on a canvas context
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1, y1 - start
 * @param {number} x2, y2 - end
 * @param {string} color
 * @param {number} [headLen=12]
 */
export function drawArrow(ctx, x1, y1, x2, y2, color, headLen = 12) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
