import React, { useState, useEffect, useMemo } from 'react';
import VizContainer from '../../components/VizContainer';

function normInv(p) {
    const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
    const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
    const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
               0.0276438810333863, 0.0038405729373609, 0.0003951896511919,
               0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
    
    let x = p - 0.5;
    let r;
    if (Math.abs(x) < 0.42) {
        let z = x * x;
        r = x * (((a[3]*z + a[2])*z + a[1])*z + a[0]) / ((((b[3]*z + b[2])*z + b[1])*z + b[0])*z + 1);
    } else {
        r = p;
        if (x > 0) r = 1 - p;
        r = Math.log(-Math.log(r));
        let z = c[0] + r*(c[1] + r*(c[2] + r*(c[3] + r*(c[4] + r*(c[5] + r*(c[6] + r*(c[7] + r*c[8])))))));
        if (x < 0) z = -z;
        r = z;
    }
    return r;
}

function randomNormal() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export default function ConfidenceIntervals() {
  const trueMean = 50;
  const trueStd = 20;

  const [confLevel, setConfLevel] = useState(95);
  const [sampleSize, setSampleSize] = useState(30);
  const [rawSamples, setRawSamples] = useState([]);
  const [showTrueMean, setShowTrueMean] = useState(true);

  const generateRawSamples = () => {
    const newSamples = [];
    for(let i = 0; i < 100; i++) {
      newSamples.push({ id: i, mean: trueMean + randomNormal() * (trueStd / Math.sqrt(sampleSize)) });
    }
    return newSamples;
  };

  const handleDraw = () => setRawSamples(generateRawSamples());

  useEffect(() => {
    handleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleSize]);

  const intervals = useMemo(() => {
    const p = 1 - (1 - confLevel / 100) / 2;
    const Z = normInv(p);
    const me = Z * (trueStd / Math.sqrt(sampleSize));

    return rawSamples.map(s => ({
      ...s,
      lower: s.mean - me,
      upper: s.mean + me,
      containsTrue: (s.mean - me <= trueMean) && (s.mean + me >= trueMean)
    }));
  }, [rawSamples, confLevel, sampleSize]);

  const handleReset = () => {
    setConfLevel(95);
    setSampleSize(30);
    setShowTrueMean(true);
    setTimeout(() => setRawSamples(generateRawSamples()), 0);
  };

  const capturedCount = intervals.filter(s => s.containsTrue).length;

  const width = 600; const height = 600; const paddingX = 40; const paddingY = 40;
  const scaleX = (val) => paddingX + (val / 100) * (width - 2 * paddingX);
  const scaleY = (index) => paddingY + (index / 99) * (height - 2 * paddingY);

  return (
    <VizContainer 
      title="Confidence Intervals" 
      infoTooltip="A 95% confidence interval means: if you repeated this experiment 100 times, the true parameter would lie in the interval about 95 times."
      formula="\text{CI} = \bar{x} \pm z^* \left(\frac{\sigma}{\sqrt{n}}\right)"
      formulaLabel="Confidence Interval Formula"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB] flex justify-between">
              <span>Confidence Level</span>
              <span>{confLevel}%</span>
            </label>
            <input type="range" min="80" max="99" step="1" value={confLevel} onChange={(e) => setConfLevel(parseInt(e.target.value))} className="w-full" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#CBCBCB] flex justify-between">
              <span>Sample Size (N)</span>
              <span>{sampleSize}</span>
            </label>
            <input type="range" min="10" max="1000" step="10" value={sampleSize} onChange={(e) => setSampleSize(parseInt(e.target.value))} className="w-full" />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="showTrue" checked={showTrueMean} onChange={(e) => setShowTrueMean(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="showTrue" className="text-sm text-[#CBCBCB]">Show true population mean</label>
          </div>

          <button onClick={handleDraw} className="mt-2 w-full py-2 bg-[#6D8196] text-white rounded-md hover:bg-[#6D8196] transition font-medium">
            Draw 100 Samples
          </button>

          <button onClick={handleReset} className="w-full py-2 bg-[#4A4A4A] text-[#FFFFFF] rounded-md hover:bg-[#5A6B7A] transition">
            Reset
          </button>

          <div className="mt-4 p-4 bg-[#1a1f2e] rounded-lg text-center">
            <div className="text-sm text-[#CBCBCB] mb-1">Capture Rate</div>
            <div className={`text-4xl font-bold ${capturedCount < confLevel ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`}>
              {capturedCount} <span className="text-xl text-[#CBCBCB] font-normal">/ 100</span>
            </div>
            <div className="text-xs text-[#CBCBCB] mt-2">
              intervals captured the true mean
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-[#4A4A4A] rounded-lg overflow-hidden relative p-4">
          <svg viewBox="0 0 600 600" className="w-full h-auto">
            {/* X Axis Background Grid */}
            {[0, 20, 40, 60, 80, 100].map(val => (
              <line key={`grid-${val}`} x1={scaleX(val)} y1={paddingY} x2={scaleX(val)} y2={height - paddingY} stroke="#5A6B7A" opacity="0.3" />
            ))}

            {/* X Axis */}
            <line x1={paddingX} y1={height - paddingY + 20} x2={width - paddingX} y2={height - paddingY + 20} stroke="#FFFFFF" strokeWidth="2" />
            {[0, 25, 50, 75, 100].map(val => (
              <g key={`x-${val}`}>
                <line x1={scaleX(val)} y1={height - paddingY + 20} x2={scaleX(val)} y2={height - paddingY + 26} stroke="#FFFFFF" />
                <text x={scaleX(val)} y={height - paddingY + 40} textAnchor="middle" fontSize="12" fill="#CBCBCB">{val}</text>
              </g>
            ))}

            {/* True Mean Line */}
            {showTrueMean && (
              <line 
                x1={scaleX(trueMean)} y1={paddingY - 10} 
                x2={scaleX(trueMean)} y2={height - paddingY + 20} 
                stroke="#FFFFE3" strokeWidth="2" strokeDasharray="4,4" opacity="0.8"
              />
            )}

            {/* Intervals */}
            {intervals.map((s, i) => {
              const color = s.containsTrue ? '#27AE60' : '#E74C3C'; // Green or Red
              return (
                <g key={s.id}>
                  <line 
                    x1={scaleX(s.lower)} y1={scaleY(i)} 
                    x2={scaleX(s.upper)} y2={scaleY(i)} 
                    stroke={color} strokeWidth="2" opacity="0.8"
                  />
                  <circle cx={scaleX(s.mean)} cy={scaleY(i)} r="2" fill={color} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </VizContainer>
  );
}
