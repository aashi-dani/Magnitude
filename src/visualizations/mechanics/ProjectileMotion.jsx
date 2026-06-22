/**
 * src/visualizations/mechanics/ProjectileMotion.jsx
 *
 * Canvas-based projectile motion simulator.
 *
 * Trajectory equation (no drag):
 *   y = x·tan(θ) - (g·x²) / (2·v₀²·cos²θ)
 *
 * With drag (quadratic), the ODE is solved by RK4 via simulateProjectile().
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import PlayControls from '../../components/PlayControls';
import VizContainer from '../../components/VizContainer';
import { simulateProjectile, drawArrow } from '../../utils/physicsUtils';

const ACCENT = '#6D8196';
const DRAG_COEFF = 0.05; // quadratic drag coefficient when air resistance is on

// Gravity presets
const GRAVITY_PRESETS = [
  { label: 'Moon', value: 1.62 },
  { label: 'Earth', value: 9.81 },
  { label: 'Jupiter', value: 24.8 },
];

/** Convert simulation coords → canvas pixels */
function toCanvas(sx, sy, origin, scale) {
  return {
    cx: origin.x + sx * scale,
    cy: origin.y - sy * scale, // y-axis flipped
  };
}

export default function ProjectileMotion() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // ── Controls ────────────────────────────────────────────────────────────────
  const [angle, setAngle] = useState(45);
  const [v0, setV0] = useState(50);
  const [gravity, setGravity] = useState(9.81);
  const [airResistance, setAirResistance] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // ── Animation state ─────────────────────────────────────────────────────────
  const frameRef = useRef(0);         // current trajectory index
  const lastTimeRef = useRef(null);   // for delta-time calculation

  // ── Pre-compute trajectory ───────────────────────────────────────────────────
  const trajectory = useMemo(() => {
    const drag = airResistance ? DRAG_COEFF : 0;
    return simulateProjectile(v0, angle, gravity, drag, 0.02);
  }, [v0, angle, gravity, airResistance]);

  // Derived stats from trajectory
  const stats = useMemo(() => {
    if (!trajectory.length) return { maxH: 0, range: 0, tof: 0 };
    const maxH = Math.max(...trajectory.map(p => p.y));
    const last = trajectory[trajectory.length - 1];
    return {
      maxH: maxH.toFixed(1),
      range: Math.max(last.x, 0).toFixed(1),
      tof: last.t.toFixed(2),
    };
  }, [trajectory]);

  // Reset animation when trajectory changes
  useEffect(() => {
    frameRef.current = 0;
    lastTimeRef.current = null;
    setPlaying(false);
  }, [trajectory]);

  // ── Drawing ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Colors
    const bg = isDark ? '#0f172a' : '#f8fafc';
    const groundColor = isDark ? '#334155' : '#cbd5e1';
    const textColor = '#CBCBCB';
    const subTextColor = '#CBCBCB';
    const bgColor   = '#3D3D3D';
    const gridColor = 'rgba(203,203,203,0.1)';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (!trajectory.length) return;

    // Determine scale & origin
    const maxX = Math.max(...trajectory.map(p => p.x), 1);
    const maxY = Math.max(...trajectory.map(p => p.y), 1);
    const padding = { left: 60, right: 40, top: 50, bottom: 60 };
    const availW = W - padding.left - padding.right;
    const availH = H - padding.top - padding.bottom;
    const scale = Math.min(availW / maxX, availH / maxY) * 0.85;
    const origin = { x: padding.left, y: H - padding.bottom };

    // ── Grid lines ─────────────────────────────────────────────────────────────
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridStepX = maxX / 4;
    const gridStepY = maxY / 3;
    for (let i = 0; i <= 4; i++) {
      const x = origin.x + i * gridStepX * scale;
      ctx.beginPath(); ctx.moveTo(x, padding.top); ctx.lineTo(x, origin.y); ctx.stroke();
    }
    for (let i = 1; i <= 3; i++) {
      const y = origin.y - i * gridStepY * scale;
      ctx.beginPath(); ctx.moveTo(origin.x, y); ctx.lineTo(W - padding.right, y); ctx.stroke();
    }

    // ── Ground line ────────────────────────────────────────────────────────────
    ctx.strokeStyle = groundColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(W - padding.right, origin.y);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = subTextColor;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const val = (i * gridStepX).toFixed(0);
      const cx = origin.x + i * gridStepX * scale;
      ctx.fillText(`${val}m`, cx, origin.y + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 1; i <= 3; i++) {
      const val = (i * gridStepY).toFixed(0);
      const cy = origin.y - i * gridStepY * scale;
      ctx.fillText(`${val}m`, origin.x - 6, cy + 4);
    }

    const currentFrame = frameRef.current;

    // ── Full trajectory path (dashed) ──────────────────────────────────────────
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    trajectory.forEach((p, i) => {
      const { cx, cy } = toCanvas(p.x, p.y, origin, scale);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Traversed path (solid amber) ───────────────────────────────────────────
    if (currentFrame > 0) {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= currentFrame && i < trajectory.length; i++) {
        const { cx, cy } = toCanvas(trajectory[i].x, trajectory[i].y, origin, scale);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // ── Peak label ─────────────────────────────────────────────────────────────
    const peakIdx = trajectory.reduce((best, p, i) =>
      p.y > trajectory[best].y ? i : best, 0);
    if (currentFrame >= peakIdx) {
      const peak = trajectory[peakIdx];
      const { cx: px, cy: py } = toCanvas(peak.x, peak.y, origin, scale);
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`↑ ${stats.maxH} m`, px, py - 10);
    }

    // ── Landing label ──────────────────────────────────────────────────────────
    const isFinished = currentFrame >= trajectory.length - 1;
    if (isFinished) {
      const last = trajectory[trajectory.length - 1];
      const { cx: lx } = toCanvas(last.x, last.y, origin, scale);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Range: ${stats.range} m`, lx, origin.y + 38);
    }

    // ── Current ball position + velocity vectors ───────────────────────────────
    const fi = Math.min(currentFrame, trajectory.length - 1);
    const pt = trajectory[fi];
    const { cx: bx, cy: by } = toCanvas(pt.x, pt.y, origin, scale);

    // Velocity arrow scale
    const vScale = scale * 0.08;
    const maxSpeed = Math.hypot(trajectory[0].vx, trajectory[0].vy);
    const arrowScale = vScale / (maxSpeed || 1) * 80;

    // vx (blue)
    if (Math.abs(pt.vx) > 0.01) {
      drawArrow(ctx, bx, by, bx + pt.vx * arrowScale, by, '#0ea5e9', 10);
    }
    // vy (red)
    if (Math.abs(pt.vy) > 0.01) {
      drawArrow(ctx, bx, by, bx, by - pt.vy * arrowScale, '#f43f5e', 10);
    }
    // resultant (white/light)
    const resultColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.8)';
    if (Math.hypot(pt.vx, pt.vy) > 0.01) {
      drawArrow(ctx, bx, by,
        bx + pt.vx * arrowScale,
        by - pt.vy * arrowScale,
        resultColor, 12);
    }

    // Ball shadow
    ctx.beginPath();
    ctx.ellipse(bx, origin.y, 6, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Ball
    const gradient = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 9);
    gradient.addColorStop(0, '#fde68a');
    gradient.addColorStop(1, ACCENT);
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Launch arrow (when paused at start) ───────────────────────────────────
    if (currentFrame === 0 && !playing) {
      const launchLen = 60;
      const rad = (angle * Math.PI) / 180;
      drawArrow(ctx,
        origin.x, origin.y,
        origin.x + launchLen * Math.cos(rad),
        origin.y - launchLen * Math.sin(rad),
        ACCENT, 14);
      // Angle arc
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 28, -rad, 0, false);
      ctx.strokeStyle = isDark ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${angle}°`, origin.x + 32, origin.y - 14);
    }

    // ── Vector legend ─────────────────────────────────────────────────────────
    const lx = W - padding.right - 10;
    const legendY = padding.top + 10;
    const items = [
      { color: '#0ea5e9', label: 'vₓ' },
      { color: '#f43f5e', label: 'vᵧ' },
      { color: resultColor, label: '|v|' },
    ];
    ctx.font = '10px Inter, sans-serif';
    items.forEach(({ color, label }, i) => {
      const y = legendY + i * 18;
      ctx.fillStyle = color;
      ctx.fillRect(lx - 60, y, 18, 3);
      ctx.fillStyle = subTextColor;
      ctx.textAlign = 'left';
      ctx.fillText(label, lx - 37, y + 4);
    });

  }, [trajectory, isDark, playing, angle, stats]);

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      draw();
      return;
    }

    let stopped = false;
    const DT = 0.02; // simulation timestep (seconds per frame index)

    const loop = (timestamp) => {
      if (stopped) return;
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const elapsed = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      // How many trajectory frames to advance per wall-clock second?
      // 1 sim-second → 1/DT frames; with speed multiplier
      const framesToAdvance = elapsed * speed / DT;
      frameRef.current = Math.min(
        Math.round(frameRef.current + framesToAdvance),
        trajectory.length - 1
      );

      draw();

      if (frameRef.current >= trajectory.length - 1) {
        setPlaying(false);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, trajectory, speed, draw]);

  // ── Canvas resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      draw();
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = 380;
    draw();
    return () => ro.disconnect();
  }, [draw]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    frameRef.current = 0;
    lastTimeRef.current = null;
    requestAnimationFrame(draw);
  }, [draw]);

  const handlePlay = useCallback(() => {
    if (frameRef.current >= trajectory.length - 1) {
      frameRef.current = 0;
    }
    lastTimeRef.current = null;
    setPlaying(true);
  }, [trajectory]);

  // ── Controls panel ──────────────────────────────────────────────────────────
  const controls = (
    <div className="space-y-4">
      <ControlSlider
        label="Launch Angle θ"
        value={angle}
        min={0} max={90} step={1}
        unit="°" decimals={0}
        onChange={v => { setAngle(v); handleReset(); }}
        accentColor={ACCENT}
      />
      <ControlSlider
        label="Initial Velocity v₀"
        value={v0}
        min={10} max={100} step={1}
        unit=" m/s" decimals={0}
        onChange={v => { setV0(v); handleReset(); }}
        accentColor={ACCENT}
      />
      <ControlSlider
        label="Gravity g"
        value={gravity}
        min={1.6} max={25} step={0.1}
        unit=" m/s²" decimals={2}
        onChange={v => { setGravity(v); handleReset(); }}
        accentColor={ACCENT}
      />
      {/* Gravity presets */}
      <div className="flex gap-1.5 flex-wrap">
        {GRAVITY_PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => { setGravity(p.value); handleReset(); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150
              ${Math.abs(gravity - p.value) < 0.05
                ? 'text-white'
                : 'bg-[#4A4A4A] dark:bg-slate-800 text-[#CBCBCB] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            style={Math.abs(gravity - p.value) < 0.05 ? { backgroundColor: ACCENT } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Air resistance toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={airResistance}
            onChange={e => { setAirResistance(e.target.checked); handleReset(); }}
          />
          <div
            className={`w-9 h-5 rounded-full transition-colors duration-200 ${airResistance ? '' : 'bg-slate-200 dark:bg-slate-700'}`}
            style={airResistance ? { backgroundColor: ACCENT } : {}}
          />
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#4A4A4A] rounded-full shadow transition-transform duration-200
            ${airResistance ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300">Air Resistance</span>
      </label>

      {/* Play controls */}
      <div className="pt-1">
        <PlayControls
          playing={playing}
          onPlay={handlePlay}
          onPause={() => setPlaying(false)}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
          accentColor={ACCENT}
        />
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-[#5A6B7A] dark:border-[#5A6B7A]">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#CBCBCB] mb-2">
          Statistics
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'Max Height', value: `${stats.maxH} m` },
            { label: 'Range',      value: `${stats.range} m` },
            { label: 'Time of Flight', value: `${stats.tof} s` },
            { label: 'Angle',      value: `${angle}°` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-xs">
              <span className="text-[#CBCBCB] dark:text-slate-400">{label}</span>
              <span className="font-mono font-semibold text-[#CBCBCB] dark:text-slate-200 px-1.5 py-0.5 rounded bg-[#4A4A4A] dark:bg-slate-800">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <VizContainer
      infoTooltip="Projectiles follow a parabolic path under gravity. The trajectory depends on initial velocity (speed + angle) and gravity. Air resistance can slow the projectile down."
      id="projectile"
      title="Projectile Motion"
      description="Launch a projectile and watch the parabolic arc. Toggle air resistance to see drag effects."
      formula="y = x\tan\theta - \frac{gx^2}{2v_0^2\cos^2\theta}"
      formulaLabel="Trajectory Equation"
      accentColor={ACCENT}
      controls={controls}
    >
      <canvas
        ref={canvasRef}
        height={380}
        className="w-full rounded-xl"
        style={{ display: 'block' }}
      />
    </VizContainer>
  );
}
