/**
 * src/visualizations/mechanics/DoublePendulum.jsx
 *
 * Double pendulum simulation using 4th-order Runge-Kutta integration.
 * State vector: [θ₁, ω₁, θ₂, ω₂]
 *
 * Equations of motion:
 *   α₁ = [-g(2m₁+m₂)sinθ₁ - m₂g sin(θ₁-2θ₂) - 2sin(Δθ)m₂(ω₂²l₂ + ω₁²l₁cosΔθ)]
 *         / [l₁(2m₁+m₂ - m₂cos2Δθ)]
 *   α₂ = [2sinΔθ(ω₁²l₁(m₁+m₂) + g(m₁+m₂)cosθ₁ + ω₂²l₂m₂cosΔθ)]
 *         / [l₂(2m₁+m₂ - m₂cos2Δθ)]
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import PlayControls from '../../components/PlayControls';
import VizContainer from '../../components/VizContainer';
import {
  rk4Step,
  doublePendulumDeriv,
  pendulumPositions,
  doublePendulumEnergy,
} from '../../utils/physicsUtils';

const ACCENT = '#6D8196';
const SCALE = 120; // pixels per meter
const DT = 0.016; // ~60fps timestep
const TRAIL_LENGTH = 300;
const PHASE_SIZE = 180; // phase plot canvas size

/** Clamp a value between min and max */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Convert degrees to radians */
const deg2rad = d => (d * Math.PI) / 180;

/** Build initial state from degrees */
const makeState = (θ1deg, θ2deg) => [
  deg2rad(θ1deg), 0,
  deg2rad(θ2deg), 0,
];

