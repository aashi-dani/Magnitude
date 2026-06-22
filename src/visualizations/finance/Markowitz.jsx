// src/visualizations/finance/Markowitz.jsx
// Markowitz Portfolio Optimization — Efficient Frontier visualizer
// Shows 2500 random portfolios on a risk/return scatter, highlights
// minimum-variance and maximum-Sharpe (tangency) portfolios.

import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import VizContainer from '../../components/VizContainer';
import { portfolioReturn, portfolioVariance } from '../../utils/mathUtils';

const ACCENT = '#6D8196';

// ── Asset Universe ──────────────────────────────────────────────────────────
const ASSETS = [
  { name: 'US Stocks',    mu: 0.10, sigma: 0.16, color: '#6366f1' },
  { name: 'US Bonds',     mu: 0.04, sigma: 0.05, color: '#0ea5e9' },
  { name: 'Gold',         mu: 0.06, sigma: 0.15, color: '#FFFFE3' },
  { name: 'Real Estate',  mu: 0.08, sigma: 0.12, color: '#10b981' },
];

// Realistic correlation matrix
const CORR = [
  [ 1.00,  0.10,  0.05,  0.60],
  [ 0.10,  1.00, -0.10,  0.05],
  [ 0.05, -0.10,  1.00,  0.10],
  [ 0.60,  0.05,  0.10,  1.00],
];

// Build covariance matrix from correlations + sigmas
function buildCov(assets, corr) {
  return assets.map((a, i) =>
    assets.map((b, j) => corr[i][j] * a.sigma * b.sigma)
  );
}
const COV = buildCov(ASSETS, CORR);

// Compute portfolioReturn and portfolioStd from weights
function portfolioStats(weights) {
  const returns = ASSETS.map(a => a.mu);
  const ret  = portfolioReturn(weights, returns);
  const vari = portfolioVariance(weights, COV);
  const std  = Math.sqrt(Math.max(vari, 0));
  const sharpe = std > 0 ? (ret - 0.02) / std : 0;
  return { ret, std, sharpe };
}

// Generate N random portfolios (w summing to 1)
function randomPortfolios(n) {
  const n_assets = ASSETS.length;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const raw = Array.from({ length: n_assets }, () => Math.random());
    const sum = raw.reduce((a, b) => a + b, 0);
    const w = raw.map(x => x / sum);
    const { ret, std, sharpe } = portfolioStats(w);
    pts.push({ risk: +std.toFixed(4), ret: +ret.toFixed(4), sharpe: +sharpe.toFixed(3) });
  }
  return pts;
}

// Color by Sharpe ratio (blue → green → yellow → red)
function sharpeColor(sharpe, minS, maxS) {
  const t = Math.max(0, Math.min(1, (sharpe - minS) / (maxS - minS)));
  const r = Math.round(lerp(59, 239, t));
  const g = Math.round(lerp(130, 68, t));
  const b = Math.round(lerp(246, 68, t));
  return `rgb(${r},${g},${b})`;
}
function lerp(a, b, t) { return a + (b - a) * t; }

// ── Custom Dot for scatter ──────────────────────────────────────────────────
const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  // skip default scatter dots (they'll be individual Scatter elements)
  return null;
};

