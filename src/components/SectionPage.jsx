// src/components/SectionPage.jsx
// Reusable template for all 5 section stub pages

import VizCard from './VizCard';
import MathText from './MathText';

const SECTION_MATH = {
  pure: { formula: 'e^{i\\pi} + 1 = 0', label: "Euler's Identity" },
  statistics: { formula: '\\bar{X}_n \\xrightarrow{d} \\mathcal{N}(\\mu, \\sigma^2/n)', label: 'Central Limit Theorem' },
  mechanics: { formula: 'F = ma = m\\ddot{x}', label: "Newton's Second Law" },
  abstract: { formula: '|G| = |H| \\cdot [G:H]', label: "Lagrange's Theorem" },
  finance: { formula: 'C = S_0 N(d_1) - Ke^{-rT}N(d_2)', label: 'Black-Scholes (Call)' },
  mathematicians: { formula: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}', label: "Basel Problem (Euler)" },
};

/**
 * @param {object} props
 * @param {import('../data/sections').SECTIONS[0]} props.section
 */
export default function SectionPage({ section }) {
  const mathInfo = SECTION_MATH[section.id];

  return (
    <main className="min-h-screen">
      {/* Section hero */}
      <section
        className={`${section.bgClass} relative overflow-hidden`}
        aria-label={`${section.title} overview`}
      >
        {/* Floating math symbols background */}
        <div className="math-float-container">
          {['∫', '∑', '∂', 'π', '∞', '√', 'Δ', 'λ', 'θ', 'σ'].map((sym, i) => (
            <span
              key={i}
              className="math-symbol animate-float"
              style={{
                left: `${(i * 11 + 5) % 95}%`,
                top: `${(i * 17 + 10) % 80}%`,
                fontSize: `${1.5 + (i % 3) * 0.8}rem`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${5 + (i % 3)}s`,
              }}
            >
              {sym}
            </span>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-20">
          {/* Icon + badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/30 text-5xl font-mono font-bold select-none">
              {section.icon}
            </span>
            <span className="section-badge bg-white/10 text-white/80 border border-white/20">
              {section.visualizations.length} Visualizations
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {section.title}
          </h1>
          <p className="text-lg text-white/70 mb-6 max-w-2xl leading-relaxed">
            {section.description}
          </p>

          {/* Featured formula */}
          {mathInfo && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm
              border border-white/20 rounded-xl px-5 py-3">
              <div className="text-white/90 font-mono text-sm">
                <MathText math={mathInfo.formula} />
              </div>
              <span className="text-white/40 text-xs font-medium border-l border-white/20 pl-3">
                {mathInfo.label}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Visualizations grid */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Visualizations
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Interactive explorations — being built in Phase 2. Click any card to jump to it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {section.visualizations.map((viz, i) => (
            <VizCard
              key={viz.id}
              viz={viz}
              accentColor={section.color}
              index={i}
            />
          ))}
        </div>

        {/* Phase 2 callout */}
        <div
          className="mt-10 rounded-2xl p-6 border"
          style={{
            backgroundColor: `${section.color}0d`,
            borderColor: `${section.color}30`,
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">{section.emoji}</span>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                Phase 2: Full Interactivity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                All visualizations will be fully interactive with real-time parameter controls,
                smooth 60fps animations, and educational tooltips. Priority picks for this section
                are: <strong className="text-slate-700 dark:text-slate-300">
                  {section.visualizations.slice(0, 2).map(v => v.title).join(' + ')}.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