export default function DoublePendulum() {
  const { isDark } = useTheme();

  // ── Controls ────────────────────────────────────────────────────────────────
  const [theta1, setTheta1] = useState(-90);
  const [theta2, setTheta2] = useState(90);
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1);
  const [l1, setL1] = useState(1);
  const [l2, setL2] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showChaos, setShowChaos] = useState(false);

  // ── Simulation state (mutable refs for RAF loop) ────────────────────────────
  const canvasRef = useRef(null);
  const phaseRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(makeState(theta1, theta2));
  const state2Ref = useRef(null); // chaos comparison pendulum
  const trailRef = useRef([]);   // [{x, y}] positions of bob2
  const trail2Ref = useRef([]);
  const energyRef = useRef({ KE: 0, PE: 0, total: 0 });
  const phaseHistRef = useRef([]); // [{θ1, ω1}] for phase plot

  // React state for energy display (updated occasionally)
  const [energy, setEnergy] = useState({ KE: 0, PE: 0, total: 0 });
  const energyFrameCount = useRef(0);

  // ── Params object ────────────────────────────────────────────────────────────
  const paramsRef = useRef({ m1, m2, l1, l2, g: 9.81 });
  useEffect(() => {
    paramsRef.current = { m1, m2, l1, l2, g: 9.81 };
  }, [m1, m2, l1, l2]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetSim = useCallback(() => {
    setPlaying(false);
    stateRef.current = makeState(theta1, theta2);
    state2Ref.current = showChaos ? makeState(theta1 + 0.01, theta2) : null;
    trailRef.current = [];
    trail2Ref.current = [];
    phaseHistRef.current = [];
    setEnergy({ KE: 0, PE: 0, total: 0 });
  }, [theta1, theta2, showChaos]);

  // Reset when parameters change
  useEffect(() => { resetSim(); }, [theta1, theta2, m1, m2, l1, l2]);

  // Update chaos pendulum when toggled
  useEffect(() => {
    if (showChaos) {
      state2Ref.current = makeState(theta1 + 0.01, theta2);
      trail2Ref.current = [];
    } else {
      state2Ref.current = null;
      trail2Ref.current = [];
    }
  }, [showChaos, theta1, theta2]);

  // ── Main canvas draw ─────────────────────────────────────────────────────────
  const drawMain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const bg = isDark ? '#0f172a' : '#f8fafc';
    const rodColor = isDark ? '#94a3b8' : '#64748b';
    const pivotColor = isDark ? '#e2e8f0' : '#1e293b';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const origin = { x: W / 2, y: H * 0.28 };
    const params = paramsRef.current;

    // ── Subtle grid ──────────────────────────────────────────────────────────
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const state = stateRef.current;
    const { x1, y1, x2, y2 } = pendulumPositions(state, params, origin, SCALE);

    // ── Trail of bob 2 ────────────────────────────────────────────────────────
    const trail = trailRef.current;
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const frac = i / trail.length;
        const alpha = frac * frac * 0.85; // quadratic fade
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // ── Chaos pendulum trail (teal) ───────────────────────────────────────────
    if (showChaos && state2Ref.current) {
      const trail2 = trail2Ref.current;
      if (trail2.length > 1) {
        for (let i = 1; i < trail2.length; i++) {
          const frac = i / trail2.length;
          const alpha = frac * frac * 0.7;
          ctx.beginPath();
          ctx.moveTo(trail2[i - 1].x, trail2[i - 1].y);
          ctx.lineTo(trail2[i].x, trail2[i].y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Chaos bob 2
      const pos2 = pendulumPositions(state2Ref.current, params, origin, SCALE);
      ctx.beginPath();
      ctx.arc(pos2.x2, pos2.y2, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    }

    // ── Rod 1 ─────────────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = rodColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // ── Rod 2 ─────────────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = rodColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ── Bob 1 ─────────────────────────────────────────────────────────────────
    const r1 = 5 + m1 * 4;
    const g1 = ctx.createRadialGradient(x1 - 2, y1 - 2, 1, x1, y1, r1);
    g1.addColorStop(0, '#fde68a');
    g1.addColorStop(1, ACCENT);
    ctx.beginPath();
    ctx.arc(x1, y1, r1, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Bob 2 ─────────────────────────────────────────────────────────────────
    const r2 = 5 + m2 * 4;
    const g2 = ctx.createRadialGradient(x2 - 2, y2 - 2, 1, x2, y2, r2);
    g2.addColorStop(0, '#fda4af');
    g2.addColorStop(1, '#f43f5e');
    ctx.beginPath();
    ctx.arc(x2, y2, r2, 0, Math.PI * 2);
    ctx.fillStyle = g2;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Pivot point ───────────────────────────────────────────────────────────
    // Ceiling mounting
    ctx.fillStyle = pivotColor;
    ctx.fillRect(origin.x - 16, origin.y - 6, 32, 6);
    // Pivot circle
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = pivotColor;
    ctx.fill();

    // ── Angles indicator ──────────────────────────────────────────────────────
    const [θ1, ω1, θ2] = state;
    const subText = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = subText;
    ctx.textAlign = 'left';
    ctx.fillText(`θ₁: ${(θ1 * 180 / Math.PI).toFixed(1)}°  ω₁: ${ω1.toFixed(2)}`, 14, H - 38);
    ctx.fillText(`θ₂: ${(θ2 * 180 / Math.PI).toFixed(1)}°  ω₂: ${state[3].toFixed(2)}`, 14, H - 22);

  }, [isDark, showChaos]);

  // ── Phase space draw ─────────────────────────────────────────────────────────
  const drawPhase = useCallback(() => {
    const canvas = phaseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S = PHASE_SIZE;

    const bg = isDark ? '#0f172a' : '#f8fafc';
    const gridColor = 'rgba(203,203,203,0.12)';
    const axisColor = 'rgba(203,203,203,0.3)';
    const textColor = '#999999';

    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    [S / 4, S / 2, 3 * S / 4].forEach(v => {
      ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(S, v); ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.beginPath(); ctx.moveTo(0, S / 2); ctx.lineTo(S, S / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S / 2, 0); ctx.lineTo(S / 2, S); ctx.stroke();

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('θ₁', S / 2, S - 3);
    ctx.textAlign = 'left';
    ctx.fillText('ω₁', 3, 10);

    // Phase orbit
    const hist = phaseHistRef.current;
    if (hist.length > 1) {
      const θRange = Math.PI; // ±π shown
      const ωRange = 15;      // ±15 rad/s shown
      const toX = θ => clamp((θ + θRange) / (2 * θRange) * S, 0, S);
      const toY = ω => clamp(S - (ω + ωRange) / (2 * ωRange) * S, 0, S);

      ctx.beginPath();
      hist.forEach((pt, i) => {
        const px = toX(pt.θ1);
        const py = toY(pt.ω1);
        const frac = i / hist.length;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Current point
      const last = hist[hist.length - 1];
      ctx.beginPath();
      ctx.arc(toX(last.θ1), toY(last.ω1), 3, 0, Math.PI * 2);
      ctx.fillStyle = ACCENT;
      ctx.fill();
    }
  }, [isDark]);

  // ── Animation loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      drawMain();
      drawPhase();
      return;
    }

    let stopped = false;
    const params = paramsRef.current;

    // Steps per animation frame: we integrate multiple small dt steps
    // to keep numerical accuracy while allowing speed multiplier
    const stepsPerFrame = Math.max(1, Math.round(speed * 2));
    const dtStep = DT / stepsPerFrame;

    const loop = () => {
      if (stopped) return;

      for (let s = 0; s < stepsPerFrame; s++) {
        const dt = dtStep * speed;
        stateRef.current = rk4Step(
          stateRef.current, dt,
          st => doublePendulumDeriv(st, params)
        );
        if (state2Ref.current) {
          state2Ref.current = rk4Step(
            state2Ref.current, dt,
            st => doublePendulumDeriv(st, params)
          );
        }
      }

      // Update trails
      const canvasEl = canvasRef.current;
      if (canvasEl) {
        const origin = { x: canvasEl.width / 2, y: canvasEl.height * 0.28 };
        const { x2, y2 } = pendulumPositions(stateRef.current, params, origin, SCALE);
        trailRef.current.push({ x: x2, y: y2 });
        if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.shift();

        if (state2Ref.current) {
          const pos2 = pendulumPositions(state2Ref.current, params, origin, SCALE);
          trail2Ref.current.push({ x: pos2.x2, y: pos2.y2 });
          if (trail2Ref.current.length > TRAIL_LENGTH) trail2Ref.current.shift();
        }
      }

      // Update phase history
      const [θ1, ω1] = stateRef.current;
      phaseHistRef.current.push({ θ1, ω1 });
      if (phaseHistRef.current.length > 800) phaseHistRef.current.shift();

      // Energy (throttled update to React state)
      energyFrameCount.current++;
      if (energyFrameCount.current % 10 === 0) {
        const e = doublePendulumEnergy(stateRef.current, params);
        setEnergy({
          KE: e.KE.toFixed(2),
          PE: e.PE.toFixed(2),
          total: e.total.toFixed(2),
        });
      }

      drawMain();
      drawPhase();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, drawMain, drawPhase]);

  // ── Canvas resize & initial draw ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      drawMain();
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = 480;
    drawMain();
    return () => ro.disconnect();
  }, [drawMain]);

  useEffect(() => {
    const canvas = phaseRef.current;
    if (!canvas) return;
    canvas.width = PHASE_SIZE;
    canvas.height = PHASE_SIZE;
    drawPhase();
  }, [drawPhase]);

  const handleReset = useCallback(() => {
    resetSim();
    requestAnimationFrame(() => { drawMain(); drawPhase(); });
  }, [resetSim, drawMain, drawPhase]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);

  // ── Controls panel ────────────────────────────────────────────────────────────
  const controls = (
    <>
      {/* Row 1: angles */}
      <div className="w-full sm:w-48">
        <ControlSlider
          label="θ₁ Initial Angle"
          value={theta1}
          min={-180} max={180} step={1}
          unit="°" decimals={0}
          onChange={v => setTheta1(v)}
          accentColor={ACCENT}
        />
      </div>
      <div className="w-full sm:w-48">
        <ControlSlider
          label="θ₂ Initial Angle"
          value={theta2}
          min={-180} max={180} step={1}
          unit="°" decimals={0}
          onChange={v => setTheta2(v)}
          accentColor={ACCENT}
        />
      </div>

      {/* Row 2: masses */}
      <div className="w-full sm:w-48">
        <ControlSlider
          label="Mass 1 (m₁)"
          value={m1}
          min={0.5} max={3} step={0.1}
          unit=" kg" decimals={1}
          onChange={v => setM1(v)}
          accentColor={ACCENT}
        />
      </div>
      <div className="w-full sm:w-48">
        <ControlSlider
          label="Mass 2 (m₂)"
          value={m2}
          min={0.5} max={3} step={0.1}
          unit=" kg" decimals={1}
          onChange={v => setM2(v)}
          accentColor={ACCENT}
        />
      </div>

      {/* Row 3: lengths */}
      <div className="w-full sm:w-48">
        <ControlSlider
          label="Length 1 (l₁)"
          value={l1}
          min={0.5} max={2} step={0.05}
          unit=" m" decimals={2}
          onChange={v => setL1(v)}
          accentColor={ACCENT}
        />
      </div>
      <div className="w-full sm:w-48">
        <ControlSlider
          label="Length 2 (l₂)"
          value={l2}
          min={0.5} max={2} step={0.05}
          unit=" m" decimals={2}
          onChange={v => setL2(v)}
          accentColor={ACCENT}
        />
      </div>

      {/* Play controls */}
      <div className="w-full">
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

      {/* Chaos demo button */}
      <div className="w-full">
        <button
          onClick={() => setShowChaos(prev => !prev)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border
            ${showChaos
              ? 'text-white border-transparent'
              : 'bg-[#4A4A4A] dark:bg-slate-800 text-[#CBCBCB] dark:text-slate-300 border-[#5A6B7A] dark:border-[#5A6B7A] hover:border-emerald-400'
            }`}
          style={showChaos ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
        >
          {showChaos ? '🌀 Chaos Mode On' : '+ Add Chaos Pendulum'}
        </button>
        {showChaos && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-[#CBCBCB] leading-relaxed">
            Green pendulum starts at θ₁+0.01°. Watch divergence — the hallmark of chaos.
          </p>
        )}
      </div>

      {/* Energy readout */}
      <div className="w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#CBCBCB] mb-2">
          Energy (J)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'KE', value: energy.KE, color: '#0ea5e9' },
            { label: 'PE', value: energy.PE, color: '#f43f5e' },
            { label: 'Total', value: energy.total, color: ACCENT },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center p-2 rounded-lg bg-[#4A4A4A] dark:bg-slate-800">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
                {label}
              </span>
              <span className="font-mono text-xs font-bold text-[#CBCBCB] dark:text-slate-200">
                {value}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400 dark:text-[#CBCBCB]">
          Total energy conserved ≈ constant (no damping)
        </p>
      </div>
    </>
  );

  return (
    <VizContainer
      infoTooltip="Two pendulums connected together create complex, chaotic behavior. Small changes in initial angle lead to completely different paths—a hallmark of chaos."
      id="pendulum"
      title="Double Pendulum"
      description="A chaotic system. Start two pendulums at nearly identical angles and watch them diverge."
      formula="\ddot{\theta}_1 = -\frac{g(2m_1+m_2)\sin\theta_1 + \cdots}{l_1(2m_1+m_2-m_2\cos 2\Delta\theta)}"
      formulaLabel="Equations of Motion"
      accentColor={ACCENT}
      fullWidth={true}
      controls={controls}
    >
      {/* Main canvas + phase plot side by side */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main simulation canvas */}
        <div className="flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            height={480}
            className="w-full rounded-xl"
            style={{ display: 'block' }}
          />
        </div>

        {/* Phase space + info panel */}
        <div className="lg:w-52 flex flex-col gap-3">
          {/* Phase plot */}
          <div className="bg-[#4A4A4A] dark:bg-[#4A4A4A]/50 rounded-xl dark:border-[#5A6B7A] p-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-[#CBCBCB] mb-2 uppercase tracking-wider">
              Phase Space (θ₁ vs ω₁)
            </p>
            <canvas
              ref={phaseRef}
              width={PHASE_SIZE}
              height={PHASE_SIZE}
              className="w-full rounded-lg"
              style={{ display: 'block' }}
            />
          </div>

          {/* Chaos divergence indicator */}
          {showChaos && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                🌀 Sensitivity to Initial Conditions
              </p>
              <p className="text-[10px] text-[#CBCBCB] dark:text-slate-400 leading-relaxed">
                Δθ₁ = 0.01° initial difference grows exponentially — demonstrating the butterfly effect.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="bg-[#4A4A4A] dark:bg-[#4A4A4A]/50 rounded-xl dark:border-[#5A6B7A] p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-[#CBCBCB] uppercase tracking-wider mb-2">
              Legend
            </p>
            {[
              { color: ACCENT, label: 'Bob 1' },
              { color: '#f43f5e', label: 'Bob 2 (trail)' },
              ...(showChaos ? [{ color: '#10b981', label: 'Chaos Bob 2' }] : []),
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[#CBCBCB] dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VizContainer>
  );
}
