/**
 * src/visualizations/finance/BlackScholes.jsx
 *
 * Black-Scholes Option Pricing Visualization
 * ──────────────────────────────────────────
 * Formula (call): C = S₀N(d₁) − Ke^{−rT}N(d₂)
 *         (put):  P = Ke^{−rT}N(−d₂) − S₀N(−d₁)
 *
 * Features:
 *  - Sliders: S, K, T, σ, r
 *  - Call / Put toggle
 *  - Real-time price display + Greeks table
 *  - Payoff diagram: intrinsic value vs current B-S price vs spot
 *  - Volatility surface: price vs implied vol
 */

import { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ControlSlider from '../../components/ControlSlider';
import VizContainer from '../../components/VizContainer';
import { bsCall, bsPut, bsGreeks } from '../../utils/mathUtils';

const ACCENT = '#6D8196';
const CALL_COLOR = '#6D8196';
const PUT_COLOR  = '#FFFFE3';

/* ── Greeks table data ── */
const GREEK_META = [
  { key: 'delta',  symbol: 'Δ', name: 'Delta',  desc: 'Price sensitivity to spot'   },
  { key: 'gamma',  symbol: 'Γ', name: 'Gamma',  desc: 'Delta sensitivity to spot'   },
  { key: 'theta',  symbol: 'Θ', name: 'Theta',  desc: 'Time decay (per day)'         },
  { key: 'vega',   symbol: 'ν', name: 'Vega',   desc: 'Price sensitivity to vol +1%' },
  { key: 'rho',    symbol: 'ρ', name: 'Rho',    desc: 'Rate sensitivity +1%'          },
];

// GreekRow removed in favor of compact grid inline

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#4A4A4A] text-white border-none rounded-lg px-3 py-2 shadow-lg text-[13px] space-y-1 font-normal">
      <p className="text-white font-semibold">S = ${Number(label).toFixed(2)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">${Number(p.value).toFixed(3)}</span>
        </p>
      ))}
    </div>
  );
}

function VolTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#4A4A4A] text-white border-none rounded-lg px-3 py-2 shadow-lg text-[13px] space-y-1 font-normal">
      <p className="text-white font-semibold">σ = {(Number(label) * 100).toFixed(0)}%</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">${Number(p.value).toFixed(3)}</span>
        </p>
      ))}
    </div>
  );
}

