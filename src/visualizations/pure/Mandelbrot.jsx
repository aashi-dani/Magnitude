// src/visualizations/pure/Mandelbrot.jsx
// Canvas-based Mandelbrot set renderer with smooth coloring, incremental rendering,
// zoom/pan, and color schemes.
//
// Iteration formula:  z_{n+1} = z_n^2 + c,  starting from z_0 = 0
// Smooth coloring:    smoothIter = iter + 1 - log2(log2(|z|))

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import VizContainer from '../../components/VizContainer';
import ControlSlider from '../../components/ControlSlider';

const ACCENT = '#6D8196';

// ----- Color palette factories -----------------------------------------------

/**
 * Map a normalized float t ∈ [0,1] to an RGB triple for a given scheme.
 * @param {number} t - normalized smooth iteration count [0,1]
 * @param {string} scheme - 'classic' | 'fire' | 'ocean'
 * @param {number} offset - hue offset in degrees [0,360]
 * @returns {[number,number,number]} [r,g,b]
 */
function palette(t, scheme, offset) {
  let h, s, l;
  const th = (t * 360 + offset) % 360;
  if (scheme === 'classic') {
    h = th; s = 100; l = 50;
  } else if (scheme === 'fire') {
    // reds → oranges → yellows
    h = (th * 0.25) % 60;
    s = 100;
    l = 30 + t * 40;
  } else {
    // ocean: blues → cyans → teals
    h = (200 + th * 0.5) % 260;
    s = 80;
    l = 30 + t * 40;
  }
  return hslToRgb(h / 360, s / 100, l / 100);
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

// ----- Mandelbrot iteration ---------------------------------------------------

/**
 * Compute Mandelbrot iteration count for complex c = (cx + i·cy).
 * Returns { iter, zx2, zy2 } for smooth coloring.
 */
function mandelbrot(cx, cy, maxIter) {
  let zx = 0, zy = 0, zx2 = 0, zy2 = 0;
  let i = 0;
  while (i < maxIter && zx2 + zy2 < 4) {
    zy  = 2 * zx * zy + cy;
    zx  = zx2 - zy2 + cx;
    zx2 = zx * zx;
    zy2 = zy * zy;
    i++;
  }
  return { iter: i, zx2, zy2 };
}

export default function Mandelbrot() {
  const { isDark } = useTheme();
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const stateRef   = useRef(null); // holds current render job

  // View state
  const [view, setView] = useState({ xMin: -2.5, xMax: 1.0, yMin: -1.25, yMax: 1.25 });
  const [maxIter, setMaxIter]       = useState(100);
  const [colorOffset, setColorOffset] = useState(240);
  const [scheme, setScheme]         = useState('classic');
  const [progress, setProgress]     = useState(100); // 0-100
  const [zoom, setZoom]             = useState(1);

  // Pan drag
  const dragRef = useRef(null);

  // ----- Incremental render ---------------------------------------------------
  const startRender = useCallback((v, mi, co, sc) => {
    // Cancel previous job
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;

    const imgData = canvas.getContext('2d').createImageData(W, H);
    const data    = imgData.data;
    let row = 0;

    function renderRows() {
      const batchRows = Math.max(1, Math.floor(H / 20)); // render ~5% per frame
      for (let br = 0; br < batchRows && row < H; br++, row++) {
        const py = row;
        const cy = v.yMin + (py / H) * (v.yMax - v.yMin);
        for (let px = 0; px < W; px++) {
          const cx = v.xMin + (px / W) * (v.xMax - v.xMin);
          const { iter, zx2, zy2 } = mandelbrot(cx, cy, mi);

          const idx = (py * W + px) * 4;
          if (iter === mi) {
            // In-set → black
            data[idx] = data[idx + 1] = data[idx + 2] = 0;
            data[idx + 3] = 255;
          } else {
            // Smooth coloring
            const logZn   = Math.log(Math.sqrt(zx2 + zy2));
            const smooth  = iter + 1 - Math.log(logZn) / Math.log(2);
            const t       = Math.max(0, Math.min(1, smooth / mi));
            const [r, g, b] = palette(t, sc, co);
            data[idx]     = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
          }
        }
      }

      canvas.getContext('2d').putImageData(imgData, 0, 0);
      setProgress(Math.min(100, Math.round((row / H) * 100)));

      if (row < H) {
        rafRef.current = requestAnimationFrame(renderRows);
      }
    }

    setProgress(0);
    rafRef.current = requestAnimationFrame(renderRows);
  }, []);

  // Re-render whenever view or settings change
  useEffect(() => {
    startRender(view, maxIter, colorOffset, scheme);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [view, maxIter, colorOffset, scheme, startRender]);

  // Zoom helpers
  const zoomAt = useCallback((factor) => {
    setView(v => {
      const cx = (v.xMin + v.xMax) / 2;
      const cy = (v.yMin + v.yMax) / 2;
      const hw = (v.xMax - v.xMin) / 2 * factor;
      const hh = (v.yMax - v.yMin) / 2 * factor;
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
    setZoom(z => parseFloat((z / factor).toFixed(4)));
  }, []);

  const resetView = useCallback(() => {
    setView({ xMin: -2.5, xMax: 1.0, yMin: -1.25, yMax: 1.25 });
    setZoom(1);
  }, []);

  // Pan via mouse drag
  const onMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = { startX: e.clientX, startY: e.clientY, view: null };
    // Capture current view
    setView(v => {
      dragRef.current.view = v;
      return v;
    });
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current || !dragRef.current.view) return;
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const dx     = e.clientX - dragRef.current.startX;
    const dy     = e.clientY - dragRef.current.startY;
    const v      = dragRef.current.view;
    const scaleX = (v.xMax - v.xMin) / rect.width;
    const scaleY = (v.yMax - v.yMin) / rect.height;
    setView({
      xMin: v.xMin - dx * scaleX,
      xMax: v.xMax - dx * scaleX,
      yMin: v.yMin + dy * scaleY,
      yMax: v.yMax + dy * scaleY,
    });
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.view   = {
      xMin: v.xMin - dx * scaleX,
      xMax: v.xMax - dx * scaleX,
      yMin: v.yMin + dy * scaleY,
      yMax: v.yMax + dy * scaleY,
    };
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  // Canvas resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = 480;
      startRender(view, maxIter, colorOffset, scheme);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = 480;
    return () => ro.disconnect();
  }, []); // intentionally empty – startRender effect handles re-renders

  const centerX = ((view.xMin + view.xMax) / 2).toFixed(4);
  const centerY = ((view.yMin + view.yMax) / 2).toFixed(4);

  const controls = (
    <>
      <ControlSlider
        label="Max Iterations"
        value={maxIter}
        min={50}
        max={500}
        step={10}
        decimals={0}
        onChange={setMaxIter}
        accentColor={ACCENT}
      />
      <ControlSlider
        label="Color Offset"
        value={colorOffset}
        min={0}
        max={360}
        step={1}
        decimals={0}
        unit="°"
        onChange={setColorOffset}
        accentColor={ACCENT}
      />

      {/* Color Scheme */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-[#CBCBCB] dark:text-slate-300">Color Scheme</p>
        <select
          value={scheme}
          onChange={e => setScheme(e.target.value)}
          className="w-full text-xs rounded-lg dark:border-[#5A6B7A]
            bg-[#4A4A4A] dark:bg-slate-800 text-[#CBCBCB] dark:text-slate-200 px-2 py-1.5"
        >
          <option value="classic">Classic</option>
          <option value="fire">Fire</option>
          <option value="ocean">Ocean</option>
        </select>
      </div>

            {/* Zoom buttons */}
      <div className="space-y-2 mt-4 bg-[#1a1f2e] p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-[#FFFFFF]">Zoom Controls</p>
          <span className="text-xs font-bold text-[#CBCBCB] bg-[#4A4A4A] px-2 py-1 rounded">Zoom: {zoom.toFixed(2)}x</span>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => zoomAt(0.5)}
            className="w-[45px] h-[45px] rounded bg-[#6D8196] text-white text-2xl font-bold hover:bg-[#5A6B7A] transition-colors flex items-center justify-center shadow"
            title="Zoom In"
          >+</button>
          <button
            onClick={() => zoomAt(2)}
            className="w-[45px] h-[45px] rounded bg-[#6D8196] text-white text-2xl font-bold hover:bg-[#5A6B7A] transition-colors flex items-center justify-center shadow"
            title="Zoom Out"
          >−</button>
          <button
            onClick={resetView}
            className="flex-1 rounded bg-[#4A4A4A] text-[#FFFFFF] text-sm font-bold hover:bg-[#5A6B7A] transition-colors shadow"
          >Reset View</button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-[#4A4A4A] dark:bg-[#4A4A4A]/60 dark:border-[#5A6B7A] p-3 space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-[#CBCBCB]">Zoom</span>
          <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{zoom.toFixed(2)}×</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#CBCBCB]">Center Re</span>
          <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{centerX}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#CBCBCB]">Center Im</span>
          <span className="font-semibold text-[#CBCBCB] dark:text-slate-200">{centerY}i</span>
        </div>
      </div>
    </>
  );

  return (
    <VizContainer
      infoTooltip="The Mandelbrot set shows which complex numbers c stay bounded when you repeatedly apply z → z² + c. Colors indicate how quickly each point escapes to infinity."
      id="mandelbrot"
      title="Mandelbrot & Julia Sets"
      description="Explore the infinite fractal boundary. Click and drag to pan, use +/− to zoom."
      formula="z_{n+1} = z_n^2 + c"
      formulaLabel="Mandelbrot Iteration"
      accentColor={ACCENT}
      controls={controls}
      fullWidth={true}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg block cursor-crosshair"
          style={{ height: 480 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        {/* Progress bar */}
        {progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 rounded-b-lg overflow-hidden">
            <div
              className="h-full transition-none"
              style={{ width: `${progress}%`, backgroundColor: ACCENT }}
            />
          </div>
        )}
        {/* Overlay hint */}
        <div className="absolute top-3 left-3 text-[10px] text-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
          Drag to pan · +/− to zoom
        </div>
      </div>
    </VizContainer>
  );
}
