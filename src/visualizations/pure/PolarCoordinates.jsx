import { useState, useRef, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';
import ControlSlider from '../../components/ControlSlider';

const PRESETS = [
  { id: 'rose', name: 'Rose Curve', desc: 'r(\\theta) = \\cos(k\\theta)', r: (theta, k) => Math.cos(k * theta), defaultK: 3 },
  { id: 'cardioid', name: 'Cardioid', desc: 'r(\\theta) = 1 + \\cos(\\theta)', r: (theta) => 1 + Math.cos(theta), defaultK: 1 },
  { id: 'limacon', name: 'Limaçon', desc: 'r(\\theta) = 1 + c\\cos(\\theta)', r: (theta, k) => 1 + k * Math.cos(theta), defaultK: 1.5 },
  { id: 'spiral', name: 'Archimedean Spiral', desc: 'r(\\theta) = c\\theta', r: (theta, k) => k * theta, defaultK: 0.2 },
];

export default function PolarCoordinates() {
  const canvasRef = useRef(null);
  const [presetId, setPresetId] = useState('rose');
  const [maxTheta, setMaxTheta] = useState(2 * Math.PI);
  const [kParam, setKParam] = useState(3);
  const [showCartesian, setShowCartesian] = useState(false);
  
  const activePreset = useMemo(() => PRESETS.find(p => p.id === presetId) || PRESETS[0], [presetId]);

  // Update k when preset changes
  useEffect(() => {
    setKParam(activePreset.defaultK);
    setMaxTheta(presetId === 'spiral' ? 6 * Math.PI : 2 * Math.PI);
  }, [presetId, activePreset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.22;

    ctx.clearRect(0, 0, width, height);

    // Draw Grids
    ctx.lineWidth = 1;
    if (showCartesian) {
      ctx.strokeStyle = 'rgba(203,203,203,0.1)';
      ctx.beginPath();
      for(let x = 0; x < width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for(let y = 0; y < height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(203,203,203,0.1)';
      ctx.beginPath();
      for(let r = 1; r <= 4; r++) {
        ctx.arc(cx, cy, r * scale, 0, 2 * Math.PI);
      }
      for(let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle)*4*scale, cy + Math.sin(angle)*4*scale);
      }
      ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = '#5A6B7A';
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();

    // Draw Curve
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFE3';
    ctx.lineWidth = 2;
    const steps = 500;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * maxTheta;
      const rVal = activePreset.r(theta, kParam);
      const x = cx + rVal * Math.cos(theta) * scale;
      const y = cy - rVal * Math.sin(theta) * scale; // negative y is up
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

  }, [activePreset, maxTheta, kParam, showCartesian]);

  const controls = (
    <>
      <div>
        <span className="text-[12px] font-medium text-[#CBCBCB] mb-2 block">Curve Type</span>
        <select
          value={presetId}
          onChange={e => setPresetId(e.target.value)}
          className="w-full bg-[#4A4A4A] text-white rounded-lg p-2 text-sm"
        >
          {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <ControlSlider
        label="k Parameter"
        value={kParam}
        min={0.1} max={10} step={0.1} decimals={1}
        onChange={setKParam}
      />

      <ControlSlider
        label="θ Max (radians)"
        value={maxTheta}
        min={Math.PI} max={10 * Math.PI} step={0.1} decimals={1}
        onChange={setMaxTheta}
      />

      
      <label className="flex items-center gap-3 cursor-pointer mt-2 mb-4">
        <input
          type="checkbox"
          checked={showCartesian}
          onChange={e => setShowCartesian(e.target.checked)}
          className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#FFFFE3]"
        />
        <span className="text-[13px] text-[#CBCBCB]">Overlay Cartesian Grid</span>
      </label>

      <button
        onClick={() => { setPresetId('rose'); setMaxTheta(2 * Math.PI); setKParam(3); setShowCartesian(false); }}
        className="w-full py-2 rounded bg-[#F0F0F0] text-[#4A4A4A] text-sm font-bold hover:bg-[#4A4A4A] transition-colors"
      >
        Reset
      </button>

    </>
  );

  return (
    <VizContainer
      infoTooltip="Polar coordinates represent points using an angle (θ) and distance from the origin (r). They are especially useful for drawing circular or spiraling curves."
      id="polar-coordinates"
      title="Polar Coordinates"
      description="Watch how curves emerge naturally when radius r is defined as a function of angle θ."
      formula={activePreset.desc}
      formulaLabel={activePreset.name}
      controls={controls}
    >
      <div className="w-full h-[400px] bg-[#4A4A4A] rounded-lg overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full object-contain"
        />
      </div>
    </VizContainer>
  );
}
