import React, { useState, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

const SCENARIOS = [
  { id: 'medical', label: 'Medical Test (Rare Disease)', priorA: 1, priorB: 19 },
  { id: 'coin', label: 'Coin Toss (Fair Coin)', priorA: 2, priorB: 2 },
  { id: 'spam', label: 'Spam Filter (Balanced)', priorA: 5, priorB: 5 }
];

function logGamma(z) {
  let coef = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let step = 2.5066282746310005;
  let x = z, y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1; ser += coef[j] / y;
  }
  return -tmp + Math.log(step * ser / x);
}

function betaPDF(x, a, b) {
  if (x <= 0) x = 0.0001;
  if (x >= 1) x = 0.9999;
  let logB = logGamma(a) + logGamma(b) - logGamma(a + b);
  let logNum = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x);
  return Math.exp(logNum - logB);
}

export default function BayesianUpdating() {
  const [scenario, setScenario] = useState(SCENARIOS[1]);
  const [evidenceStrength, setEvidenceStrength] = useState(1);
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);

  const [showPrior, setShowPrior] = useState(true);
  const [showLikelihood, setShowLikelihood] = useState(true);
  const [showPosterior, setShowPosterior] = useState(true);

  const [isCustom, setIsCustom] = useState(false);
  const [customLabels, setCustomLabels] = useState({
    name: 'Custom Scenario',
    priorA: 1, 
    priorB: 1,
    hypothesis: 'Hypothesis is True',
    evidence: 'Observe Evidence'
  });

  const activeScenario = isCustom ? { id: 'custom', label: customLabels.name, priorA: customLabels.priorA, priorB: customLabels.priorB } : scenario;

  const priorA = activeScenario.priorA;
  const priorB = activeScenario.priorB;
  const postA = priorA + successes;
  const postB = priorB + failures;

  const pts = 200;
  const curveData = useMemo(() => {
    const data = [];
    let maxDens = 1;
    for (let i = 0; i <= pts; i++) {
      const x = i / pts;
      const priorY = betaPDF(x, priorA, priorB);
      const likeY = (successes === 0 && failures === 0) ? 1 : betaPDF(x, successes + 1, failures + 1); 
      const postY = betaPDF(x, postA, postB);
      
      let localMax = 0;
      if (showPrior) localMax = Math.max(localMax, priorY);
      if (showLikelihood) localMax = Math.max(localMax, likeY);
      if (showPosterior) localMax = Math.max(localMax, postY);
      
      maxDens = Math.max(maxDens, localMax);
      data.push({ x, priorY, likeY, postY });
    }
    return { data, maxDens: maxDens * 1.1 };
  }, [priorA, priorB, successes, failures, showPrior, showLikelihood, showPosterior]);

  const priorMean = (priorA / (priorA + priorB) * 100).toFixed(1);
  const likeMean = (successes === 0 && failures === 0) ? 50.0 : ((successes + 1) / (successes + failures + 2) * 100).toFixed(1);
  const postMean = (postA / (postA + postB) * 100).toFixed(1);

  const width = 600; const height = 400; const padding = 50;
  const scaleX = (x) => padding + x * (width - 2 * padding);
  const scaleY = (y) => height - padding - (y / curveData.maxDens) * (height - 2 * padding);

  const linePath = (data, key) => data.map((d, i) => (i === 0 ? 'M' : 'L') + `${scaleX(d.x)},${scaleY(d[key])}`).join(' ');

  const handleReset = () => {
    setIsCustom(false);
    setScenario(SCENARIOS[1]);
    setSuccesses(0);
    setFailures(0);
    setEvidenceStrength(1);
    setShowPrior(true);
    setShowLikelihood(true);
    setShowPosterior(true);
  };

  return (
    <VizContainer 
      title="Bayesian Updating" 
      infoTooltip="Bayes' theorem combines prior belief + new data to create posterior belief. P(H|E) = P(E|H) × P(H) / P(E)."
      formula="P(H|E) = \frac{P(E|H) \cdot P(H)}{P(E)}"
      formulaLabel="Bayes' Theorem"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB]">Scenario (Prior)</label>
            <select 
              className="p-2 bg-[#1a1f2e] text-[#FFFFFF] rounded-md"
              value={isCustom ? 'custom' : scenario.id}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                  setSuccesses(0);
                  setFailures(0);
                } else {
                  setIsCustom(false);
                  setScenario(SCENARIOS.find(s => s.id === e.target.value));
                  setSuccesses(0);
                  setFailures(0);
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
              />
              <input 
                type="text" 
                placeholder="Hypothesis (e.g. Disease is present)"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.hypothesis}
                onChange={e => setCustomLabels({...customLabels, hypothesis: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Evidence Name (e.g. Test Result)"
                className="w-full p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                value={customLabels.evidence}
                onChange={e => setCustomLabels({...customLabels, evidence: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1"
                  placeholder="Prior Alpha"
                  className="w-1/2 p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                  value={customLabels.priorA}
                  onChange={e => setCustomLabels({...customLabels, priorA: parseFloat(e.target.value) || 1})}
                />
                <input 
                  type="number" 
                  min="1"
                  placeholder="Prior Beta"
                  className="w-1/2 p-1 text-xs bg-[#1a1f2e] text-[#FFFFFF] rounded"
                  value={customLabels.priorB}
                  onChange={e => setCustomLabels({...customLabels, priorB: parseFloat(e.target.value) || 1})}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB] flex justify-between">
              <span>Evidence Strength</span>
              <span>{evidenceStrength}</span>
            </label>
            <input type="range" min="1" max="50" step="1" value={evidenceStrength} onChange={(e) => setEvidenceStrength(parseInt(e.target.value))} className="w-full" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setSuccesses(s => s + evidenceStrength)} className="flex-1 py-2 bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/50 rounded-md hover:bg-[#27AE60]/30 transition font-medium text-sm">
              + {isCustom ? `Positive ${customLabels.evidence}` : 'Positive'}
            </button>
            <button onClick={() => setFailures(f => f + evidenceStrength)} className="flex-1 py-2 bg-[#E74C3C]/20 text-[#E74C3C] border border-[#E74C3C]/50 rounded-md hover:bg-[#E74C3C]/30 transition font-medium text-sm">
              - {isCustom ? `Negative ${customLabels.evidence}` : 'Negative'}
            </button>
          </div>
          
          <button onClick={handleReset} className="w-full py-2 bg-[#4A4A4A] text-[#FFFFFF] rounded-md hover:bg-[#5A6B7A] transition">
            Reset
          </button>

          <div className="flex flex-col gap-3 mt-2 p-4 bg-[#1a1f2e] rounded-lg">
            {isCustom && <div className="text-xs text-[#CBCBCB] text-center font-bold mb-2 pb-2 border-b border-[#5A6B7A]">P({customLabels.hypothesis})</div>}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPrior} onChange={e => setShowPrior(e.target.checked)} className="w-4 h-4 accent-[#CBCBCB]" />
              <div className="flex-1 flex justify-between text-sm font-medium" style={{ color: '#CBCBCB' }}>
                <span>Prior</span><span>{priorMean}%</span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showLikelihood} onChange={e => setShowLikelihood(e.target.checked)} className="w-4 h-4 accent-[#FFFFE3]" />
              <div className="flex-1 flex justify-between text-sm font-medium" style={{ color: '#FFFFE3' }}>
                <span>Likelihood</span><span>{successes===0&&failures===0 ? 'N/A' : `${likeMean}%`}</span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPosterior} onChange={e => setShowPosterior(e.target.checked)} className="w-4 h-4 accent-[#6D8196]" />
              <div className="flex-1 flex justify-between text-sm font-bold" style={{ color: '#6D8196' }}>
                <span>Posterior</span><span>{postMean}%</span>
              </div>
            </label>
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-[#4A4A4A] rounded-lg overflow-hidden relative p-4">
          <svg viewBox="0 0 600 400" className="w-full h-auto">
            {[...Array(5)].map((_, i) => (
              <line key={`h-${i}`} x1={padding} y1={height - padding - (i/4)*(height - 2*padding)} x2={width - padding} y2={height - padding - (i/4)*(height - 2*padding)} stroke="#5A6B7A" opacity="0.5" />
            ))}
            {[...Array(11)].map((_, i) => (
              <g key={`v-${i}`}>
                <line x1={padding + (i/10)*(width - 2*padding)} y1={padding} x2={padding + (i/10)*(width - 2*padding)} y2={height - padding} stroke="#5A6B7A" opacity="0.5" />
                <text x={padding + (i/10)*(width - 2*padding)} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#CBCBCB">{i * 10}%</text>
              </g>
            ))}

            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#FFFFFF" strokeWidth="2" />
            <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#FFFFFF" strokeWidth="2" />

            <text x={width/2} y={height - 5} textAnchor="middle" fontSize="14" fill="#FFFFFF">Probability</text>
            <text x={15} y={height/2} textAnchor="middle" fontSize="14" fill="#FFFFFF" transform={`rotate(-90, 15, ${height/2})`}>Density</text>

            {showPrior && <path d={linePath(curveData.data, 'priorY')} fill="none" stroke="#CBCBCB" strokeWidth="2" />}
            {showLikelihood && <path d={linePath(curveData.data, 'likeY')} fill="none" stroke="#FFFFE3" strokeWidth="3" strokeDasharray="6,4" />}
            {showPosterior && <path d={linePath(curveData.data, 'postY')} fill="none" stroke="#6D8196" strokeWidth="4" />}
          </svg>
        </div>
      </div>
    </VizContainer>
  );
}
