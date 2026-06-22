import React, { useState, useEffect, useRef } from 'react';
import VizContainer from '../../components/VizContainer';

const OrbitalMechanics = () => {
  const [v0, setV0] = useState(1);
  const [e, setE] = useState(0.5);
  const [timeScale, setTimeScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showVel, setShowVel] = useState(true);
  const [showForce, setShowForce] = useState(true);
  const [showEq, setShowEq] = useState(true);

  const [t, setT] = useState(0);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    setT(0);
  }, [v0, e]);

  const updateSimulation = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setT((prevT) => prevT + deltaTime * timeScale * 10);
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
  }, [isPlaying, timeScale]);

  const GM = 10000;
  const vp = v0 * 10;
  const e_val = e;
  
  const rp = (GM * (1 + e_val)) / (vp * vp);
  const a = rp / (1 - e_val);
  const b = a * Math.sqrt(1 - e_val * e_val);
  const n = Math.sqrt(GM / (a * a * a));

  const M = n * t;
  
  let E_anom = M + e_val * Math.sin(M);
  for (let i = 0; i < 20; i++) {
    const f = E_anom - e_val * Math.sin(E_anom) - M;
    const fPrime = 1 - e_val * Math.cos(E_anom);
    E_anom = E_anom - f / fPrime;
  }

  const theta = 2 * Math.atan2(
    Math.sqrt(1 + e_val) * Math.sin(E_anom / 2),
    Math.sqrt(1 - e_val) * Math.cos(E_anom / 2)
  );

  const r = a * (1 - e_val * Math.cos(E_anom));
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);

  const coef = Math.sqrt(GM / (a * (1 - e_val * e_val)));
  const vx = -coef * Math.sin(theta);
  const vy = coef * (e_val + Math.cos(theta));

  const ra = a * (1 + e_val);
  const paddingX = Math.max(a * 0.5, 50);
  const paddingY = Math.max(b * 0.5, 50);

  const minX = -ra - paddingX;
  const minY = -b - paddingY;
  const widthView = (ra + rp) + paddingX * 2;
  const heightView = 2 * b + paddingY * 2;

  const sizeView = Math.max(widthView, heightView);
  const cxView = minX + widthView / 2;
  const cyView = minY + heightView / 2;

  const viewBox = `${cxView - sizeView/2} ${cyView - sizeView/2} ${sizeView} ${sizeView}`;
  const scale = sizeView / 600;

  const vMag = Math.sqrt(vx*vx + vy*vy);
  const normalizedVelLen = Math.min(Math.max(vMag * 2 * scale, 20 * scale), 100 * scale);
  const visualVx = (vx / vMag) * normalizedVelLen;
  const visualVy = (vy / vMag) * normalizedVelLen;

  const forceMag = (GM / (r * r));
  const normalizedForceLen = Math.min(Math.max(forceMag * 2 * scale, 20 * scale), 100 * scale);
  const visualFx = (-x / r) * normalizedForceLen;
  const visualFy = (-y / r) * normalizedForceLen;

  return (
    <VizContainer
      title="Orbital Mechanics"
      infoTooltip="Objects orbit because gravity balances their tangential velocity. Kepler's laws describe elliptical orbits."
      formula="F = \frac{GMm}{r^2}"
      formulaLabel="Newton's Law of Universal Gravitation"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="bg-[#1a1f2e] p-4 rounded shadow-sm text-[#CBCBCB]">
            <h3 className="text-lg font-semibold mb-4 text-[#FFFFFF]">Controls</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Initial Velocity Multiplier: {v0.toFixed(2)}x</label>
              <input type="range" min="0.5" max="2" step="0.05" value={v0} onChange={(ev) => setV0(parseFloat(ev.target.value))} className="w-full" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Eccentricity (e): {e.toFixed(2)}</label>
              <input type="range" min="0" max="0.99" step="0.01" value={e} onChange={(ev) => setE(parseFloat(ev.target.value))} className="w-full" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Time Scale: {timeScale}x</label>
              <select value={timeScale} onChange={(ev) => setTimeScale(parseFloat(ev.target.value))} className="w-full p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded">
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="10">10x</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showVel} onChange={(ev) => setShowVel(ev.target.checked)} />
                <span className="text-sm">Show velocity vector</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showForce} onChange={(ev) => setShowForce(ev.target.checked)} />
                <span className="text-sm">Show force vector</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showEq} onChange={(ev) => setShowEq(ev.target.checked)} />
                <span className="text-sm">Show orbital equations</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsPlaying(true)} disabled={isPlaying} className="flex-1 bg-[#27AE60] text-white py-2 rounded hover:bg-green-600 disabled:opacity-50">Play</button>
              <button onClick={() => setIsPlaying(false)} disabled={!isPlaying} className="flex-1 bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 disabled:opacity-50">⏸ Pause</button>
              <button onClick={() => {setT(0); setIsPlaying(false);}} className="flex-1 bg-[#E74C3C] text-white py-2 rounded hover:bg-red-600">Reset</button>
            </div>
          </div>

          <div className="bg-[#1a1f2e] p-4 rounded shadow-sm text-[#CBCBCB]">
            <h3 className="text-lg font-semibold mb-2 text-[#FFFFFF]">Orbital Properties</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Radius (r): {r.toFixed(1)}</div>
              <div>Velocity (v): {vMag.toFixed(1)}</div>
              <div>Semi-major (a): {a.toFixed(1)}</div>
              <div>Perihelion: {rp.toFixed(1)}</div>
              <div>Aphelion: {ra.toFixed(1)}</div>
              <div>Period (T): {(2*Math.PI/n).toFixed(1)}s</div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col relative bg-[#4A4A4A] rounded overflow-hidden shadow-inner min-h-[400px]">
          <svg width="100%" height="100%" viewBox={viewBox} className="absolute inset-0">
            <ellipse 
              cx={-a * e_val} 
              cy="0" 
              rx={a} 
              ry={b} 
              fill="none" 
              stroke="#5A6B7A" 
              strokeWidth={2 * scale} 
              strokeDasharray={`${5*scale},${5*scale}`} 
            />
            
            <circle cx={rp} cy="0" r={3 * scale} fill="#94a3b8" />
            <circle cx={-ra} cy="0" r={3 * scale} fill="#94a3b8" />
            
            <circle cx="0" cy="0" r={15 * scale} fill="#FFFFE3" />
            <circle cx="0" cy="0" r={25 * scale} fill="#FFFFE3" opacity="0.3" />

            <circle cx={x} cy={y} r={6 * scale} fill="#6D8196" />

            {showVel && (
              <line x1={x} y1={y} x2={x + visualVx} y2={y + visualVy} stroke="#27AE60" strokeWidth={2 * scale} markerEnd="url(#arrow-vel)" />
            )}
            {showForce && (
              <line x1={x} y1={y} x2={x + visualFx} y2={y + visualFy} stroke="#E74C3C" strokeWidth={2 * scale} markerEnd="url(#arrow-force)" />
            )}

            <defs>
              <marker id="arrow-vel" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#27AE60" />
              </marker>
              <marker id="arrow-force" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#E74C3C" />
              </marker>
            </defs>
          </svg>

          {showEq && (
            <div className="absolute top-4 left-4 bg-black/60 text-white p-3 rounded backdrop-blur-sm pointer-events-none">
              <p className="font-mono text-sm mb-1">F = GMm/r²</p>
              <p className="font-mono text-sm">v = √(GM(2/r - 1/a))</p>
            </div>
          )}
        </div>
      </div>
    </VizContainer>
  );
};

export default OrbitalMechanics;
