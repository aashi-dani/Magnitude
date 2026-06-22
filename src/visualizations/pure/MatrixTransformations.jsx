import { useState, useRef, useEffect } from 'react';
import VizContainer from '../../components/VizContainer';

const PRESETS = [
  { name: 'Identity', a: 1, b: 0, c: 0, d: 1 },
  { name: 'Scale (x2)', a: 2, b: 0, c: 0, d: 2 },
  { name: 'Shear X', a: 1, b: 1, c: 0, d: 1 },
  { name: 'Shear Y', a: 1, b: 0, c: 1, d: 1 },
  { name: 'Reflection (Y-axis)', a: -1, b: 0, c: 0, d: 1 },
  { name: 'Reflection (X-axis)', a: 1, b: 0, c: 0, d: -1 },
  { name: 'Rotate 90°', a: 0, b: -1, c: 1, d: 0 },
  { name: 'Rotate 45°', a: 0.707, b: -0.707, c: 0.707, d: 0.707 },
];

export default function MatrixTransformations() {
  const canvasRef = useRef(null);
  
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);

  // Original shape points (a house)
  const baseShape = [
    {x: 0, y: 0},
    {x: 2, y: 0},
    {x: 2, y: 2},
    {x: 1, y: 3},
    {x: 0, y: 2},
    {x: 0, y: 0}
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 30; // pixels per unit

    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(203,203,203,0.1)';
    ctx.beginPath();
    for(let x = cx % scale; x < width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for(let y = cy % scale; y < height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();

    // Draw Axes
    ctx.strokeStyle = '#5A6B7A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();

    // Helper to transform point
    const transform = (p) => ({
      x: cx + (a * p.x + b * p.y) * scale,
      y: cy - (c * p.x + d * p.y) * scale // invert y for canvas
    });

    // Helper to normal point
    const normal = (p) => ({
      x: cx + p.x * scale,
      y: cy - p.y * scale
    });

    // Draw Original Shape (dashed, grey)
    ctx.beginPath();
    ctx.strokeStyle = '#CBCBCB';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    baseShape.forEach((p, i) => {
      const np = normal(p);
      if (i === 0) ctx.moveTo(np.x, np.y);
      else ctx.lineTo(np.x, np.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Transformed Shape (solid, accent)
    ctx.beginPath();
    ctx.strokeStyle = '#6D8196'; // Ink wash blue
    ctx.fillStyle = 'rgba(109, 129, 150, 0.2)';
    ctx.lineWidth = 3;
    baseShape.forEach((p, i) => {
      const tp = transform(p);
      if (i === 0) ctx.moveTo(tp.x, tp.y);
      else ctx.lineTo(tp.x, tp.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw basis vectors
    const iHat = transform({x: 1, y: 0});
    const jHat = transform({x: 0, y: 1});

    // i-hat
    ctx.beginPath();
    ctx.strokeStyle = '#10b981'; // green
    ctx.moveTo(cx, cy); ctx.lineTo(iHat.x, iHat.y);
    ctx.stroke();

    // j-hat
    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e'; // red
    ctx.moveTo(cx, cy); ctx.lineTo(jHat.x, jHat.y);
    ctx.stroke();

  }, [a, b, c, d]);

  const setPreset = (p) => {
    setA(p.a); setB(p.b); setC(p.c); setD(p.d);
  };

  
  const det = a * d - b * c;
  const trace = a + d;

  const controls = (

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[12px] font-medium text-[#CBCBCB] block mb-1">a (x scale)</label>
          <input type="number" step="0.1" value={a} onChange={e => setA(parseFloat(e.target.value)||0)}
                 className="w-full bg-[#4A4A4A] text-white rounded-lg p-2 text-sm text-center" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#CBCBCB] block mb-1">b (x shear)</label>
          <input type="number" step="0.1" value={b} onChange={e => setB(parseFloat(e.target.value)||0)}
                 className="w-full bg-[#4A4A4A] text-white rounded-lg p-2 text-sm text-center" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#CBCBCB] block mb-1">c (y shear)</label>
          <input type="number" step="0.1" value={c} onChange={e => setC(parseFloat(e.target.value)||0)}
                 className="w-full bg-[#4A4A4A] text-white rounded-lg p-2 text-sm text-center" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#CBCBCB] block mb-1">d (y scale)</label>
          <input type="number" step="0.1" value={d} onChange={e => setD(parseFloat(e.target.value)||0)}
                 className="w-full bg-[#4A4A4A] text-white rounded-lg p-2 text-sm text-center" />
        </div>
      </div>

      <div>
        <span className="text-[12px] font-medium text-[#CBCBCB] mb-2 block">Presets</span>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => setPreset(p)}
              className="py-1 px-2 rounded bg-[#4A4A4A] text-white text-[11px] font-medium hover:bg-[#5A6B7A] transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#4A4A4A] rounded-lg p-3 text-center">
        <div className="text-[11px] font-medium text-[#CBCBCB] mb-1">Matrix Properties</div>
        <div className="text-white text-sm font-mono">
          det(A) = {det.toFixed(2)} &nbsp;|&nbsp; trace(A) = {trace.toFixed(2)}
        </div>
      </div>

      <button
        onClick={() => setPreset(PRESETS[0])}
        className="w-full py-2 rounded bg-[#F0F0F0] text-[#4A4A4A] text-sm font-bold hover:bg-[#4A4A4A] transition-colors mt-2"
      >
        Reset
      </button>
    </div>
  );

  return (
    <VizContainer
      infoTooltip="A 2x2 matrix transforms 2D space. The first column tells you where the i-hat (x-axis) vector lands, and the second column tells you where the j-hat (y-axis) vector lands."
      id="matrix-transformations"
      title="Matrix Transformations"
      description="See how 2x2 matrices stretch, shear, and rotate 2D space linearly."
      formula="\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix}"
      formulaLabel="Linear Transformation"
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
