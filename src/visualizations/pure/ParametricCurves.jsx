// src/visualizations/pure/ParametricCurves.jsx
// Animated parametric curve drawer.
// Supported curves:
//   lissajous : x = A·sin(a·t + δ),  y = B·sin(b·t)
//   rose      : r = cos(k·t)  in polar
//   spiral    : r = a·t  (Archimedean)
//   cycloid   : x = r(t − sin t),    y = r(1 − cos t)
//   epicycloid: x = (R+r)cos t − r·cos((R+r)/r·t)

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import VizContainer from '../../components/VizContainer';
import ControlSlider from '../../components/ControlSlider';
import PlayControls from '../../components/PlayControls';

const ACCENT = '#6D8196';

// ----- Curve definitions -------------------------------------------------------

const CURVE_DEFS = {
  lissajous:  { label: 'Lissajous Figure',  tMax: 2 * Math.PI,       steps: 2000 },
  rose:       { label: 'Rose Curve',         tMax: 4 * Math.PI,       steps: 4000 },
  spiral:     { label: 'Archimedean Spiral', tMax: 6 * Math.PI,       steps: 3000 },
  cycloid:    { label: 'Cycloid',            tMax: 4 * Math.PI,       steps: 2000 },
  epicycloid: { label: 'Epicycloid',         tMax: 2 * Math.PI,       steps: 3000 },
};

/**
 * Compute the (x,y) point for a given curve type at parameter t.
 * Returns [x, y] in arbitrary units (will be scaled to canvas).
 */
function curvePoint(type, t, params) {
  const { a, b, delta, k, spiralA, R, r } = params;
  switch (type) {
    case 'lissajous':
      return [Math.sin(a * t + delta), Math.sin(b * t)];
    case 'rose': {
      const rho = Math.cos(k * t);
      return [rho * Math.cos(t), rho * Math.sin(t)];
    }
    case 'spiral':
      return [spiralA * t * Math.cos(t), spiralA * t * Math.sin(t)];
    case 'cycloid':
      return [t - Math.sin(t), 1 - Math.cos(t)];
    case 'epicycloid': {
      const rR = R + r;
      const ratio = rR / r;
      return [
        rR * Math.cos(t) - r * Math.cos(ratio * t),
        rR * Math.sin(t) - r * Math.sin(ratio * t),
      ];
    }
    default:
      return [0, 0];
  }
}

/** Compute all points for the full curve, return normalized to [-1,1] bounding box */
function buildCurvePoints(type, params) {
  const def = CURVE_DEFS[type];
  const pts = [];
  for (let i = 0; i <= def.steps; i++) {
    const t = (i / def.steps) * def.tMax;
    pts.push(curvePoint(type, t, params));
  }

  // Normalize to [-1,1]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const range  = Math.max(rangeX, rangeY);

  return pts.map(([x, y]) => [
    ((x - (minX + maxX) / 2) / range) * 2,
    ((y - (minY + maxY) / 2) / range) * 2,
  ]);
}

