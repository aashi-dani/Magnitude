import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const BinomialTree = () => {
  const [spot, setSpot] = useState(100);
  const [strike, setStrike] = useState(100);
  const [volatility, setVolatility] = useState(20);
  const [steps, setSteps] = useState(5);
  const [optionType, setOptionType] = useState('Call');
  const [speed, setSpeed] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(5);

  const T = 1;
  const r = 0.05;

  const treeData = useMemo(() => {
    const dt = T / steps;
    const sigma = volatility / 100;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp(r * dt) - d) / (u - d);
    const pValid = p >= 0 && p <= 1 ? p : 0.5;

    const nodes = [];
    for (let i = 0; i <= steps; i++) {
      const levelNodes = [];
      for (let j = 0; j <= i; j++) {
        const s = spot * Math.pow(u, i - j) * Math.pow(d, j);
        levelNodes.push({ s, v: 0 });
      }
      nodes.push(levelNodes);
    }

    for (let j = 0; j <= steps; j++) {
      const s = nodes[steps][j].s;
      nodes[steps][j].v = optionType === 'Call' ? Math.max(s - strike, 0) : Math.max(strike - s, 0);
    }

    for (let i = steps - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        const vUp = nodes[i + 1][j].v;
        const vDown = nodes[i + 1][j + 1].v;
        nodes[i][j].v = Math.exp(-r * dt) * (pValid * vUp + (1 - pValid) * vDown);
      }
    }

    return { nodes, u, d, p: pValid, dt };
  }, [spot, strike, volatility, steps, optionType]);

  useEffect(() => {
    setCurrentLevel(steps);
    setIsAnimating(false);
  }, [treeData, steps]);

  useEffect(() => {
    let timer;
    if (isAnimating && currentLevel > 0) {
      timer = setTimeout(() => {
        setCurrentLevel(c => c - 1);
      }, speed);
    } else if (currentLevel === 0) {
      setIsAnimating(false);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, currentLevel, speed]);

  const startAnimation = () => {
    if (currentLevel === 0) {
      setCurrentLevel(steps);
    }
    setIsAnimating(true);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentLevel(steps);
  };

  const width = 800;
  const height = 500;
  const padding = 60;
  const dx = (width - 2 * padding) / Math.max(1, steps);
  const dy = (height - 2 * padding) / Math.max(1, steps);

  const tooltipText = "The binomial model prices options by building a tree of possible stock prices. Working backward, each node's value is the expected value of its children, discounted.";

  return (
    <VizContainer 
      title="Binomial Tree Option Pricing" 
      infoTooltip={tooltipText}
      formula="V = \frac{p \cdot V_u + (1-p) \cdot V_d}{e^{r\Delta t}}"
      formulaLabel="Option Pricing Equation"
    >
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex flex-col gap-4 w-full md:w-64 bg-[#1a1f2e] p-4 rounded-lg shadow-sm shrink-0">
          <h3 className="font-bold text-lg text-[#FFFFFF]">Parameters</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Spot Price: ${spot}</label>
            <input type="range" min="50" max="150" value={spot} onChange={e => setSpot(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Strike Price: ${strike}</label>
            <input type="range" min="50" max="150" value={strike} onChange={e => setStrike(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Volatility: {volatility}%</label>
            <input type="range" min="10" max="60" value={volatility} onChange={e => setVolatility(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Time Steps: {steps}</label>
            <input type="range" min="3" max="10" value={steps} onChange={e => setSteps(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex gap-2 mt-1">
            <button className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${optionType === 'Call' ? 'bg-[#6D8196] text-white shadow' : 'bg-gray-200 text-[#CBCBCB] hover:bg-gray-300'}`} onClick={() => setOptionType('Call')}>Call</button>
            <button className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${optionType === 'Put' ? 'bg-[#6D8196] text-white shadow' : 'bg-gray-200 text-[#CBCBCB] hover:bg-gray-300'}`} onClick={() => setOptionType('Put')}>Put</button>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Animation Speed</label>
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="border p-1.5 rounded text-sm bg-[#4A4A4A] outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1500">Slow</option>
              <option value="800">Medium</option>
              <option value="200">Fast</option>
            </select>
          </div>

          <div className="flex gap-2 mt-2">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold shadow transition-colors flex items-center justify-center gap-1" onClick={startAnimation} disabled={isAnimating}>
               Play
            </button>
            <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded text-sm font-bold shadow transition-colors flex items-center justify-center gap-1" onClick={resetAnimation}>
               Reset
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#4A4A4A] rounded-lg p-2 shadow-sm overflow-x-auto">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="min-w-[600px]">
              {treeData.nodes.map((levelNodes, i) => {
                if (i === steps) return null;
                return levelNodes.map((_, j) => {
                  const x1 = padding + i * dx;
                  const y1 = height/2 + (j - i/2) * dy;
                  const x2 = padding + (i+1) * dx;
                  const y2_up = height/2 + (j - (i+1)/2) * dy;
                  const y2_down = height/2 + ((j+1) - (i+1)/2) * dy;

                  const isComputed = currentLevel <= i;
                  const color = isComputed ? '#9ca3af' : '#e5e7eb';
                  const strokeW = isComputed ? 2 : 1;

                  return (
                    <g key={`edges-${i}-${j}`}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2_up} stroke={color} strokeWidth={strokeW} />
                      <line x1={x1} y1={y1} x2={x2} y2={y2_down} stroke={color} strokeWidth={strokeW} />
                    </g>
                  );
                });
              })}

              {treeData.nodes.map((levelNodes, i) => {
                return levelNodes.map((node, j) => {
                  const x = padding + i * dx;
                  const y = height/2 + (j - i/2) * dy;
                  const isComputed = currentLevel <= i;
                  const isCurrent = currentLevel === i;
                  
                  const valColor = node.v > 0 ? '#16a34a' : '#E74C3C'; 
                  
                  return (
                    <g key={`node-${i}-${j}`}>
                      <circle cx={x} cy={y} r="24" fill="white" stroke={isCurrent ? '#6D8196' : (isComputed ? '#4b5563' : '#d1d5db')} strokeWidth={isCurrent ? 3 : 2} className="transition-all duration-300" />
                      <text x={x} y={y - 4} fontSize="11" textAnchor="middle" fill="#475569">{node.s.toFixed(1)}</text>
                      {isComputed ? (
                         <text x={x} y={y + 12} fontSize="12" fontWeight="bold" textAnchor="middle" fill={valColor}>{node.v.toFixed(2)}</text>
                      ) : (
                         <text x={x} y={y + 12} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#9ca3af">?</text>
                      )}
                    </g>
                  );
                });
              })}
            </svg>
          </div>

          <div className="bg-[#1a1f2e] rounded-lg p-4 text-sm text-[#CBCBCB] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1 text-[#FFFFFF]">Model Parameters:</p>
              <ul className="space-y-1 font-mono text-xs">
                <li>u (Up Factor) = e^(σ√Δt) = {treeData.u.toFixed(4)}</li>
                <li>d (Down Factor) = 1/u = {treeData.d.toFixed(4)}</li>
                <li>p (Risk-neutral Prob) = {treeData.p.toFixed(4)}</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1 text-[#FFFFFF]">Pricing Equation:</p>
              <p className="font-mono text-xs bg-[#4A4A4A] p-2 rounded inline-block">
                Value = [p·V_up + (1-p)·V_down] / e^(rΔt)
              </p>
            </div>
          </div>
        </div>
      </div>
    </VizContainer>
  );
};

export default BinomialTree;
