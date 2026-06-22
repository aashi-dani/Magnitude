import React, { useState, useEffect, useRef, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const SpringMass = () => {
  const [k, setK] = useState(50);
  const [zeta, setZeta] = useState(0.1);
  const [x0, setX0] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [simData, setSimData] = useState({ x: 1, v: 0, t: 0, history: [{ t: 0, x: 1 }] });

  const simState = useRef({ x: 1, v: 0, t: 0, history: [{ t: 0, x: 1 }] });
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const resetSim = () => {
    simState.current = { x: x0, v: 0, t: 0, history: [{ t: 0, x: x0 }] };
    setSimData({ ...simState.current, history: [...simState.current.history] });
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      simState.current = { x: x0, v: 0, t: 0, history: [{ t: 0, x: x0 }] };
      setSimData({ ...simState.current, history: [...simState.current.history] });
    }
  }, [x0]);

  const updateSimulation = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      const dt = Math.min(deltaTime, 0.05) * speed;

      const m = 1;
      const c = 2 * zeta * Math.sqrt(m * k);

      const steps = 10;
      const stepDt = dt / steps;

      let { x, v, t, history } = simState.current;

      for (let i = 0; i < steps; i++) {
        const a = -(c * v + k * x) / m;
        v += a * stepDt;
        x += v * stepDt;
        t += stepDt;
      }

      history.push({ t, x });
      history = history.filter(pt => pt.t > t - 10);

      simState.current = { x, v, t, history };
      setSimData({ x, v, t, history: [...history] });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateSimulation);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, k, zeta, speed]);

  const springPoints = useMemo(() => {
    const points = [];
    const numCoils = 15;
    const startY = 20;
    const endY = 150 + simData.x * 40;
    const width = 20;

    points.push(`125,${startY}`);
    points.push(`125,${startY + 10}`);

    const coilSpace = Math.max(0, (endY - startY - 20)) / numCoils;
    for (let i = 0; i < numCoils; i++) {
      const y = startY + 10 + i * coilSpace + coilSpace / 2;
      const x = i % 2 === 0 ? 125 - width : 125 + width;
      points.push(`${x},${y}`);
    }

    points.push(`125,${endY - 10}`);
    points.push(`125,${endY}`);
    return points.join(' ');
  }, [simData.x]);

  const graphPath = useMemo(() => {
    if (simData.history.length === 0) return '';
    const points = simData.history.map(pt => {
      const tMin = Math.max(0, simData.t - 10);
      const px = ((pt.t - tMin) / 10) * 400;
      const py = 150 - (pt.x / 2.5) * 150;
      return `${px},${py}`;
    });
    return points.join(' L ');
  }, [simData.history, simData.t]);

  const Fg_len = 50;
  const Fs_len = 50 - simData.x * k * 0.5;
  const massY = 150 + simData.x * 40;

  return (
    <VizContainer
      title="Spring-Mass System"
      infoTooltip="A mass on a spring oscillates. The damping ratio determines behavior: underdamped (bouncy), critically damped (best control), or overdamped (sluggish)."
      formula="m\cdot a + c\cdot v + k\cdot x = 0"
      formulaLabel="Damped Harmonic Oscillator"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="bg-[#1a1f2e] p-4 rounded shadow-sm text-[#CBCBCB]">
            <h3 className="text-lg font-semibold mb-4 text-[#FFFFFF]">Controls</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Spring Constant (k): {k.toFixed(1)} N/m</label>
              <input type="range" min="1" max="100" step="1" value={k} onChange={(e) => setK(parseFloat(e.target.value))} className="w-full" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Damping Ratio (ζ): {zeta.toFixed(2)}</label>
              <input type="range" min="0" max="2" step="0.01" value={zeta} onChange={(e) => setZeta(parseFloat(e.target.value))} className="w-full" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Initial Displacement: {x0.toFixed(2)} m</label>
              <input type="range" min="0" max="2" step="0.1" value={x0} onChange={(e) => setX0(parseFloat(e.target.value))} className="w-full" disabled={isPlaying} />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Speed: {speed}x</label>
              <input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full" />
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setIsPlaying(true)} disabled={isPlaying} className="flex-1 bg-[#27AE60] text-white py-2 rounded hover:bg-green-600 disabled:opacity-50">Play</button>
              <button onClick={() => setIsPlaying(false)} disabled={!isPlaying} className="flex-1 bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 disabled:opacity-50">⏸ Pause</button>
              <button onClick={resetSim} className="flex-1 bg-[#E74C3C] text-white py-2 rounded hover:bg-red-600">Reset</button>
            </div>
          </div>
          
          <div className="bg-[#1a1f2e] p-4 rounded shadow-sm text-[#CBCBCB]">
            <h3 className="text-lg font-semibold mb-2 text-[#FFFFFF]">Equations</h3>
            <p className="text-sm font-mono bg-[#4A4A4A] p-2 rounded mb-2 text-[#FFFFFF]">m·a + c·v + k·x = 0</p>
            <p className="text-sm font-mono bg-[#4A4A4A] p-2 rounded text-[#FFFFFF]">ω = √(k/m)</p>
            <p className="text-sm mt-2 text-[#CBCBCB]">Where c = 2ζ√(mk). Here m = 1 kg.</p>
          </div>
          
          <div className="bg-[#1a1f2e] p-4 rounded shadow-sm text-[#CBCBCB]">
            <h3 className="text-lg font-semibold mb-2 text-[#FFFFFF]">State</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Position (x): {simData.x.toFixed(2)} m</div>
              <div>Velocity (v): {simData.v.toFixed(2)} m/s</div>
              <div>Time (t): {simData.t.toFixed(2)} s</div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0 flex justify-center">
            <svg width="250" height="400" className="bg-[#4A4A4A] rounded">
              <rect x="75" y="0" width="100" height="20" fill="#1a1f2e" />
              
              <polyline points={springPoints} fill="none" stroke="#CBCBCB" strokeWidth="3" />
              
              <rect x="100" y={massY} width="50" height="50" fill="#6D8196" rx="5" />
              <text x="125" y={massY + 30} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1kg</text>
              
              <line x1="125" y1={massY + 25} x2="125" y2={massY + 25 + Fg_len} stroke="#E74C3C" strokeWidth="2" markerEnd="url(#arrowhead-red)" />
              <text x="135" y={massY + 25 + Fg_len + 10} fill="#E74C3C" fontSize="12">mg</text>
              
              <line x1="125" y1={massY + 25} x2="125" y2={massY + 25 - Fs_len} stroke="#27AE60" strokeWidth="2" markerEnd="url(#arrowhead-green)" />
              <text x="135" y={massY + 25 - Fs_len - 5} fill="#27AE60" fontSize="12">Fs</text>

              <defs>
                <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#E74C3C" />
                </marker>
                <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#27AE60" />
                </marker>
              </defs>
            </svg>
          </div>
          
          <div className="flex-grow flex flex-col">
            <h4 className="text-center font-medium mb-2 text-[#FFFFFF]">Displacement vs Time</h4>
            <div className="flex-grow bg-[#4A4A4A] rounded relative min-h-[300px]">
               <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0">
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={i * 75} x2="400" y2={i * 75} stroke="#5A6B7A" strokeDasharray="4" />
                  ))}
                  <path d={`M ${graphPath}`} fill="none" stroke="#6D8196" strokeWidth="2" />
                  <text x="10" y="15" fill="#CBCBCB" fontSize="12">+2.5m</text>
                  <text x="10" y="145" fill="#CBCBCB" fontSize="12">0m</text>
                  <text x="10" y="290" fill="#CBCBCB" fontSize="12">-2.5m</text>
               </svg>
            </div>
          </div>
        </div>
      </div>
    </VizContainer>
  );
};

export default SpringMass;
