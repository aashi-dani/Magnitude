/**
 * src/visualizations/statistics/CLTSimulator.jsx
 *
 * Central Limit Theorem Interactive Simulator
 * ─────────────────────────────────────────────
 * Formula: X̄_n → N(μ, σ²/n)  as  n → ∞
 *
 * Features:
 *  - Distribution selector (uniform / exponential / bimodal)
 *  - Sample size slider (n = 1–100)
 *  - Left: static histogram of the underlying distribution
 *  - Right: accumulating histogram of sample means + normal overlay
 *  - Draw 1 / Draw 100 / Clear controls
 *  - Live stats: count, mean of means, std of means, expected std
 */

import { useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  ComposedChart,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import VizContainer from '../../components/VizContainer';
import {
  sampleFromDist, sampleMean, histogram, bellCurvePoints,
} from '../../utils/mathUtils';

const ACCENT = '#FFFFE3';
const DIST_OPTIONS = ['uniform', 'exponential', 'bimodal'];

/** Distribution display metadata */
const DIST_META = {
  uniform:     { label: 'Uniform',     mu: 0.5,   sigma: Math.sqrt(1 / 12) },
  exponential: { label: 'Exponential', mu: 1.0,   sigma: 1.0 },
  bimodal:     { label: 'Bimodal',     mu: 0.0,   sigma: Math.sqrt(1.0 + 2.25) },
};

/** Generate a static preview histogram for the underlying distribution */
function previewHistogram(dist, nSamples = 5000) {
  const data = sampleFromDist(dist, nSamples);
  return histogram(data, 30);
}

function StatBox({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-[#4A4A4A] text-white text-[13px] font-normal p-3 rounded-lg">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">{label}</span>
      <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}

export default function CLTSimulator() {
  const { isDark } = useTheme();

  const [dist, setDist]   = useState('uniform');
  const [n, setN]         = useState(30);
  const [means, setMeans] = useState([]);
  const [flash, setFlash] = useState(false);

  const gridColor = 'rgba(203,203,203,0.1)';
  const textColor = '#CBCBCB';

  /* ── Underlying distribution histogram (static, re-generated when dist changes) ── */
  const distHist = useMemo(() => previewHistogram(dist, 5000), [dist]);

  /* ── Sample means histogram ── */
  const meansHist = useMemo(() => {
    if (!means.length) return [];
    return histogram(means, 30);
  }, [means]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!means.length) return null;
    const m = sampleMean(means);
    const variance = means.reduce((acc, v) => acc + (v - m) ** 2, 0) / means.length;
    const std = Math.sqrt(variance);
    const meta = DIST_META[dist];
    const expectedStd = meta.sigma / Math.sqrt(n);
    return { m, std, expectedStd };
  }, [means, dist, n]);

  /* ── Normal curve overlay for means histogram ── */
  const normalOverlay = useMemo(() => {
    if (!means.length || !stats) return [];
    const mu = stats.m;
    const sigma = stats.expectedStd || stats.std || 0.01;
    const pts = bellCurvePoints(mu, sigma, 200);
    // Scale by total area (count * binWidth)
    const total = means.length;
    const minV = Math.min(...means);
    const maxV = Math.max(...means);
    const binWidth = (maxV - minV) / 30 || 0.01;
    return pts.map((p) => ({
      x: p.x,
      curve: +(p.y * total * binWidth).toFixed(3),
    }));
  }, [means, stats]);

  /* ── Draw helpers ── */
  const drawOne = useCallback(() => {
    const sample = sampleFromDist(dist, n);
    const m = sampleMean(sample);
    setMeans((prev) => [...prev, m]);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }, [dist, n]);

  const draw100 = useCallback(() => {
    const newMeans = Array.from({ length: 100 }, () => {
      const sample = sampleFromDist(dist, n);
      return sampleMean(sample);
    });
    setMeans((prev) => [...prev, ...newMeans]);
  }, [dist, n]);

  const clear = useCallback(() => setMeans([]), []);

  /* ── Controls ── */
  const controls = (
    <>
      {/* Distribution selector */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Distribution</span>
        <div className="flex gap-1 flex-wrap">
          {DIST_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => { setDist(d); setMeans([]); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                ${d === dist
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-200 dark:bg-slate-700 text-[#CBCBCB] dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
            >
              {DIST_META[d].label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-[180px]">
        <ControlSlider
          label={`Sample Size n = ${n}`}
          value={n}
          min={1}
          max={100}
          step={1}
          decimals={0}
          onChange={setN}
          accentColor={ACCENT}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap items-end">
        <button
          onClick={drawOne}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow
            ${flash ? 'scale-95' : 'scale-100'}
            bg-sky-500 hover:bg-sky-600 active:scale-95`}
        >
          Draw 1 Sample
        </button>
        <button
          onClick={draw100}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-95 shadow"
        >
          Draw 100
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#CBCBCB] dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95"
        >
          Clear
        </button>
      </div>
    </>
  );

  return (
    <VizContainer
      infoTooltip="The Central Limit Theorem states that the average of many random samples from ANY distribution approaches a normal distribution. Try different underlying distributions to see this in action."
      id="clt-simulator"
      title="Central Limit Theorem Simulator"
      description="Watch sample means converge to a normal distribution regardless of the underlying distribution."
      formula="\bar{X}_n \xrightarrow{d} \mathcal{N}\!\left(\mu, \frac{\sigma^2}{n}\right)"
      formulaLabel="CLT"
      accentColor={ACCENT}
      fullWidth
      controls={controls}
    >
      {/* Two charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Underlying distribution */}
        <div className="bg-[#4A4A4A] text-white text-[13px] font-normal p-3 rounded-lg border-none">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Underlying Distribution — {DIST_META[dist].label}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distHist} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barCategoryGap="5%">
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="x" tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} />
              <YAxis tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                  contentStyle={{ background: '#3D3D3D', border: '1px solid rgba(203,203,203,0.2)', borderRadius: 8, fontSize: 11, color: '#CBCBCB' }}
                formatter={(v, name) => [v, 'Count']}
                labelFormatter={(l) => `x ≈ ${l}`}
              />
              <Bar dataKey="count" fill={ACCENT} fillOpacity={0.7} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: Sample means histogram */}
        <div className={`rounded-xl border p-3 transition-all
          ${flash
            ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/10'
            : 'border-[#5A6B7A] dark:border-[#5A6B7A] bg-[#4A4A4A] dark:bg-[#4A4A4A]/30'}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Distribution of Sample Means ({means.length} samples)
          </p>
          {means.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-[#CBCBCB]">Press "Draw 1 Sample" or "Draw 100" to begin</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={meansHist} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="x" tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} />
                <YAxis tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ background: '#3D3D3D', border: '1px solid rgba(203,203,203,0.2)', borderRadius: 8, fontSize: 11, color: '#CBCBCB' }}
                  formatter={(v, name) => [v, name === 'count' ? 'Count' : 'Normal fit']}
                  labelFormatter={(l) => `x̄ ≈ ${Number(l).toFixed(3)}`}
                />
                <Bar dataKey="count" fill="#6366f1" fillOpacity={0.7} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Samples" value={means.length} />
          <StatBox label="Mean of Means" value={stats.m.toFixed(4)} />
          <StatBox label="Std of Means" value={stats.std.toFixed(4)} />
          <StatBox label={`Expected Std (σ/√n)`} value={stats.expectedStd.toFixed(4)} />
        </div>
      )}

      {/* Convergence hint */}
      {means.length >= 100 && (
        <div className="mt-3 bg-[#4A4A4A] text-white text-[13px] font-normal p-3 rounded-lg text-center">
          🎯 With {means.length} samples, the distribution of means is approaching a normal distribution — the CLT in action!
        </div>
      )}
    </VizContainer>
  );
}
