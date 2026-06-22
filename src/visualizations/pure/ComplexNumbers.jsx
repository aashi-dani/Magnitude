// src/visualizations/pure/ComplexNumbers.jsx
// Argand-plane visualizer for complex numbers.
// Mode 1 – 'euler':   animate z = e^(iθ) around the unit circle
// Mode 2 – 'multiply': display z1, z2, and their product z1·z2 as static vectors

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import VizContainer from '../../components/VizContainer';
import ControlSlider from '../../components/ControlSlider';
import PlayControls from '../../components/PlayControls';

const ACCENT = '#6D8196';
const RED    = '#f43f5e';
const GREEN  = '#10b981';
const BLUE   = '#6D8196';

/** Convert polar coords to canvas pixels given origin + scale */
function toCanvas(re, im, ox, oy, scale) {
  return [ox + re * scale, oy - im * scale];
}

/** Draw an arrowhead at (x2,y2) pointing from (x1,y1) */
function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth = 2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
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

/** Draw dashed projection lines */
function drawDashed(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export default function ComplexNumbers() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  // Mode
  const [mode, setMode] = useState('euler'); // 'euler' | 'multiply'

  // Euler mode state
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed]     = useState(1);
  const thetaRef              = useRef(0);
  const [thetaDeg, setThetaDeg] = useState(0);

  // Multiply mode state
  const [r1, setR1]       = useState(1.2);
  const [theta1, setTheta1] = useState(45);
  const [r2, setR2]       = useState(0.8);
  const [theta2, setTheta2] = useState(110);

  // ----- Drawing ----------------------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const ox = W / 2;
    const oy = H / 2;
    const scale = Math.min(W, H) * 0.3;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#3D3D3D' : '#f5f5f0';
    ctx.fillRect(0, 0, W, H);

    const gridColor = 'rgba(203,203,203,0.15)';
    const axisColor = 'rgba(203,203,203,0.35)';
    const labelColor = isDark ? '#94a3b8' : '#64748b';

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    const maxUnit = Math.ceil(Math.max(ox, oy) / scale) + 1;
    for (let i = -maxUnit; i <= maxUnit; i++) {
      if (i === 0) continue;
      // vertical
      ctx.beginPath();
      ctx.moveTo(ox + i * scale, 0);
      ctx.lineTo(ox + i * scale, H);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, oy + i * scale);
      ctx.lineTo(W, oy + i * scale);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();

    // Axis labels
    ctx.fillStyle = labelColor;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = -maxUnit; i <= maxUnit; i++) {
      if (i === 0) continue;
      // real axis tick labels
      ctx.fillText(i, ox + i * scale, oy + 14);
      // imaginary axis tick labels
      ctx.textAlign = 'right';
      ctx.fillText(i === 1 ? 'i' : i === -1 ? '-i' : `${i}i`, ox - 6, oy - i * scale + 4);
      ctx.textAlign = 'center';
    }
    ctx.fillText('Re', W - 18, oy - 8);
    ctx.textAlign = 'left';
    ctx.fillText('Im', ox + 6, 14);
    ctx.textAlign = 'center';

    // Unit circle
    ctx.save();
    ctx.strokeStyle = isDark ? '#4c1d95' : '#c4b5fd';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(ox, oy, scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // ----- EULER MODE -----
    if (mode === 'euler') {
      const θ = thetaRef.current;
      const re = Math.cos(θ);
      const im = Math.sin(θ);
      const [px, py] = toCanvas(re, im, ox, oy, scale);

      // Radius vector
      drawArrow(ctx, ox, oy, px, py, ACCENT, 2.5);

      // Dashed projection to real axis (cos θ)
      drawDashed(ctx, px, py, px, oy, isDark ? '#f43f5e88' : '#f43f5eaa');
      // Dashed projection to imaginary axis (sin θ)
      drawDashed(ctx, px, py, ox, py, isDark ? '#10b98188' : '#10b981aa');

      // cos θ segment on real axis
      ctx.save();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(px, oy);
      ctx.stroke();
      ctx.restore();

      // sin θ segment on imaginary axis
      ctx.save();
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, py);
      ctx.stroke();
      ctx.restore();

      // The point z
      ctx.save();
      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Label z
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`z = e^(iθ)`, px + 10, py - 6);

    // ----- MULTIPLY MODE -----
    } else {
      const t1 = (theta1 * Math.PI) / 180;
      const t2 = (theta2 * Math.PI) / 180;
      const re1 = r1 * Math.cos(t1), im1 = r1 * Math.sin(t1);
      const re2 = r2 * Math.cos(t2), im2 = r2 * Math.sin(t2);
      const rp  = r1 * r2;
      const tp  = t1 + t2;
      const rep = rp * Math.cos(tp), imp = rp * Math.sin(tp);

      const [px1, py1] = toCanvas(re1, im1, ox, oy, scale);
      const [px2, py2] = toCanvas(re2, im2, ox, oy, scale);
      const [pxp, pyp] = toCanvas(rep, imp, ox, oy, scale);

      // Draw arcs for angles
      const drawArc = (theta, color) => {
        ctx.save();
        ctx.strokeStyle = color + '66';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(ox, oy, 28, 0, -theta, theta < 0);
        ctx.stroke();
        ctx.restore();
      };
      drawArc(t1, BLUE);
      drawArc(t2, GREEN);
      drawArc(tp, ACCENT);

      drawArrow(ctx, ox, oy, px1, py1, BLUE, 2.5);
      drawArrow(ctx, ox, oy, px2, py2, GREEN, 2.5);
      drawArrow(ctx, ox, oy, pxp, pyp, ACCENT, 3);

      // Labels
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = BLUE;
      ctx.textAlign = 'left';
      ctx.fillText(`z₁ (r=${r1.toFixed(1)}, θ=${theta1}°)`, px1 + 8, py1 - 6);
      ctx.fillStyle = GREEN;
      ctx.fillText(`z₂ (r=${r2.toFixed(1)}, θ=${theta2}°)`, px2 + 8, py2 - 6);
      ctx.fillStyle = ACCENT;
      ctx.fillText(`z₁·z₂ (r=${rp.toFixed(2)}, θ=${Math.round((tp * 180) / Math.PI)}°)`, pxp + 8, pyp - 6);

      // Dot for product
      ctx.save();
      ctx.fillStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pxp, pyp, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Dots for z1, z2
      [{ px: px1, py: py1, c: BLUE }, { px: px2, py: py2, c: GREEN }].forEach(({ px, py, c }) => {
        ctx.save();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });
    }
  }, [isDark, mode, r1, theta1, r2, theta2]);

  // ----- Animation loop --------------------------------------------------------
  useEffect(() => {
    if (mode !== 'euler') { draw(); return; }

    let lastTime = null;

    function frame(ts) {
      if (lastTime !== null && playing) {
        const dt = (ts - lastTime) / 1000; // seconds
        thetaRef.current = (thetaRef.current + dt * speed) % (2 * Math.PI);
        setThetaDeg(Math.round((thetaRef.current * 180) / Math.PI));
      }
      lastTime = ts;
      draw();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, mode, draw]);

  // Redraw multiply mode on state change
  useEffect(() => {
    if (mode === 'multiply') draw();
  }, [mode, draw, r1, theta1, r2, theta2, isDark]);

  // ----- Canvas resize observer -------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = 360;
      draw();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = 360;
    return () => ro.disconnect();
  }, [draw]);

  // ----- Derived readouts (euler mode) -----------------------------------------
  const θ   = thetaRef.current;
  const cosθ = Math.cos(θ).toFixed(4);
  const sinθ = Math.sin(θ).toFixed(4);

  // ----- Controls panel --------------------------------------------------------
  const controls = (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#CBCBCB] mb-2">Mode</p>
        <div className="flex gap-2">
          {['euler', 'multiply'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                mode === m ? 'text-white' : 'bg-[#4A4A4A] dark:bg-slate-800 text-[#CBCBCB] dark:text-slate-400'
              }`}
              style={mode === m ? { backgroundColor: ACCENT } : {}}
            >
              {m === 'euler' ? 'Euler Mode' : 'Multiply Mode'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'euler' ? (
        <>
          <PlayControls
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onReset={() => { thetaRef.current = 0; setThetaDeg(0); }}
            accentColor={ACCENT}
            showSpeed={false}
          />
          <ControlSlider
            label="Speed"
            value={speed}
            min={0.1}
            max={3}
            step={0.1}
            decimals={1}
            unit="×"
            onChange={setSpeed}
            accentColor={ACCENT}
          />
          {/* Real-time readouts */}
          <div className="bg-[#4A4A4A] text-white text-[13px] font-normal p-3 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-[#CBCBCB]">θ</span>
              <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{thetaDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: RED }}>cos θ</span>
              <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{cosθ}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: GREEN }}>sin θ</span>
              <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{sinθ}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <ControlSlider label="r₁" value={r1} min={0.2} max={2} step={0.05} decimals={2} onChange={setR1} accentColor={BLUE} />
          <ControlSlider label="θ₁" value={theta1} min={0} max={360} step={1} decimals={0} unit="°" onChange={setTheta1} accentColor={BLUE} />
          <ControlSlider label="r₂" value={r2} min={0.2} max={2} step={0.05} decimals={2} onChange={setR2} accentColor={GREEN} />
          <ControlSlider label="θ₂" value={theta2} min={0} max={360} step={1} decimals={0} unit="°" onChange={setTheta2} accentColor={GREEN} />
          {/* Product readout */}
          <div className="bg-[#4A4A4A] text-white text-[13px] font-normal p-3 rounded-lg space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Product z₁·z₂</p>
            <div className="flex justify-between">
              <span className="text-[#CBCBCB]">|z₁·z₂|</span>
              <span className="font-semibold" style={{ color: ACCENT }}>{(r1 * r2).toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#CBCBCB]">arg</span>
              <span className="font-semibold" style={{ color: ACCENT }}>{(theta1 + theta2) % 360}°</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <VizContainer
      infoTooltip="A complex number z = a + bi can be plotted on a 2D plane. Rotating or multiplying changes its position. Euler's formula shows e^(iθ) = cos(θ) + i·sin(θ)."
      id="complex-numbers"
      title="Complex Numbers in the Plane"
      description="Visualize Euler's formula and complex multiplication geometrically"
      formula="e^{i\theta} = \cos\theta + i\sin\theta"
      formulaLabel="Euler's Formula"
      accentColor={ACCENT}
      controls={controls}
    >
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg block"
        style={{ height: 360 }}
      />
    </VizContainer>
  );
}
