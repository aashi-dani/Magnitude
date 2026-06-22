// src/components/ConceptOfDay.jsx
// Flat, minimal design

import { Link } from 'react-router-dom';
import MathText from './MathText';

const CONCEPTS = [
  {
    name: "Euler's Identity",
    formula: 'e^{i\\pi} + 1 = 0',
    desc: 'The most beautiful equation — uniting five fundamental constants: e, i, π, 1, and 0.',
    route: '/pure',
    anchor: 'complex-numbers',
    tag: 'Pure Mathematics',
  },
  {
    name: "Central Limit Theorem",
    formula: '\\bar{X}_n \\xrightarrow{d} \\mathcal{N}\\!\\left(\\mu, \\tfrac{\\sigma^2}{n}\\right)',
    desc: 'Sample means converge to a normal distribution regardless of the underlying population shape.',
    route: '/statistics',
    anchor: 'clt-simulator',
    tag: 'Statistics',
  },
  {
    name: "Black-Scholes Formula",
    formula: 'C = S_0 N(d_1) - Ke^{-rT}N(d_2)',
    desc: 'A Nobel Prize-winning equation for pricing options using volatility, time, and risk-free rate.',
    route: '/finance',
    anchor: 'Black-Scholes',
    tag: 'Finance',
  },
  {
    name: "Mandelbrot Iteration",
    formula: 'z_{n+1} = z_n^2 + c, \\quad z_0 = 0',
    desc: 'An infinitely complex fractal boundary born from the simplest two-step iteration.',
    route: '/pure',
    anchor: 'mandelbrot',
    tag: 'Pure Mathematics',
  },
  {
    name: "Normal Distribution",
    formula: 'f(x) = \\tfrac{1}{\\sigma\\sqrt{2\\pi}}\\, e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    desc: 'The bell curve describes everything from measurement errors to heights — 68% within one σ of the mean.',
    route: '/statistics',
    anchor: 'normal-dist',
    tag: 'Statistics',
  },
  {
    name: "Newton's Second Law",
    formula: '\\vec{F} = m\\ddot{\\vec{r}}',
    desc: 'Force equals mass times acceleration — the cornerstone of classical mechanics from pendulums to planets.',
    route: '/mechanics',
    anchor: 'projectile',
    tag: 'Mechanics',
  },
  {
    name: "Markowitz Optimization",
    formula: '\\min_{w}\\; w^\\top \\Sigma w \\quad \\text{s.t.}\\ \\mathbf{1}^\\top w = 1',
    desc: 'Minimize portfolio risk for a given expected return — the birth of modern portfolio theory (1952).',
    route: '/finance',
    anchor: 'markowitz',
    tag: 'Finance',
  },
  {
    name: "Chaos & Double Pendulum",
    formula: '\\theta_1(0) \\approx \\theta_1\'(0) \\;\\Rightarrow\\; \\theta_2(t) \\not\\approx \\theta_2\'(t)',
    desc: 'Tiny differences in initial conditions produce wildly divergent trajectories — deterministic yet unpredictable.',
    route: '/mechanics',
    anchor: 'pendulum',
    tag: 'Mechanics',
  },
  {
    name: "Merge Sort Recurrence",
    formula: 'T(n) = 2T\\!\\left(\\tfrac{n}{2}\\right) + O(n) = O(n \\log n)',
    desc: 'Divide and conquer: split an array in half recursively, merge in linear time — near-optimal by comparison bound.',
    route: '/abstract',
    anchor: 'sorting',
    tag: 'Discrete Math',
  },
  {
    name: "Euler's Formula",
    formula: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    desc: 'Complex exponentials encode rotation — the foundation of Fourier analysis, signal processing, and quantum mechanics.',
    route: '/pure',
    anchor: 'complex-numbers',
    tag: 'Pure Mathematics',
  },
  {
    name: "Bayes' Theorem",
    formula: 'P(A\\mid B) = \\dfrac{P(B\\mid A)\\,P(A)}{P(B)}',
    desc: "Update beliefs as evidence arrives — the mathematical engine behind machine learning and scientific inference.",
    route: '/statistics',
    anchor: 'normal-dist',
    tag: 'Statistics',
  },
  {
    name: "Lissajous Figures",
    formula: '(x,y) = (A\\sin(at+\\delta),\\; B\\sin(bt))',
    desc: 'When two perpendicular oscillations share rational frequency ratios, they trace closed parametric curves.',
    route: '/pure',
    anchor: 'parametric-curves',
    tag: 'Pure Mathematics',
  },
];

function getDailyIndex() {
  const dateStr = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % CONCEPTS.length;
}

export default function ConceptOfDay() {
  const c = CONCEPTS[getDailyIndex()];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start justify-between" aria-label="Math Concept of the Day">
      
      <div className="flex-1">
        {/* Top row: tag + date badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-900">
            Concept of the Day
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            {c.tag}
          </span>
        </div>

        {/* Concept name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {c.name}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-2xl">
          {c.desc}
        </p>

        {/* CTA */}
        <Link
          to={`${c.route}#${c.anchor}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Explore visualization →
        </Link>
      </div>

      {/* Formula Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-8 flex items-center justify-center shrink-0 w-full md:w-auto min-w-[280px]">
        <MathText math={c.formula} />
      </div>

    </div>
  );
}

export { CONCEPTS, getDailyIndex };
