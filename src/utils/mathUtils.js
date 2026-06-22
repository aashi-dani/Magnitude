/**
 * src/utils/mathUtils.js
 * Mathematical utilities for all visualizations
 * ─────────────────────────────────────────────
 * Includes: normal distribution, Black-Scholes pricing,
 * Greeks, portfolio math, and sampling helpers.
 */

// ── Normal Distribution ──────────────────────────────────────────────────────

/**
 * Standard normal CDF using Abramowitz & Stegun approximation (error < 7.5e-8)
 * @param {number} x
 * @returns {number} Φ(x)
 */
export function normalCDF(x) {
  const b1 =  0.319381530;
  const b2 = -0.356563782;
  const b3 =  1.781477937;
  const b4 = -1.821255978;
  const b5 =  1.330274429;
  const p  =  0.2316419;
  const c  =  0.39894228; // 1/sqrt(2π)

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2.0) *
      t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
  return 1.0 - normalCDF(-x);
}

/**
 * Standard normal PDF φ(x) = exp(-x²/2) / √(2π)
 * @param {number} x
 * @returns {number}
 */
export function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Normal PDF with custom mean μ and std σ
 */
export function normalPDFParams(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return normalPDF(z) / sigma;
}

/**
 * Generate bell curve data for Recharts AreaChart
 * @param {number} mu - mean
 * @param {number} sigma - standard deviation
 * @param {number} [nPoints=300] - number of data points
 * @returns {Array<{x: number, y: number}>}
 */
export function bellCurvePoints(mu, sigma, nPoints = 300) {
  const range = 4 * sigma;
  const lo = mu - range;
  const hi = mu + range;
  const step = (hi - lo) / nPoints;
  const pts = [];
  for (let x = lo; x <= hi; x += step) {
    pts.push({ x: +x.toFixed(4), y: +(normalPDFParams(x, mu, sigma)).toFixed(6) });
  }
  return pts;
}

// ── Black-Scholes ────────────────────────────────────────────────────────────

function _d1(S, K, T, r, sigma) {
  return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
}
function _d2(S, K, T, r, sigma) {
  return _d1(S, K, T, r, sigma) - sigma * Math.sqrt(T);
}

/**
 * Black-Scholes call price
 * @param {number} S - spot price
 * @param {number} K - strike price
 * @param {number} T - time to expiry (years)
 * @param {number} r - risk-free rate (decimal)
 * @param {number} sigma - volatility (decimal)
 * @returns {number}
 */
