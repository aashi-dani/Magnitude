/**
 * src/visualizations/statistics/NormalDistribution.jsx
 *
 * Interactive Normal Distribution Explorer
 * ─────────────────────────────────────────
 * Formula: f(x) = (1 / σ√(2π)) · exp(-(x-μ)² / (2σ²))
 *
 * Features:
 *  - AreaChart bell curve (Recharts)
 *  - μ and σ sliders
 *  - Shaded region between z1 and z2 showing P(z1 < X < z2)
 *  - Stats panel with z-scores and 68-95-99.7 rule
 */

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import VizContainer from '../../components/VizContainer';
import { bellCurvePoints, normalCDF } from '../../utils/mathUtils';

const ACCENT = '#FFFFE3';

/** Custom tooltip for the area chart */
function BellTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const x = payload[0]?.payload?.x;
  const y = payload[0]?.payload?.y;
  if (x == null) return null;
  return (
    <div style={{ background: '#3D3D3D', border: '1px solid rgba(203,203,203,0.18)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#CBCBCB', margin: '0 0 2px' }}>x = <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFF', fontWeight: 600 }}>{x.toFixed(3)}</span></p>
      <p style={{ color: '#CBCBCB', margin: 0 }}>f(x) = <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFF', fontWeight: 600 }}>{y?.toFixed(5)}</span></p>
    </div>
  );
}

export default function NormalDistribution() {
  const { isDark } = useTheme();

  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [z1, setZ1] = useState(-1);
  const [z2, setZ2] = useState(1);

  // Clamp z1/z2 to sensible bounds whenever mu/sigma changes
  const z1Min = mu - 3 * sigma;
  const z1Max = mu;
  const z2Min = mu;
  const z2Max = mu + 3 * sigma;

  const clampedZ1 = Math.max(z1Min, Math.min(z1Max, z1));
  const clampedZ2 = Math.max(z2Min, Math.min(z2Max, z2));

  /** Recharts data: each point has full `y` and optional `shaded` field */
  const chartData = useMemo(() => {
    const pts = bellCurvePoints(mu, sigma, 400);
    return pts.map((p) => ({
      ...p,
      shaded: p.x >= clampedZ1 && p.x <= clampedZ2 ? p.y : undefined,
    }));
  }, [mu, sigma, clampedZ1, clampedZ2]);

  /** P(z1 < X < z2) */
  const prob = useMemo(() => {
    const pZ2 = normalCDF((clampedZ2 - mu) / sigma);
    const pZ1 = normalCDF((clampedZ1 - mu) / sigma);
    return Math.max(0, pZ2 - pZ1);
  }, [mu, sigma, clampedZ1, clampedZ2]);

  const zScoreZ1 = ((clampedZ1 - mu) / sigma).toFixed(2);
  const zScoreZ2 = ((clampedZ2 - mu) / sigma).toFixed(2);

  // 68-95-99.7
  const p68 = (normalCDF(1) - normalCDF(-1)) * 100;
  const p95 = (normalCDF(2) - normalCDF(-2)) * 100;
  const p997 = (normalCDF(3) - normalCDF(-3)) * 100;

  const gridColor  = 'rgba(203,203,203,0.1)';
  const textColor  = '#CBCBCB';
  const axisColor  = 'rgba(203,203,203,0.2)';

  const controls = (
    <>
      <ControlSlider
        label="μ (Mean)"
        value={mu}
        min={-5}
        max={5}
        step={0.1}
        decimals={1}
        onChange={setMu}
        accentColor={ACCENT}
      />
      <ControlSlider
        label="σ (Std Dev)"
        value={sigma}
        min={0.1}
        max={3}
        step={0.05}
        decimals={2}
        onChange={setSigma}
        accentColor={ACCENT}
      />
      <div className="border-t border-[#5A6B7A] dark:border-[#5A6B7A] pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Shaded Region
        </p>
        <ControlSlider
          label="z₁ (lower)"
          value={clampedZ1}
          min={z1Min}
          max={z1Max}
          step={0.05}
          decimals={2}
          onChange={(v) => setZ1(v)}
          accentColor={ACCENT}
        />
        <div className="mt-3" />
        <ControlSlider
          label="z₂ (upper)"
          value={clampedZ2}
          min={z2Min}
          max={z2Max}
          step={0.05}
          decimals={2}
          onChange={(v) => setZ2(v)}
          accentColor={ACCENT}
        />
      </div>

      {/* Stats panel */}
      <div style={{ marginTop: 12, borderRadius: 8, background: '#4A4A4A', color: '#FFFFFF', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
        {[
          ['P(X < μ)', '50.000%'],
          ['P(z₁ < X < z₂)', `${(prob * 100).toFixed(3)}%`],
          ['z-score (z₁)', zScoreZ1],
          ['z-score (z₂)', zScoreZ2],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#FFFFFF' }}>{k}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 8, marginTop: 2 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#CBCBCB', margin: '0 0 6px' }}>68-95-99.7 Rule</p>
          {[['±1σ', p68], ['±2σ', p95], ['±3σ', p997]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ color: '#FFFFFF' }}>{k}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF' }}>{v.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <VizContainer
      infoTooltip="The normal (Gaussian) distribution describes many natural phenomena. μ (mu) is the mean, σ (sigma) is the standard deviation. Adjust both to see how the curve shifts and changes width."
      id="normal-dist"
      title="Normal Distribution Explorer"
      description="Adjust μ and σ to see how the distribution changes. The shaded area shows P(z₁ < X < z₂)."
      formula="f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}"
      formulaLabel="Normal PDF"
      accentColor={ACCENT}
      controls={controls}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.15} />
              <stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="shadedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.55} />
              <stop offset="95%" stopColor={ACCENT} stopOpacity={0.20} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={['auto', 'auto']}
            tickCount={9}
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={{ stroke: axisColor }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <Tooltip content={<BellTooltip />} />
          {/* Full bell curve */}
          <Area
            type="monotone"
            dataKey="y"
            stroke={ACCENT}
            strokeWidth={2}
            fill="url(#bellGrad)"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {/* Shaded probability region */}
          <Area
            type="monotone"
            dataKey="shaded"
            stroke="none"
            strokeWidth={0}
            fill="url(#shadedGrad)"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {/* Reference lines for mean, z1, z2 */}
          <ReferenceLine x={mu} stroke={ACCENT} strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'μ', fill: textColor, fontSize: 11, position: 'insideTopRight' }} />
          <ReferenceLine x={clampedZ1} stroke='#CBCBCB' strokeDasharray="4 3" strokeWidth={1} label={{ value: 'z₁', fill: '#CBCBCB', fontSize: 10, position: 'insideTopLeft' }} />
          <ReferenceLine x={clampedZ2} stroke='#CBCBCB' strokeDasharray="4 3" strokeWidth={1} label={{ value: 'z₂', fill: '#CBCBCB', fontSize: 10, position: 'insideTopRight' }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Probability badge */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: 'rgba(255,255,227,0.1)', color: '#FFFFE3',
          border: '1px solid rgba(255,255,227,0.2)',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: ACCENT, opacity: 0.7, display: 'inline-block' }} />
          P(z₁ &lt; X &lt; z₂) = {(prob * 100).toFixed(3)}%
        </span>
      </div>
    </VizContainer>
  );
}
