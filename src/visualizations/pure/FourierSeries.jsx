import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import VizContainer from '../../components/VizContainer';
import ControlSlider from '../../components/ControlSlider';

const TARGET_FUNCTIONS = [
  { id: 'square', name: 'Square Wave', f: (x) => Math.sign(Math.sin(x)) },
  { id: 'sawtooth', name: 'Sawtooth Wave', f: (x) => 2 * ((x / (2 * Math.PI)) - Math.floor(0.5 + x / (2 * Math.PI))) },
  { id: 'triangle', name: 'Triangle Wave', f: (x) => 2 * Math.abs(2 * ((x / (2 * Math.PI)) - Math.floor(0.5 + x / (2 * Math.PI)))) - 1 },
];

export default function FourierSeries() {
  const [targetId, setTargetId] = useState('square');
  const [numHarmonics, setNumHarmonics] = useState(3);
  const [showTarget, setShowTarget] = useState(true);
  const [showComponents, setShowComponents] = useState(false);

  const activeTarget = useMemo(() => TARGET_FUNCTIONS.find(t => t.id === targetId) || TARGET_FUNCTIONS[0], [targetId]);

  // Fourier coefficients logic
  const getCoefficients = (id, n) => {
    const coeffs = [];
    for (let i = 1; i <= n; i++) {
      if (id === 'square') {
        if (i % 2 !== 0) {
          coeffs.push({ n: i, A: 4 / (Math.PI * i) });
        } else {
          coeffs.push({ n: i, A: 0 });
        }
      } else if (id === 'sawtooth') {
        coeffs.push({ n: i, A: 2 * Math.pow(-1, i + 1) / (Math.PI * i) });
      } else if (id === 'triangle') {
        if (i % 2 !== 0) {
          coeffs.push({ n: i, A: (8 / (Math.PI * Math.PI)) * (Math.pow(-1, (i - 1) / 2) / (i * i)) });
        } else {
          coeffs.push({ n: i, A: 0 });
        }
      }
    }
    return coeffs;
  };

  const harmonics = getCoefficients(targetId, numHarmonics);

  // Data generation for Recharts
  const chartData = useMemo(() => {
    const data = [];
    const steps = 150; // 150 points for smooth curve
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 4 * Math.PI; // 2 full periods
      const targetVal = activeTarget.f(x);
      
      const pt = { x: x.toFixed(2), Target: targetVal, Sum: 0 };
      
      harmonics.forEach(h => {
        if (h.A !== 0) {
          const val = h.A * Math.sin(h.n * x);
          pt[`h${h.n}`] = val;
          pt.Sum += val;
        }
      });
      data.push(pt);
    }
    return data;
  }, [activeTarget, harmonics]);

  // Error calculation
  const rmsError = useMemo(() => {
    if (chartData.length === 0) return 0;
    let errorSq = 0;
    chartData.forEach(pt => {
      errorSq += Math.pow(pt.Target - pt.Sum, 2);
    });
    return Math.sqrt(errorSq / chartData.length);
  }, [chartData]);

  const controls = (
    <div className="space-y-4">
      <div>
        <span className="text-[12px] font-medium text-[#CBCBCB] mb-2 block">Target Waveform</span>
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          className="w-full bg-[#1a1f2e] text-white px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
        >
          {TARGET_FUNCTIONS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <ControlSlider
        label="Number of Harmonics (N)"
        value={numHarmonics}
        min={1} max={30} step={1} decimals={0}
        onChange={setNumHarmonics}
      />

      <div className="space-y-3 mt-4 bg-black/20 p-3 rounded-lg/50">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={showTarget} onChange={e => setShowTarget(e.target.checked)} className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#FFFFE3]" />
          <span className="text-[13px] text-[#CBCBCB]">Show Target Waveform</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={showComponents} onChange={e => setShowComponents(e.target.checked)} className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#FFFFE3]" />
          <span className="text-[13px] text-[#CBCBCB]">Show Individual Harmonics</span>
        </label>
      </div>

      <div className="bg-[#4A4A4A] rounded-lg p-3 text-center">
        <div className="text-[11px] font-medium text-[#CBCBCB] mb-1">RMS Error</div>
        <div className="text-white text-sm font-mono">
          {rmsError.toFixed(4)}
        </div>
      </div>
      
      <button
        onClick={() => { setTargetId('square'); setNumHarmonics(3); setShowTarget(true); setShowComponents(false); }}
        className="w-full py-2 rounded bg-[#F0F0F0] text-[#4A4A4A] text-sm font-bold hover:bg-[#4A4A4A] transition-colors mt-2"
      >
        Reset
      </button>
    </div>
  );

  return (
    <VizContainer
      infoTooltip="Fourier series allow any periodic function to be represented as an infinite sum of sine and cosine waves. Adding more harmonics improves the approximation."
      id="fourier-series"
      title="Fourier Series Synthesis"
      description="Watch how combining multiple sine waves can approximate complex shapes like a square or sawtooth wave."
      formula="f(x) \approx \sum_{n=1}^{N} A_n \sin(nx)"
      formulaLabel="Fourier Series (Sines)"
      controls={controls}
    >
      <div className="w-full h-[400px] bg-[#4A4A4A] rounded-lg flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#5A6B7A" opacity={0.3} />
            <XAxis dataKey="x" stroke="#CBCBCB" tick={{ fill: '#CBCBCB', fontSize: 12 }} />
            <YAxis domain={[-1.5, 1.5]} stroke="#CBCBCB" tick={{ fill: '#CBCBCB', fontSize: 12 }} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #5A6B7A', borderRadius: '8px' }}
              itemStyle={{ color: '#CBCBCB' }}
              labelStyle={{ color: '#fff' }}
            />
            
            {/* Target Waveform */}
            {showTarget && (
              <Line 
                type="step" // step for square, linear for others, but let's just use linear and let data handle it
                dataKey="Target" 
                stroke="rgba(255, 255, 255, 0.4)" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false} 
                isAnimationActive={false}
              />
            )}

            {/* Individual Harmonics */}
            {showComponents && harmonics.map(h => {
              if (h.A === 0) return null;
              return (
                <Line 
                  key={h.n}
                  type="monotone" 
                  dataKey={`h${h.n}`} 
                  stroke="rgba(109, 129, 150, 0.5)" 
                  strokeWidth={1} 
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}

            {/* Synthesized Sum */}
            <Line 
              type="monotone" 
              dataKey="Sum" 
              stroke="#FFFFE3" 
              strokeWidth={3} 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </VizContainer>
  );
}
