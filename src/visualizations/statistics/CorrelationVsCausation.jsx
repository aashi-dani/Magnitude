import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const SCENARIOS = [
  { id: 'icecream', label: 'Ice Cream vs Drowning', xLabel: 'Ice Cream Sales', yLabel: 'Drownings', zLabel: 'Temperature' },
  { id: 'shoes', label: 'Shoe Size vs Reading Ability', xLabel: 'Shoe Size', yLabel: 'Reading Score', zLabel: 'Age' },
  { id: 'cage', label: 'Nicolas Cage Films vs Pool Drownings', xLabel: 'Nicolas Cage Films', yLabel: 'Pool Drownings', zLabel: 'Year' },
  { id: 'coffee', label: 'Coffee vs Heart Disease', xLabel: 'Coffee Consumption', yLabel: 'Heart Disease', zLabel: 'Stress/Smoking' }
];

export default function CorrelationVsCausation() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [noise, setNoise] = useState(0.5);
  const [showConfounding, setShowConfounding] = useState(false);
  const [showRegression, setShowRegression] = useState(false);
  const [data, setData] = useState([]);

  const [isCustom, setIsCustom] = useState(false);
  const [customLabels, setCustomLabels] = useState({
    name: 'Custom Scenario',
    xLabel: 'Variable A',
    yLabel: 'Variable B',
    zLabel: 'Confounding Factor'
  });

  const activeScenario = isCustom ? { id: 'custom', label: customLabels.name, ...customLabels } : scenario;

  const generateData = () => {
    const newData = [];
    for (let i = 0; i < 100; i++) {
      const z = Math.random(); // Confounding variable 0 to 1
      const nx = (Math.random() - 0.5) * 2;
      const ny = (Math.random() - 0.5) * 2;
      const x = z + nx * noise;
      const y = z + ny * noise;
      newData.push({ id: i, x, y, z });
    }
    setData(newData);
  };

  useEffect(() => {
    generateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, isCustom, noise]);

  const handleReset = () => {
    setIsCustom(false);
    setScenario(SCENARIOS[0]);
    setNoise(0.5);
    setShowConfounding(false);
    setShowRegression(false);
    setTimeout(generateData, 0);
  };

  const stats = useMemo(() => {
    if (data.length === 0) return { r2: 0, m: 0, c: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    data.forEach(d => {
      sumX += d.x; sumY += d.y;
      sumXY += d.x * d.y; sumX2 += d.x * d.x; sumY2 += d.y * d.y;
      if (d.x < minX) minX = d.x; if (d.x > maxX) maxX = d.x;
      if (d.y < minY) minY = d.y; if (d.y > maxY) maxY = d.y;
    });

    const meanX = sumX / n; const meanY = sumY / n;
    const numerator = (n * sumXY - sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denominator === 0 ? 0 : numerator / denominator;
    const r2 = r * r;

    const m = (n * sumX2 - sumX * sumX) === 0 ? 0 : (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const c = meanY - m * meanX;
    
    const padX = (maxX - minX) * 0.1 || 1;
    const padY = (maxY - minY) * 0.1 || 1;

    return { r2, m, c, minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [data]);

  const getPointColor = (z) => {
    if (!showConfounding) return '#6D8196';
    const hue = (1 - z) * 240; 
    return `hsl(${hue}, 70%, 50%)`;
  };

  const width = 600; const height = 400; const padding = 60;
  const scaleX = (x) => padding + ((x - stats.minX) / (stats.maxX - stats.minX)) * (width - 2 * padding);
  const scaleY = (y) => height - padding - ((y - stats.minY) / (stats.maxY - stats.minY)) * (height - 2 * padding);

  return (
    <VizContainer 
      title="Correlation vs Causation" 
      infoTooltip="Correlation measures how two variables move together. High correlation doesn't prove causation—a hidden third variable (confounder) might drive both. Always ask: 'What else could explain this relationship?'"
      formula="r^2 = \text{correlation coefficient (0 to 1)}"
      formulaLabel="Correlation Strength"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Scenario</label>
            <select 
              className="p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded-md" 
              value={isCustom ? 'custom' : scenario.id} 
              onChange={(e) => {
                if (e.target.value === 'custom') setIsCustom(true);
                else {
                  setIsCustom(false);
                  setScenario(SCENARIOS.find(s => s.id === e.target.value));
                }
              }}
            >
              {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              <option value="custom">Custom Scenario...</option>
            </select>
          </div>

          {isCustom && (
            <div className="flex flex-col gap-2 p-3 bg-[#4A4A4A] rounded">
              <input 
                type="text" 
                placeholder="Scenario Name"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.name}
                onChange={e => setCustomLabels({...customLabels, name: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && generateData()}
              />
              <input 
                type="text" 
                placeholder="Variable A (X-axis)"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.xLabel}
                onChange={e => setCustomLabels({...customLabels, xLabel: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && generateData()}
              />
              <input 
                type="text" 
                placeholder="Variable B (Y-axis)"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.yLabel}
                onChange={e => setCustomLabels({...customLabels, yLabel: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && generateData()}
              />
              <input 
                type="text" 
                placeholder="Hidden Factor"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.zLabel}
                onChange={e => setCustomLabels({...customLabels, zLabel: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && generateData()}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB] flex justify-between">
              <span>Add Noise</span>
              <span>{noise.toFixed(2)}</span>
            </label>
            <input type="range" min="0.3" max="0.9" step="0.01" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="showConf" checked={showConfounding} onChange={(e) => setShowConfounding(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="showConf" className="text-sm text-[#CBCBCB]">Show confounding variable</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="showReg" checked={showRegression} onChange={(e) => setShowRegression(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="showReg" className="text-sm text-[#CBCBCB]">Show regression line</label>
          </div>

          <button onClick={handleReset} className="w-full py-2 bg-[#4A4A4A] text-[#FFFFFF] rounded-md hover:bg-gray-600 transition">
            Reset
          </button>
          
          <div className="mt-4 p-4 bg-[#1a1f2e] rounded-lg text-center">
            <div className="text-sm text-[#CBCBCB] mb-1">R² Value</div>
            <div className="text-3xl font-bold text-[#FFFFFF]">{stats.r2.toFixed(3)}</div>
            <div className="text-xs text-[#CBCBCB] mt-2">
              {stats.r2 > 0.6 ? "Strong correlation" : stats.r2 > 0.3 ? "Moderate correlation" : "Weak correlation"}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-[#4A4A4A] rounded-lg overflow-hidden relative p-4 flex flex-col">
          <svg viewBox="0 0 600 400" className="w-full h-auto">
            <defs>
              <linearGradient id="confounder-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(240, 70%, 50%)" />
                <stop offset="100%" stopColor="hsl(0, 70%, 50%)" />
              </linearGradient>
            </defs>

            {[...Array(6)].map((_, i) => (
              <line key={`h-${i}`} x1={padding} y1={height - padding - (i/5)*(height - 2*padding)} x2={width - padding} y2={height - padding - (i/5)*(height - 2*padding)} stroke="#eee" />
            ))}
            {[...Array(6)].map((_, i) => (
              <line key={`v-${i}`} x1={padding + (i/5)*(width - 2*padding)} y1={padding} x2={padding + (i/5)*(width - 2*padding)} y2={height - padding} stroke="#eee" />
            ))}

            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#FFFFFF" strokeWidth="2" />
            <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#FFFFFF" strokeWidth="2" />

            <text x={width/2} y={height - 20} textAnchor="middle" fontSize="14" fill="#FFFFFF">{activeScenario.xLabel}</text>
            <text x={20} y={height/2} textAnchor="middle" fontSize="14" fill="#FFFFFF" transform={`rotate(-90, 20, ${height/2})`}>{activeScenario.yLabel}</text>

            {showRegression && stats.minX !== Infinity && (
              <line 
                x1={scaleX(stats.minX)} y1={scaleY(stats.m * stats.minX + stats.c)} 
                x2={scaleX(stats.maxX)} y2={scaleY(stats.m * stats.maxX + stats.c)} 
                stroke="#6D8196" strokeWidth="3" strokeDasharray="5,5" 
              />
            )}

            {data.map((d) => (
              <circle key={d.id} cx={scaleX(d.x)} cy={scaleY(d.y)} r="6" fill={getPointColor(d.z)} opacity="0.8" />
            ))}

            {showConfounding && (
              <g transform={`translate(${width - padding - 120}, ${padding + 10})`}>
                <rect x="0" y="0" width="100" height="10" fill="url(#confounder-gradient)" rx="2" />
                <text x="50" y="-8" textAnchor="middle" fontSize="12" fill="#FFFFFF" fontWeight="bold">{activeScenario.zLabel}</text>
                <text x="0" y="24" textAnchor="start" fontSize="10" fill="#666">Low</text>
                <text x="100" y="24" textAnchor="end" fontSize="10" fill="#666">High</text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </VizContainer>
  );
}