export default function BlackScholes() {
  const { isDark } = useTheme();

  const [S, setS]         = useState(100);
  const [K, setK]         = useState(100);
  const [T, setT]         = useState(0.5);
  const [sigma, setSigma] = useState(0.2);
  const [r, setR]         = useState(0.05);
  const [type, setType]   = useState('call'); // 'call' | 'put'

  const gridColor = 'rgba(203,203,203,0.1)';
  const textColor = '#CBCBCB';
  const axisLine  = isDark ? '#334155' : '#e2e8f0';

  /* ── Option price ── */
  const price = useMemo(
    () => type === 'call' ? bsCall(S, K, T, r, sigma) : bsPut(S, K, T, r, sigma),
    [S, K, T, r, sigma, type]
  );

  /* ── Greeks ── */
  const greeks = useMemo(() => bsGreeks(S, K, T, r, sigma), [S, K, T, r, sigma]);

  const greekRows = useMemo(() => [
    { ...GREEK_META[0], value: type === 'call' ? greeks.deltaCall : greeks.deltaPut },
    { ...GREEK_META[1], value: greeks.gamma },
    { ...GREEK_META[2], value: type === 'call' ? greeks.thetaCall : greeks.thetaPut },
    { ...GREEK_META[3], value: greeks.vegaPct },
    { ...GREEK_META[4], value: type === 'call' ? greeks.rhoCallPct : greeks.rhoPutPct },
  ], [greeks, type]);

  /* ── Payoff diagram data ── */
  const payoffData = useMemo(() => {
    const lo = S * 0.5;
    const hi = S * 1.5;
    const pts = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const spot = lo + (hi - lo) * (i / n);
      const intrinsic = type === 'call'
        ? Math.max(0, spot - K)
        : Math.max(0, K - spot);
      const bsPrice = type === 'call'
        ? bsCall(spot, K, T, r, sigma)
        : bsPut(spot, K, T, r, sigma);
      pts.push({
        spot: +spot.toFixed(2),
        'Payoff at Expiry': +intrinsic.toFixed(3),
        'BS Price': +bsPrice.toFixed(3),
      });
    }
    return pts;
  }, [S, K, T, r, sigma, type]);

  /* ── Volatility surface data ── */
  const volData = useMemo(() => {
    const pts = [];
    for (let v = 0.05; v <= 1.0; v += 0.025) {
      const p = type === 'call'
        ? bsCall(S, K, T, r, v)
        : bsPut(S, K, T, r, v);
      pts.push({ vol: +v.toFixed(3), Price: +p.toFixed(4) });
    }
    return pts;
  }, [S, K, T, r, type]);

  const optionColor = type === 'call' ? CALL_COLOR : PUT_COLOR;

  const controls = (
    <>
      <ControlSlider label="S — Spot Price" value={S} min={50} max={200} step={1} decimals={0} unit="$" onChange={setS} accentColor={ACCENT} />
      <ControlSlider label="K — Strike Price" value={K} min={50} max={200} step={1} decimals={0} unit="$" onChange={setK} accentColor={ACCENT} />
      <ControlSlider label="T — Time (years)" value={T} min={0.01} max={2} step={0.01} decimals={2} onChange={setT} accentColor={ACCENT} />
      <ControlSlider label="σ — Volatility" value={sigma} min={0.05} max={1.0} step={0.01} decimals={2} onChange={setSigma} accentColor={ACCENT} />
      <ControlSlider label="r — Risk-free Rate" value={r} min={0} max={0.15} step={0.005} decimals={3} onChange={setR} accentColor={ACCENT} />

      {/* Call/Put toggle */}
      <div className="mt-1 flex gap-2">
        <button
          onClick={() => setType('call')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
            ${type === 'call'
              ? 'bg-emerald-500 text-white shadow'
              : 'bg-slate-200 dark:bg-slate-700 text-white dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          Call
        </button>
        <button
          onClick={() => setType('put')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
            ${type === 'put'
              ? 'bg-rose-500 text-white shadow'
              : 'bg-slate-200 dark:bg-slate-700 text-white dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          Put
        </button>
      </div>

      {/* Live price display */}
      <div className="mt-2 rounded-xl p-4 text-center"
        style={{ background: `${optionColor}15`, border: `1px solid ${optionColor}40` }}>
        <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: optionColor }}>
          {type === 'call' ? 'Call' : 'Put'} Price
        </p>
        <p className="text-3xl font-black" style={{ color: optionColor }}>
          ${price.toFixed(3)}
        </p>
        <p className="text-[13px] text-white mt-1">S={S}, K={K}, T={T}y, σ={(sigma * 100).toFixed(0)}%, r={(r * 100).toFixed(1)}%</p>
      </div>

      {/* Greeks */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Greeks</p>
        <div className="grid grid-cols-2 gap-2">
          {greekRows.map((g) => (
            <div key={g.key} className="bg-[#4A4A4A] text-white rounded-lg p-2 flex flex-col items-center justify-center border-none">
               <span className="text-[10px] font-bold text-white mb-0.5">{g.symbol} {g.name}</span>
               <span className="font-mono text-xs font-bold" style={{ color: g.value < 0 ? '#f43f5e' : ACCENT }}>
                 {typeof g.value === 'number' ? g.value.toFixed(4) : '—'}
               </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <VizContainer
      infoTooltip="The Black-Scholes formula prices European options. It assumes constant volatility and log-normal stock prices. The Greeks measure how option price changes with spot price, time, and volatility."
      id="Black-Scholes"
      title="Black-Scholes Option Pricing"
      description="Real-time option pricing with Greeks. Toggle between call and put."
      formula="C = S_0 N(d_1) - Ke^{-rT}N(d_2)"
      formulaLabel="Black-Scholes Call"
      accentColor={ACCENT}
      controls={controls}
    >
      {/* Chart 1: Payoff diagram */}
      <div className="mb-4 bg-[#4A4A4A] p-4 rounded-xl shadow-md">
        <p className="text-[13px] font-semibold text-white mb-2">
          Payoff Diagram vs Spot Price
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={payoffData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={optionColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={optionColor} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="spot"
              type="number"
              domain={['auto', 'auto']}
              tick={{ fill: '#FFFFFF', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#5A6B7A' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <YAxis
              tick={{ fill: '#FFFFFF', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `$${v.toFixed(1)}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4, color: '#FFFFFF' }} />
            <ReferenceLine x={S} stroke="#FFFFFF" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'S', fill: '#FFFFFF', fontSize: 10 }} />
            <ReferenceLine x={K} stroke={optionColor} strokeDasharray="4 3" strokeWidth={1} label={{ value: 'K', fill: optionColor, fontSize: 10 }} />
            <Area type="monotone" dataKey="Payoff at Expiry" stroke="#94a3b8" strokeWidth={2} fill="url(#profitGrad)" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="BS Price" stroke={optionColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart 2: Vol surface */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Option Price vs Volatility (σ)
        </p>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={volData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="vol"
              type="number"
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: axisLine }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `$${v.toFixed(1)}`}
            />
            <Tooltip content={<VolTooltip />} />
            <ReferenceLine x={sigma} stroke={optionColor} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'σ', fill: optionColor, fontSize: 10 }} />
            <Line type="monotone" dataKey="Price" stroke={optionColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </VizContainer>
  );
}
