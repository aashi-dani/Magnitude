// src/pages/Mathematicians.jsx
// Hall of Fame — flat, minimal design

import MathText from '../components/MathText';

const MATHEMATICIANS = [
  {
    id: 'euler',
    name: 'Leonhard Euler',
    era: '1707–1783',
    nationality: 'Swiss',
    symbol: 'e',
    bio: 'The most prolific mathematician in history, Euler produced landmark work in virtually every branch of mathematics. He introduced modern notation (f(x), Σ, i, e, π), solved the Königsberg bridge problem — founding graph theory — and established complex analysis.',
    contributions: [
      { title: "Euler's Identity", math: "e^{i\\pi} + 1 = 0", vizId: 'complex-numbers' },
      { title: 'Graph Theory', math: '\\sum_{v} \\deg(v) = 2|E|', vizId: 'graph-explorer' },
    ],
    tags: ['Complex Analysis', 'Graph Theory', 'Number Theory'],
  },
  {
    id: 'gauss',
    name: 'Carl Friedrich Gauss',
    era: '1777–1855',
    nationality: 'German',
    symbol: 'G',
    bio: 'Known as the "Prince of Mathematics", Gauss made revolutionary contributions to number theory, statistics, and differential geometry before the age of 25. He proved the fundamental theorem of algebra and developed the method of least squares.',
    contributions: [
      { title: 'Normal Distribution', math: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}', vizId: 'normal-dist' },
      { title: 'Fund. Theorem of Algebra', math: 'p(z) = a_n z^n + \\cdots + a_0 = 0', vizId: 'complex-numbers' },
    ],
    tags: ['Statistics', 'Number Theory', 'Differential Geometry'],
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    era: '1643–1727',
    nationality: 'English',
    symbol: 'N',
    bio: 'Newton single-handedly invented calculus (in parallel with Leibniz), formulated the laws of motion and universal gravitation, and developed the foundations of classical mechanics. His Principia Mathematica is among the most influential scientific works ever written.',
    contributions: [
      { title: "Newton's 2nd Law", math: 'F = m\\ddot{x}', vizId: 'projectile' },
      { title: 'Gravitational Orbits', math: 'F = \\frac{Gm_1 m_2}{r^2}', vizId: 'orbital' },
    ],
    tags: ['Mechanics', 'Calculus', 'Optics'],
  },
  {
    id: 'ramanujan',
    name: 'Srinivasa Ramanujan',
    era: '1887–1920',
    nationality: 'Indian',
    symbol: 'R',
    bio: 'Largely self-taught in rural India, Ramanujan independently discovered thousands of results in number theory, infinite series, and continued fractions. His work on the partition function and mock theta functions continues to influence modern mathematics and string theory.',
    contributions: [
      { title: 'Rogers–Ramanujan', math: '\\sum_{n=0}^{\\infty}\\frac{q^{n^2}}{(q;q)_n}', vizId: 'pure' },
      { title: 'Infinite Series for π', math: '\\frac{1}{\\pi} = \\frac{2\\sqrt{2}}{9801}\\sum_{k=0}^{\\infty}...', vizId: 'parametric-curves' },
    ],
    tags: ['Number Theory', 'Infinite Series', 'Partition Theory'],
  },
  {
    id: 'riemann',
    name: 'Bernhard Riemann',
    era: '1826–1866',
    nationality: 'German',
    symbol: 'ζ',
    bio: 'Despite living only 39 years, Riemann transformed multiple branches of mathematics. His 1854 lecture on geometry gave Einstein the language for general relativity. His work on the distribution of primes led to the Riemann Hypothesis.',
    contributions: [
      { title: 'Riemann Hypothesis', math: 'Z(s) = 0 \\Rightarrow \\text{Re}(s) = \\frac{1}{2}', vizId: 'complex-numbers' },
      { title: 'Zeta Function', math: '\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}', vizId: 'complex-numbers' },
    ],
    tags: ['Complex Analysis', 'Geometry', 'Number Theory'],
  },
  {
    id: 'noether',
    name: 'Emmy Noether',
    era: '1882–1935',
    nationality: 'German',
    symbol: 'A',
    bio: 'Noether revolutionized abstract algebra with her theory of rings, fields, and algebras. Her landmark theorem — Noether\'s theorem — is the foundation of modern physics, proving that every continuous symmetry in nature corresponds to a conserved quantity.',
    contributions: [
      { title: "Noether's Theorem", math: '\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}} - \\frac{\\partial L}{\\partial q} = 0', vizId: 'mechanics' },
      { title: 'Ring Theory', math: 'a(b+c) = ab + ac', vizId: 'abstract' },
    ],
    tags: ['Abstract Algebra', 'Theoretical Physics', 'Ring Theory'],
  },
  {
    id: 'bayes',
    name: 'Thomas Bayes',
    era: '1701–1761',
    nationality: 'English',
    symbol: 'P',
    bio: 'A Presbyterian minister and amateur mathematician, Bayes formulated what became one of the most important theorems in probability and statistics. Bayes\' theorem describes how to update the probability of a hypothesis given new evidence.',
    contributions: [
      { title: "Bayes' Theorem", math: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}', vizId: 'bayesian' },
    ],
    tags: ['Statistics', 'Probability', 'Inference'],
  },
  {
    id: 'Black-Scholes-merton',
    name: 'Fischer Black & Myron Scholes',
    era: '1938–1995 / 1941–',
    nationality: 'American',
    symbol: 'BS',
    bio: 'Black and Scholes (with Robert Merton) derived the partial differential equation that describes option pricing under log-normal asset dynamics. Published in 1973, it transformed financial markets and led to the modern derivatives industry.',
    contributions: [
      { title: 'Black-Scholes PDE', math: '\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2\\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0', vizId: 'Black-Scholes' },
    ],
    tags: ['Finance', 'PDE', 'Stochastic Calculus'],
  },
];

export default function Mathematicians() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="domain-header py-16 px-6" aria-label="Mathematicians hall of fame hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-white/50 text-3xl font-mono font-bold">∞</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white border border-white/20">
              {MATHEMATICIANS.length} Mathematicians
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            The giants whose ideas — centuries, sometimes millennia later — still power our simulations,
            price our options, and describe our universe.
          </p>
        </div>
      </section>

      {/* Grid of mathematician cards */}
      <section className="max-w-6xl mx-auto px-6 py-16" aria-label="Mathematician cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MATHEMATICIANS.map((m) => (
            <article
              key={m.id}
              id={m.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-lg font-mono shrink-0">
                  {m.symbol.length > 1 ? m.symbol[0] : m.symbol}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg tracking-tight">
                    {m.name}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {m.era} · {m.nationality}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {m.bio}
                </p>

                {/* Key contributions with formulas */}
                <div className="space-y-3 mb-6 flex-1">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 m-0">Contributions</p>
                  {m.contributions.map((c) => (
                    <div key={c.title} className="bg-gray-50 border border-gray-200 rounded p-3">
                      <div className="text-xs font-semibold text-gray-900 mb-2">
                        {c.title}
                      </div>
                      <div className="text-xs text-gray-700 overflow-x-auto pb-1">
                        <MathText math={c.math} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {m.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
