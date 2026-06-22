import React, { useState, useEffect, useRef, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

function randomNormal() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const RandomWalk = () => {
  const [paths, setPaths] = useState(100);
  const [steps, setSteps] = useState(100);
  const [drift, setDrift] = useState(5);
  const [volatility, setVolatility] = useState(20);
  const [showHist, setShowHist] = useState(true);
  
  const canvasRef = useRef(null);
  const [animating, setAnimating] = useState(false);
  const [simData, setSimData] = useState(null);

  const simulate = () => {
    const dt = 1 / steps;
    const mu = drift / 100;
    const sigma = volatility / 100;
    const S0 = 100;
    
    const newPaths = [];
    const finalPrices = [];
    for(let p=0; p<paths; p++){
      let S = S0;
      const path = new Float32Array(steps + 1);
      path[0] = S;
      for(let i=1; i<=steps; i++){
        S = S * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * randomNormal());
        path[i] = S;
      }
      newPaths.push(path);
      finalPrices.push(S);
    }
    setSimData({ paths: newPaths, finalPrices, steps, mu, sigma, S0, dt });
    setAnimating(true);
  };

  useEffect(() => {
    simulate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!animating || !simData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let currentStep = 0;
    let animationId;
    const stepsPerFrame = Math.max(1, Math.ceil(simData.steps / 60)); 
    
    const maxP = Math.max(...simData.paths.map(p => Math.max(...p))) * 1.05;
    const minP = Math.max(0, Math.min(...simData.paths.map(p => Math.min(...p))) * 0.95);
    
    const getX = (step) => (step / simData.steps) * canvas.width;
    const getY = (val) => canvas.height - ((val - minP) / (maxP - minP)) * canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawBands = () => {
       ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
       ctx.beginPath();
       ctx.moveTo(getX(0), getY(simData.S0));
       for(let i=1; i<=simData.steps; i++){
          const t = i * simData.dt;
          const mean = (simData.mu - 0.5 * simData.sigma**2) * t;
          const std = simData.sigma * Math.sqrt(t);
          const upper = simData.S0 * Math.exp(mean + 1.96 * std);
          ctx.lineTo(getX(i), getY(upper));
       }
       for(let i=simData.steps; i>=0; i--){
          const t = i * simData.dt;
          const mean = (simData.mu - 0.5 * simData.sigma**2) * t;
          const std = simData.sigma * Math.sqrt(t);
          const lower = simData.S0 * Math.exp(mean - 1.96 * std);
          ctx.lineTo(getX(i), getY(lower));
       }
       ctx.closePath();
       ctx.fill();
    };
    
    drawBands();

    const drawFrame = () => {
      const endStep = Math.min(currentStep + stepsPerFrame, simData.steps);
      
      ctx.lineWidth = 1;
      const alpha = Math.max(0.05, Math.min(0.5, 5 / simData.paths.length));
      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; 

      ctx.beginPath();
      for(let p=0; p<simData.paths.length; p++){
        for(let s=currentStep; s<endStep; s++){
           ctx.moveTo(getX(s), getY(simData.paths[p][s]));
           ctx.lineTo(getX(s+1), getY(simData.paths[p][s+1]));
        }
      }
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(220, 38, 38, 1)'; 
      ctx.beginPath();
      for(let s=currentStep; s<endStep; s++){
          const t1 = s * simData.dt;
          const m1 = simData.S0 * Math.exp(simData.mu * t1);
          const t2 = (s+1) * simData.dt;
          const m2 = simData.S0 * Math.exp(simData.mu * t2);
          ctx.moveTo(getX(s), getY(m1));
          ctx.lineTo(getX(s+1), getY(m2));
      }
      ctx.stroke();

      currentStep = endStep;
      if (currentStep < simData.steps) {
         animationId = requestAnimationFrame(drawFrame);
      } else {
         setAnimating(false);
      }
    };
    
    drawFrame();

    return () => cancelAnimationFrame(animationId);
  }, [animating, simData]);

  const histBins = useMemo(() => {
    if (!simData || animating) return null;
    const prices = simData.finalPrices;
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const numBins = 30;
    const binWidth = Math.max((maxP - minP) / numBins, 0.01);
    const bins = new Array(numBins).fill(0);
    
    prices.forEach(p => {
      let idx = Math.floor((p - minP) / binWidth);
      if (idx >= numBins) idx = numBins - 1;
      bins[idx]++;
    });
    
    const maxCount = Math.max(...bins, 1);
    return { bins, minP, maxP, binWidth, maxCount };
  }, [simData, animating]);

  const curvePath = useMemo(() => {
     if(!histBins || !simData) return '';
     let d = '';
     const { minP, maxP, binWidth } = histBins;
     const T = 1; 
     const muT = Math.log(simData.S0) + (simData.mu - 0.5*simData.sigma**2)*T;
     const sigT = simData.sigma * Math.sqrt(T);
     
     for(let i=0; i<=50; i++){
        const xPx = i * (300 / 50);
        const xVal = minP + (i/50)*(maxP - minP);
        if (xVal <= 0) continue;
        const pdf = (1 / (xVal * sigT * Math.sqrt(2*Math.PI))) * Math.exp(-0.5 * Math.pow((Math.log(xVal) - muT)/sigT, 2));
        
        const expectedCount = pdf * simData.paths.length * binWidth;
        const yPx = 300 - (expectedCount / histBins.maxCount) * 250;
        
        if(d === '') d += `M ${xPx} ${yPx} `;
        else d += `L ${xPx} ${yPx} `;
     }
     return d;
  }, [histBins, simData]);

  const tooltipText = "Stock prices are often modeled as random walks—tomorrow's price depends on today's plus random change.";

  return (
    <VizContainer 
      title="Geometric Brownian Motion (Random Walk)" 
      infoTooltip={tooltipText}
      formula="dS/S = \mu dt + \sigma dW"
      formulaLabel="Geometric Brownian Motion"
    >
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex flex-col gap-4 w-full md:w-64 bg-[#1a1f2e] p-4 rounded-lg shadow-sm shrink-0">
          <h3 className="font-bold text-lg text-[#FFFFFF]">Parameters</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Paths: {paths}</label>
            <input type="range" min="10" max="1000" step="10" value={paths} onChange={e => setPaths(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Steps: {steps}</label>
            <input type="range" min="10" max="500" step="10" value={steps} onChange={e => setSteps(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Drift (μ): {drift}%</label>
            <input type="range" min="-5" max="10" value={drift} onChange={e => setDrift(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Volatility (σ): {volatility}%</label>
            <input type="range" min="5" max="50" value={volatility} onChange={e => setVolatility(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-[#CBCBCB] mt-2 cursor-pointer">
            <input type="checkbox" checked={showHist} onChange={e => setShowHist(e.target.checked)} className="w-4 h-4 text-[#6D8196] rounded" /> 
            Show Distribution
          </label>

          <button className="w-full bg-[#6D8196] hover:bg-[#5A6B7A] text-white py-2.5 rounded font-bold shadow transition-colors mt-2" onClick={simulate} disabled={animating}>
            {animating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row bg-[#4A4A4A] rounded-lg overflow-hidden shadow-sm h-[400px]">
            <div className="flex-1 relative p-4 bg-[#4A4A4A]">
               <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-fill bg-[#4A4A4A] rounded" />
               <div className="absolute top-6 left-6 flex flex-col gap-1 text-xs font-mono bg-[#1a1f2e] text-[#CBCBCB] p-2 rounded shadow-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-red-600 inline-block"></span> Expected Mean Path</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-200 inline-block"></span> 95% Confidence Band</div>
               </div>
            </div>

            {showHist && (
              <div className="w-full xl:w-1/3 border-t xl:border-t-0 xl:border-l border-[#5A6B7A] p-4 flex flex-col bg-[#4A4A4A]">
                <h4 className="text-center font-bold text-[#CBCBCB] mb-4 text-sm">Final Price Distribution</h4>
                <div className="flex-1 relative min-h-[200px]">
                  {histBins && !animating ? (
                    <svg width="100%" height="100%" viewBox="0 0 300 320" preserveAspectRatio="none" className="overflow-visible">
                      {histBins.bins.map((count, i) => {
                        const x = (i / histBins.bins.length) * 300;
                        const w = 300 / histBins.bins.length;
                        const h = (count / histBins.maxCount) * 250;
                        const y = 300 - h;
                        return <rect key={i} x={x} y={y} width={Math.max(1, w-1)} height={h} fill="#6D8196" rx="1" />
                      })}
                      <path d={curvePath} fill="none" stroke="#CBCBCB" strokeWidth="2" strokeDasharray="4" />
                      <line x1="0" y1="300" x2="300" y2="300" stroke="#5A6B7A" strokeWidth="2" />
                      <text x="0" y="315" fontSize="12" fill="#CBCBCB" textAnchor="start">${histBins.minP.toFixed(0)}</text>
                      <text x="300" y="315" fontSize="12" fill="#CBCBCB" textAnchor="end">${histBins.maxP.toFixed(0)}</text>
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                       {animating ? 'Simulating...' : 'No Data'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#4A4A4A] rounded-lg p-4 text-sm text-[#CBCBCB] flex items-center justify-center">
            <span className="mr-2 font-semibold">Stochastic Differential Equation:</span>
            <span className="font-mono bg-[#4A4A4A] px-3 py-1 rounded shadow-sm">dS = μ S dt + σ S dW</span>
          </div>
        </div>
      </div>
    </VizContainer>
  );
};

export default RandomWalk;
