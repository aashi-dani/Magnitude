import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import VizContainer from '../../components/VizContainer';

export default function HyperbolicFunctions() {
  const [showSinh, setShowSinh] = useState(true);
  const [showCosh, setShowCosh] = useState(true);
  const [showTanh, setShowTanh] = useState(true);

  const data = useMemo(() => {
    const pts = [];
    for (let x = -3; x <= 3; x += 0.1) {
      pts.push({
        x: parseFloat(x.toFixed(1)),
        sinh: Math.sinh(x),
        cosh: Math.cosh(x),
        tanh: Math.tanh(x)
      });
    }
    return pts;
  }, []);

  const controls = (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={showSinh} onChange={e => setShowSinh(e.target.checked)} className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#3B82F6]" />
        <span className="text-[13px] text-[#CBCBCB]">sinh(x)</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={showCosh} onChange={e => setShowCosh(e.target.checked)} className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#10B981]" />
        <span className="text-[13px] text-[#CBCBCB]">cosh(x)</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={showTanh} onChange={e => setShowTanh(e.target.checked)} className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#F43F5E]" />
        <span className="text-[13px] text-[#CBCBCB]">tanh(x)</span>
      </label>

      <div className="bg-[#4A4A4A] rounded-lg p-3 mt-4 text-center">
        <div className="text-[11px] font-medium text-[#CBCBCB] mb-1">Fundamental Identity</div>
        <div className="text-white text-sm font-mono">
          cosh²(x) - sinh²(x) = 1
        </div>
      </div>
      
      <button
        onClick={() => { setShowSinh(true); setShowCosh(true); setShowTanh(true); }}
        className="w-full py-2 rounded bg-[#F0F0F0] text-[#4A4A4A] text-sm font-bold hover:bg-[#4A4A4A] transition-colors mt-2"
      >
        Reset
      </button>
    </div>
  );

  return (
    <VizContainer
      infoTooltip="Hyperbolic functions are analogs of the ordinary trigonometric functions, but defined using hyperbolas instead of circles."
      id="hyperbolic-functions"
      title="Hyperbolic Functions"
      description="Explore sinh, cosh, and tanh. They appear in solutions to linear differential equations, such as the shape of a hanging cable (catenary)."
      formula="\cosh^2(x) - \sinh^2(x) = 1"
      formulaLabel="Hyperbolic Identity"
      controls={controls}
    >
      <div className="w-full h-[400px] bg-[#4A4A4A] rounded-lg overflow-hidden flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5A6B7A" opacity={0.3} />
            <XAxis dataKey="x" stroke="#CBCBCB" tick={{ fill: '#CBCBCB', fontSize: 12 }} />
            <YAxis stroke="#CBCBCB" tick={{ fill: '#CBCBCB', fontSize: 12 }} domain={[-4, 4]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#3D3D3D', borderColor: '#5A6B7A', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#CBCBCB', marginBottom: '4px' }}
            />
            {showSinh && <Line type="monotone" dataKey="sinh" stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {showCosh && <Line type="monotone" dataKey="cosh" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={false} />}
            {showTanh && <Line type="monotone" dataKey="tanh" stroke="#F43F5E" strokeWidth={2} dot={false} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </VizContainer>
  );
}