export default function Markowitz() {
  const { isDark } = useTheme();

  // User portfolio weights (unnormalized sliders)
  const [rawW, setRawW] = useState([0.4, 0.3, 0.15, 0.15]);

  // Normalize weights
  const weights = useMemo(() => {
    const sum = rawW.reduce((a, b) => a + b, 0);
    return rawW.map(w => w / sum);
  }, [rawW]);

  const userStats = useMemo(() => portfolioStats(weights), [weights]);

  // Pre-generate random portfolios
  const cloud = useMemo(() => randomPortfolios(2500), []);

  // Find min-variance and max-Sharpe portfolios from cloud
  const minVar = useMemo(() => cloud.reduce((a, b) => b.risk < a.risk ? b : a), [cloud]);
  const maxSharpe = useMemo(() => cloud.reduce((a, b) => b.sharpe > a.sharpe ? b : a), [cloud]);

  const sharpes = cloud.map(p => p.sharpe);
  const minS = Math.min(...sharpes);
  const maxS = Math.max(...sharpes);

  const gridColor   = 'rgba(203,203,203,0.1)';
  const textColor   = '#CBCBCB';
  const tooltipBg   = '#3D3D3D';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <VizContainer
      infoTooltip="Modern Portfolio Theory optimizes asset allocation to minimize risk for a target return. The efficient frontier shows all optimal portfolios. Diversification reduces risk without sacrificing return."
      id="markowitz"
      title="Markowitz Portfolio Optimization"
      description="Each dot is a random portfolio of 4 assets. Color = Sharpe ratio (blue=low, red=high). Adjust weights to move your portfolio (★) on the frontier."
      formula="\min_w \; w^\top \Sigma w \quad \text{s.t.} \; \mathbf{1}^\top w = 1"
      formulaLabel="Minimum Variance Problem"
      accentColor={ACCENT}
      fullWidth
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="risk" type="number" name="Risk (σ)"
                domain={[0.02, 0.20]}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                tick={{ fill: textColor, fontSize: 11 }}
                label={{ value: 'Risk (σ)', position: 'bottom', offset: 5, fill: textColor, fontSize: 12 }}
              />
              <YAxis
                dataKey="ret" type="number" name="Expected Return"
                domain={[0.02, 0.13]}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                tick={{ fill: textColor, fontSize: 11 }}
                label={{ value: 'Expected Return', angle: -90, position: 'insideLeft', offset: 10, fill: textColor, fontSize: 12 }}
              />
              <ZAxis range={[20, 20]} />
              <Tooltip
                contentStyle={{ background: '#4A4A4A', border: 'none', color: '#FFFFFF', borderRadius: 8, fontSize: 13 }}
                formatter={(val, name) => [name.includes('Risk') || name.includes('Return') ? `${(val * 100).toFixed(2)}%` : val.toFixed(3), name]}
                cursor={{ strokeDasharray: '3 3' }}
              />
              {/* Cloud of portfolios */}
              <Scatter
                name="Portfolios"
                data={cloud}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle cx={cx} cy={cy} r={3} opacity={0.55}
                      fill={sharpeColor(payload.sharpe, minS, maxS)} />
                  );
                }}
              />
              {/* Min-variance portfolio */}
              <Scatter
                name="Min Variance"
                data={[{ ...minVar, label: 'Min Variance' }]}
                shape={(props) => {
                  const { cx, cy } = props;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={9} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
                      <text x={cx + 13} y={cy + 4} fill="#0ea5e9" fontSize={11} fontWeight={700}>MV</text>
                    </g>
                  );
                }}
              />
              {/* Max-Sharpe portfolio */}
              <Scatter
                name="Max Sharpe"
                data={[{ ...maxSharpe, label: 'Tangency' }]}
                shape={(props) => {
                  const { cx, cy } = props;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={9} fill="#FFFFE3" stroke="#fff" strokeWidth={2} />
                      <text x={cx + 13} y={cy + 4} fill="#FFFFE3" fontSize={11} fontWeight={700}>SR</text>
                    </g>
                  );
                }}
              />
              {/* User portfolio */}
              <Scatter
                name="Your Portfolio"
                data={[{ risk: userStats.std, ret: userStats.ret }]}
                shape={(props) => {
                  const { cx, cy } = props;
                  return (
                    <g>
                      <polygon
                        points={`${cx},${cy - 12} ${cx + 11},${cy + 8} ${cx - 11},${cy + 8}`}
                        fill={ACCENT} stroke="#fff" strokeWidth={2}
                      />
                      <text x={cx + 15} y={cy + 5} fill={ACCENT} fontSize={11} fontWeight={700}>You</text>
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-2 px-2">
            {[
              { color: '#0ea5e9', label: 'Min Variance (MV)' },
              { color: '#FFFFE3', label: 'Max Sharpe (SR)' },
              { color: ACCENT,    label: 'Your Portfolio (▲)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[#CBCBCB] dark:text-slate-400">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>


          {/* Correlation Matrix Heatmap */}
          <div className="mt-8 bg-[#4A4A4A] p-4 rounded-xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-[#CBCBCB] mb-4">Correlation Matrix</p>
            <div className="w-full h-[200px] flex flex-col gap-1">
              <div className="flex gap-1 h-6">
                <div className="w-20"></div>
                {ASSETS.map(a => (
                  <div key={a.name} className="flex-1 text-[10px] font-semibold text-center text-[#CBCBCB] flex items-center justify-center truncate">
                    {a.name.split(' ')[0]}
                  </div>
                ))}
              </div>
              {ASSETS.map((a, i) => (
                <div key={a.name} className="flex gap-1 flex-1">
                  <div className="w-20 text-[10px] font-semibold text-[#CBCBCB] flex items-center justify-end pr-2 truncate">
                    {a.name}
                  </div>
                  {ASSETS.map((b, j) => {
                    const val = CORR[i][j];
                    // -1 to 0 (dark blue to white), 0 to 1 (white to orange)
                    let bg = '#FFFFFF';
                    let textCol = '#4A4A4A';
                    if (val < 0) {
                       const intensity = Math.floor(Math.abs(val) * 255);
                       bg = `rgb(${255-intensity}, ${255-intensity}, 255)`; // simplify to light blue
                    } else if (val > 0) {
                       if (val === 1) bg = '#F97316';
                       else {
                          bg = `rgba(249, 115, 22, ${val})`;
                       }
                    }
                    if (val === 1 || val < -0.8) textCol = '#FFFFFF';
                    
                    // Actually let's use a simpler solid color interpolation to avoid opacity issues over backgrounds
                    const getBg = (v) => {
                       if (v === 1) return '#F97316';
                       if (v === 0) return '#FFFFFF';
                       if (v > 0) return `color-mix(in srgb, #F97316 ${v*100}%, #FFFFFF)`;
                       return `color-mix(in srgb, #1E3A8A ${Math.abs(v)*100}%, #FFFFFF)`;
                    };

                    return (
                      <div key={b.name} className="flex-1 flex items-center justify-center rounded text-[11px] font-mono font-bold transition-transform hover:scale-105 cursor-default"
                           style={{ backgroundColor: getBg(val), color: Math.abs(val) > 0.6 ? '#FFFFFF' : '#4A4A4A' }}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 px-2 text-[10px] text-[#CBCBCB] font-medium">
               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#1E3A8A] rounded-sm"></div> -1.0 (Negative)</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FFFFFF] rounded-sm"></div> 0.0 (Neutral)</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#F97316] rounded-sm"></div> +1.0 (Positive)</span>
            </div>
          </div>

          {/* Allocation Breakdown */}
          <div className="mt-8 bg-[#4A4A4A] p-5 rounded-xl">
             <p className="text-xs font-semibold uppercase tracking-wider text-[#CBCBCB] mb-4">Current Portfolio Allocation</p>
             <div className="flex h-6 rounded-full overflow-hidden w-full shadow-inner">
               {ASSETS.map((a, i) => (
                 <div key={a.name} style={{ width: `${weights[i]*100}%`, backgroundColor: a.color }} className="h-full transition-all duration-300 hover:opacity-80 cursor-pointer" title={`${a.name}: ${(weights[i]*100).toFixed(1)}%`} />
               ))}
             </div>
             <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 px-1">
               {ASSETS.map((a, i) => (
                 <div key={a.name} className="flex items-center gap-1.5 text-[11px] font-medium text-[#CBCBCB] dark:text-slate-400">
                   <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: a.color }} />
                   {a.name} ({(weights[i]*100).toFixed(1)}%)
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Controls + Stats */}
        <div className="lg:w-64 space-y-4">
          <div className="bg-[#1a1f2e] rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFFFF] mb-4">Asset Weights</p>
            {ASSETS.map((asset, i) => (
              <div key={asset.name} className="mb-4">
                <ControlSlider
                  label={<span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: asset.color }} />{asset.name}</span>}
                  value={rawW[i]}
                  min={0}
                  max={1}
                  step={0.01}
                  decimals={0}
                  unit="%"
                  onChange={v => setRawW(prev => { const n = [...prev]; n[i] = v; return n; })}
                  accentColor={asset.color}
                />
                <p className="text-right text-xs font-mono text-[#CBCBCB] mt-0.5">
                  {(weights[i] * 100).toFixed(1)}% actual
                </p>
              </div>
            ))}
          </div>

          {/* Portfolio stats */}
          <div className="bg-[#1a1f2e] text-white rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFFFF]">Your Portfolio</p>
            {[
              { label: 'Expected Return', value: `${(userStats.ret * 100).toFixed(2)}%`, color: '#10b981' },
              { label: 'Risk (σ)',         value: `${(userStats.std * 100).toFixed(2)}%`, color: '#f43f5e' },
              { label: 'Sharpe Ratio',    value: userStats.sharpe.toFixed(3),              color: '#FFFFE3' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[13px] text-white">{label}</span>
                <span className="text-sm font-mono font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
            <div className="border-t border-[#5A6B7A] dark:border-[#5A6B7A] pt-3 space-y-1">
              <p className="text-xs font-semibold text-slate-400">Benchmarks</p>
              <div className="flex justify-between text-xs">
                <span className="text-white">Min-Var σ</span>
                <span className="font-mono text-sky-500">{(minVar.risk * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white">Max-Sharpe SR</span>
                <span className="font-mono text-amber-500">{maxSharpe.sharpe.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizContainer>
  );
}