export function bsCall(S, K, T, r, sigma) {
  if (T <= 1e-9) return Math.max(0, S - K);
  const d1 = _d1(S, K, T, r, sigma);
  const d2 = _d2(S, K, T, r, sigma);
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

/**
 * Black-Scholes put price
 */
export function bsPut(S, K, T, r, sigma) {
  if (T <= 1e-9) return Math.max(0, K - S);
  const d1 = _d1(S, K, T, r, sigma);
  const d2 = _d2(S, K, T, r, sigma);
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

/**
 * Black-Scholes Greeks
 * @returns {{ deltaCall, deltaPut, gamma, vegaPct, thetaCall, thetaPut, rhoCallPct, rhoPutPct }}
 */
export function bsGreeks(S, K, T, r, sigma) {
  if (T <= 1e-9) {
    const itm = S >= K;
    return { deltaCall: itm ? 1 : 0, deltaPut: itm ? 0 : -1, gamma: 0, vegaPct: 0, thetaCall: 0, thetaPut: 0, rhoCallPct: 0, rhoPutPct: 0 };
  }
  const d1 = _d1(S, K, T, r, sigma);
  const d2 = _d2(S, K, T, r, sigma);
  const sqrtT = Math.sqrt(T);
  const nd1  = normalPDF(d1);
  const Nd1  = normalCDF(d1);
  const Nd2  = normalCDF(d2);
  const Nnd1 = normalCDF(-d1);
  const Nnd2 = normalCDF(-d2);

  const deltaCall = Nd1;
  const deltaPut  = Nd1 - 1;
  const gamma     = nd1 / (S * sigma * sqrtT);
  // Vega per 1% move in vol
  const vegaPct   = S * sqrtT * nd1 / 100;
  // Theta per calendar day (negative = time decay)
  const thetaCall = (-(S * nd1 * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * Nd2)  / 365;
  const thetaPut  = (-(S * nd1 * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * Nnd2) / 365;
  // Rho per 1% move in rate
  const rhoCallPct = K * T * Math.exp(-r * T) * Nd2  / 100;
  const rhoPutPct  = -K * T * Math.exp(-r * T) * Nnd2 / 100;

  return { deltaCall, deltaPut, gamma, vegaPct, thetaCall, thetaPut, rhoCallPct, rhoPutPct };
}

/**
 * Generate payoff diagram data (at expiry) for a call or put
 * @param {number} K - strike
 * @param {'call'|'put'} type
 * @param {number} premium - option price (cost)
 * @param {number} [spotRange=0.4] - fraction of K to span either side
 * @returns {Array<{spot, payoff, pnl}>}
 */
export function payoffPoints(K, type, premium, spotRange = 0.5) {
  const lo = K * (1 - spotRange);
  const hi = K * (1 + spotRange);
  const n  = 200;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const spot = lo + (hi - lo) * (i / n);
    const payoff = type === 'call' ? Math.max(0, spot - K) : Math.max(0, K - spot);
    pts.push({ spot: +spot.toFixed(2), payoff: +payoff.toFixed(3), pnl: +(payoff - premium).toFixed(3) });
  }
  return pts;
}

// ── Portfolio Math ───────────────────────────────────────────────────────────

/**
 * Portfolio expected return: Σ wᵢ μᵢ
 */
export function portfolioReturn(weights, returns) {
  return weights.reduce((sum, w, i) => sum + w * returns[i], 0);
}

/**
 * Portfolio variance using covariance matrix
 */
export function portfolioVariance(weights, cov) {
  let v = 0;
  for (let i = 0; i < weights.length; i++)
    for (let j = 0; j < weights.length; j++)
      v += weights[i] * weights[j] * cov[i][j];
  return v;
}

/**
 * Generate random portfolios for efficient frontier scatter plot
 * @param {number[]} returns  - expected returns per asset
 * @param {number[][]} cov    - covariance matrix
 * @param {number} n          - number of random portfolios
 */
export function randomPortfolios(returns, cov, n = 3000) {
  const nAssets = returns.length;
  const pts = [];
  for (let i = 0; i < n; i++) {
    // Random weights summing to 1
    const raw = Array.from({ length: nAssets }, () => Math.random());
    const sum = raw.reduce((a, b) => a + b, 0);
    const w = raw.map(x => x / sum);
    const ret = portfolioReturn(w, returns);
    const risk = Math.sqrt(portfolioVariance(w, cov));
    pts.push({ risk: +risk.toFixed(4), ret: +ret.toFixed(4), weights: w });
  }
  return pts;
}

// ── Statistical Sampling ─────────────────────────────────────────────────────

export const sampleMean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

export function sampleFromDist(dist, size) {
  switch (dist) {
    case 'uniform':
      return Array.from({ length: size }, () => Math.random());
    case 'exponential': {
      const lambda = 1;
      return Array.from({ length: size }, () => -Math.log(1 - Math.random()) / lambda);
    }
    case 'bimodal':
      return Array.from({ length: size }, () =>
        Math.random() < 0.5 ? randn() * 0.5 - 1.5 : randn() * 0.5 + 1.5
      );
    default: // normal
      return Array.from({ length: size }, randn);
  }
}

/** Box-Muller normal sample */
function randn() {
  const u1 = 1 - Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Build a histogram from an array of values
 * @param {number[]} data
 * @param {number} bins
 * @returns {Array<{x: number, count: number, density: number}>}
 */
export function histogram(data, bins = 30) {
  if (!data.length) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;
  const counts = Array(bins).fill(0);
  data.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    counts[idx]++;
  });
  return counts.map((count, i) => ({
    x: +(min + (i + 0.5) * binWidth).toFixed(3),
    count,
    density: +(count / (data.length * binWidth)).toFixed(4),
  }));
}