export default function ParametricCurves() {
  const { isDark } = useTheme();
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const progRef    = useRef(0); // animation progress 0..1

  const [curveType, setCurveType] = useState('lissajous');
  const [playing, setPlaying]     = useState(true);
  const [speed, setSpeed]         = useState(1);

  // Lissajous params
  const [la, setLa]       = useState(3);
  const [lb, setLb]       = useState(2);
  const [ldelta, setLdelta] = useState(Math.PI / 4);

  // Rose param
  const [roseK, setRoseK] = useState(5);

  // Pre-built points cache
  const ptsRef = useRef([]);

  // Build normalized curve points when params change
  const params = {
    a: la, b: lb, delta: ldelta,
    k: roseK,
    spiralA: 1 / (6 * Math.PI),
    R: 3, r: 1,
  };

  useEffect(() => {
    ptsRef.current = buildCurvePoints(curveType, params);
    progRef.current = 0;
  }, [curveType, la, lb, ldelta, roseK]);

  // ----- Drawing ---------------------------------------------------------------
  const draw = useCallback((progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const ox = W / 2;
    const oy = H / 2;
    const scale = Math.min(W, H) * 0.42;

    // Background
    ctx.fillStyle = isDark ? '#3D3D3D' : '#f5f5f0';
    ctx.fillRect(0, 0, W, H);

    const axisColor = 'rgba(203,203,203,0.3)';

    // Draw axes
    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
    ctx.restore();

    // Draw curve up to `progress`
    const pts = ptsRef.current;
    if (pts.length < 2) return;

    const endIdx = Math.max(1, Math.floor(progress * (pts.length - 1)));

    // Gradient stroke via segments
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.lineJoin  = 'round';

    for (let i = 1; i <= endIdx; i++) {
      const t  = i / pts.length; // normalized along curve
      const hue = (270 + t * 300) % 360;
      ctx.strokeStyle = `hsl(${hue},90%,${isDark ? 60 : 45}%)`;
      ctx.beginPath();
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      ctx.moveTo(ox + x0 * scale, oy - y0 * scale);
      ctx.lineTo(ox + x1 * scale, oy - y1 * scale);
      ctx.stroke();
    }
    ctx.restore();

    // Moving point at current tip
    const [cx, cy] = pts[Math.min(endIdx, pts.length - 1)];
    const px = ox + cx * scale;
    const py = oy - cy * scale;

    ctx.save();
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur  = 14;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Curve label
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font      = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(CURVE_DEFS[curveType].label, 12, 20);
  }, [isDark, curveType]);

  // ----- Animation loop --------------------------------------------------------
  useEffect(() => {
    let lastTime = null;

    function frame(ts) {
      if (lastTime !== null && playing) {
        const dt = (ts - lastTime) / 1000;
        progRef.current = Math.min(1, progRef.current + dt * speed * 0.3);
        if (progRef.current >= 1) progRef.current = 1;
      }
      lastTime = ts;
      draw(progRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, draw]);

  // Canvas resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = 380;
      draw(progRef.current);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = 380;
    return () => ro.disconnect();
  }, [draw]);

  // ----- Controls panel --------------------------------------------------------
  const controls = (
    <div className="space-y-4">
      {/* Curve selector */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300">Curve Type</p>
        <select
          value={curveType}
          onChange={e => { setCurveType(e.target.value); progRef.current = 0; }}
          className="w-full text-xs rounded-lg dark:border-[#5A6B7A]
            bg-[#4A4A4A] dark:bg-slate-800 text-[#CBCBCB] dark:text-slate-200 px-2 py-1.5"
        >
          <option value="lissajous">Lissajous Figure</option>
          <option value="rose">Rose Curve</option>
          <option value="spiral">Archimedean Spiral</option>
          <option value="cycloid">Cycloid</option>
          <option value="epicycloid">Epicycloid</option>
        </select>
      </div>

      {/* Curve-specific params */}
      {curveType === 'lissajous' && (
        <>
          <ControlSlider label="a (x freq)" value={la} min={1} max={8} step={1} decimals={0} onChange={setLa} accentColor={ACCENT} />
          <ControlSlider label="b (y freq)" value={lb} min={1} max={8} step={1} decimals={0} onChange={setLb} accentColor={ACCENT} />
          <ControlSlider label="δ (phase)" value={ldelta} min={0} max={Math.PI} step={0.05} decimals={2} unit=" rad" onChange={setLdelta} accentColor={ACCENT} />
        </>
      )}
      {curveType === 'rose' && (
        <ControlSlider label="k (petals)" value={roseK} min={1} max={12} step={1} decimals={0} onChange={setRoseK} accentColor={ACCENT} />
      )}

      <ControlSlider
        label="Speed"
        value={speed}
        min={0.1}
        max={4}
        step={0.1}
        decimals={1}
        unit="×"
        onChange={setSpeed}
        accentColor={ACCENT}
      />

      <PlayControls
        playing={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onReset={() => { progRef.current = 0; setPlaying(false); setTimeout(() => setPlaying(true), 50); }}
        accentColor={ACCENT}
        showSpeed={false}
      />
    </div>
  );

  // Derive formula label per curve
  const formulaMap = {
    lissajous:  '(x(t), y(t)) = (A\\sin(at+\\delta),\\, B\\sin(bt))',
    rose:       'r(\\theta) = \\cos(k\\theta)',
    spiral:     'r(\\theta) = a\\theta',
    cycloid:    '(x(t), y(t)) = (r(t-\\sin t),\\, r(1-\\cos t))',
    epicycloid: '(x(t), y(t)) = ((R+r)\\cos t - r\\cos\\tfrac{R+r}{r}t,\\, \\ldots)',
  };

  return (
    <VizContainer
      infoTooltip="These curves are defined by equations x = f(t), y = g(t). As t changes, the point (x,y) traces a path. Try different values of a and b to see how the curve changes."
      id="parametric-curves"
      title="Parametric Curves"
      description="Animate Lissajous figures, rose curves, spirals, and more."
      formula={formulaMap[curveType]}
      formulaLabel={CURVE_DEFS[curveType].label}
      accentColor={ACCENT}
      controls={controls}
    >
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg block"
        style={{ height: 380 }}
      />
    </VizContainer>
  );
}
