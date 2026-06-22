import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

function randomNormal() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const VaRSimulator = () => {
  const [stocks, setStocks] = useState(60);
  const [bonds, setBonds] = useState(30);
  const [comm, setComm] = useState(10);
  
  const [horizon, setHorizon] = useState(21); 
  const [confidence, setConfidence] = useState(95);
  
  const [simData, setSimData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateVaR = () => {
    setIsSimulating(true);
    setTimeout(() => {
        const totalW = stocks + bonds + comm || 1;
        const wS = stocks / totalW;
        const wB = bonds / totalW;
        const wC = comm / totalW;
        
        const T = horizon / 252;
        const numSims = 10000;
        const returns = new Float32Array(numSims);
        
        for(let i=0; i<numSims; i++){
            const zS = randomNormal();
            const zB = randomNormal();
            const zC = randomNormal();
            
            const retS = Math.exp((0.08 - 0.5*0.15**2)*T + 0.15*Math.sqrt(T)*zS);
            const retB = Math.exp((0.04 - 0.5*0.05**2)*T + 0.05*Math.sqrt(T)*zB);
            const retC = Math.exp((0.06 - 0.5*0.20**2)*T + 0.20*Math.sqrt(T)*zC);
            
            const portWealth = wS * retS + wB * retB + wC * retC;
            returns[i] = (portWealth - 1) * 100;
        }
        
        returns.sort();
        
        const varIdx = Math.floor(numSims * (1 - confidence/100));
        const varValue = returns[varIdx];
        
        let sumCTE = 0;
        for(let i=0; i<=varIdx; i++){
            sumCTE += returns[i];
        }
        const cteValue = sumCTE / (varIdx + 1);
        
        setSimData({ returns, varValue, cteValue, confidence, horizon });
        setIsSimulating(false);
    }, 50);
  };

  useEffect(() => {
     simulateVaR();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hist = useMemo(() => {
     if (!simData) return null;
     const minR = simData.returns[0];
     const maxR = simData.returns[simData.returns.length - 1];
     const numBins = 60;
     const binWidth = (maxR - minR) / numBins;
     const bins = new Array(numBins).fill(0);
     
     simData.returns.forEach(r => {
         let idx = Math.floor((r - minR) / binWidth);
         if(idx >= numBins) idx = numBins - 1;
         bins[idx]++;
     });
     
     const maxCount = Math.max(...bins, 1);
     
     return { bins, minR, maxR, binWidth, maxCount };
  }, [simData]);

  const totalW = stocks + bonds + comm || 1;

  const tooltipText = "Value at Risk measures maximum loss over a time period at a confidence level.";

  return (
    <VizContainer 
      title="Value at Risk (VaR) Simulator" 
      infoTooltip={tooltipText}
      formula="\text{VaR}_\alpha = F^{-1}(\alpha)"
      formulaLabel="Value at Risk"
    >
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex flex-col gap-4 w-full md:w-64 bg-[#1a1f2e] p-4 rounded-lg shadow-sm shrink-0">
          <h3 className="font-bold text-lg text-[#FFFFFF]">Portfolio Allocation</h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
               <label className="font-medium text-[#CBCBCB]">Stocks</label>
               <span className="text-[#CBCBCB]">{((stocks/totalW)*100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="100" value={stocks} onChange={e => setStocks(Number(e.target.value))} className="accent-blue-600" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
               <label className="font-medium text-[#CBCBCB]">Bonds</label>
               <span className="text-[#CBCBCB]">{((bonds/totalW)*100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="100" value={bonds} onChange={e => setBonds(Number(e.target.value))} className="accent-green-600" />
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-between text-sm">
               <label className="font-medium text-[#CBCBCB]">Commodities</label>
               <span className="text-[#CBCBCB]">{((comm/totalW)*100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="100" value={comm} onChange={e => setComm(Number(e.target.value))} className="accent-yellow-600" />
          </div>

          <h3 className="font-bold text-lg text-[#FFFFFF] border-t border-[#5A6B7A] pt-4 mt-2">Risk Parameters</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Horizon: {horizon} {horizon === 1 ? 'day' : 'days'}</label>
            <input type="range" min="1" max="252" value={horizon} onChange={e => setHorizon(Number(e.target.value))} className="accent-purple-600" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB] mb-1">Confidence Level</label>
            <div className="flex gap-2">
               {[90, 95, 99].map(level => (
                 <button 
                   key={level}
                   onClick={() => setConfidence(level)}
                   className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${confidence === level ? 'bg-[#6D8196] text-white shadow' : 'bg-[#4A4A4A] text-[#CBCBCB] hover:bg-[#5A6B7A]'}`}
                 >
                   {level}%
                 </button>
               ))}
            </div>
          </div>

          <button 
             className="w-full bg-[#6D8196] hover:bg-[#5A6B7A] text-white py-2.5 rounded font-bold shadow transition-colors mt-4" 
             onClick={simulateVaR}
             disabled={isSimulating}
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#4A4A4A] rounded-lg p-4 shadow-sm h-[400px] flex flex-col relative">
             <h4 className="text-center font-bold text-[#CBCBCB] mb-2">Simulated Portfolio Returns Distribution</h4>
             <div className="flex-1 w-full relative">
               {hist && !isSimulating ? (
                 <svg width="100%" height="100%" viewBox="0 0 800 350" preserveAspectRatio="none" className="overflow-visible">
                   {hist.bins.map((count, i) => {
                       const xVal = hist.minR + i * hist.binWidth;
                       const isLoss = xVal < 0;
                       const x = (i / 60) * 800;
                       const w = 800 / 60;
                       const h = (count / hist.maxCount) * 300;
                       const y = 320 - h;
                       
                       return <rect key={i} x={x} y={y} width={Math.max(1, w-1)} height={h} fill={isLoss ? '#E74C3C' : '#27AE60'} rx="1" />
                   })}
                   
                   <line x1={(0 - hist.minR)/(hist.maxR - hist.minR) * 800} y1="0" x2={(0 - hist.minR)/(hist.maxR - hist.minR) * 800} y2="320" stroke="#CBCBCB" strokeWidth="2" strokeDasharray="4" />
                   
                   <line x1={(simData.varValue - hist.minR)/(hist.maxR - hist.minR) * 800} y1="0" x2={(simData.varValue - hist.minR)/(hist.maxR - hist.minR) * 800} y2="320" stroke="#E74C3C" strokeWidth="3" />
                   <text x={(simData.varValue - hist.minR)/(hist.maxR - hist.minR) * 800 - 10} y="20" fill="#E74C3C" fontWeight="bold" textAnchor="end" fontSize="14">VaR Threshold</text>
                   
                   <line x1="0" y1="320" x2="800" y2="320" stroke="#5A6B7A" strokeWidth="2" />
                   <text x="0" y="340" fontSize="12" fill="#CBCBCB" textAnchor="start">{hist.minR.toFixed(1)}%</text>
                   <text x="800" y="340" fontSize="12" fill="#CBCBCB" textAnchor="end">{hist.maxR.toFixed(1)}%</text>
                 </svg>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-[#CBCBCB]">
                   Simulating 10,000 portfolio paths...
                 </div>
               )}
             </div>
          </div>

          {simData && !isSimulating && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#1a1f2e] rounded-lg p-4 flex flex-col justify-center">
                  <span className="text-[#CBCBCB] text-sm font-semibold mb-1">Value at Risk ({simData.confidence}%)</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold text-[#E74C3C]">{simData.varValue.toFixed(2)}%</span>
                     <span className="text-sm text-[#CBCBCB]">max loss</span>
                  </div>
                  <p className="text-xs text-[#CBCBCB] mt-2">There is a {100 - simData.confidence}% chance of losing more than this over {simData.horizon} days.</p>
               </div>
               <div className="bg-[#1a1f2e] rounded-lg p-4 flex flex-col justify-center">
                  <span className="text-[#CBCBCB] text-sm font-semibold mb-1">Expected Shortfall (CTE)</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold text-[#FFFFE3]">{simData.cteValue.toFixed(2)}%</span>
                     <span className="text-sm text-[#CBCBCB]">avg tail loss</span>
                  </div>
                  <p className="text-xs text-[#CBCBCB] mt-2">If a loss exceeds VaR, this is the average expected loss magnitude.</p>
               </div>
            </div>
          )}
          
          <div className="text-center text-sm text-[#CBCBCB] font-mono mt-2">
             VaR_α = F⁻¹(α)
          </div>
        </div>
      </div>
    </VizContainer>
  );
};

export default VaRSimulator;
