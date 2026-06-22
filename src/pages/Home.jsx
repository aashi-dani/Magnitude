// src/pages/Home.jsx
// Flat, minimal redesign (Navy & Grey)

import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch } from 'lucide-react';
import SectionCard from '../components/SectionCard';
import MathText from '../components/MathText';
import ConceptOfDay from '../components/ConceptOfDay';
import { SECTIONS } from '../data/sections';

const STATS = [
  { value: '26', label: 'Visualizations' },
  { value: '5', label: 'Math Domains' },
  { value: '100%', label: 'Open Source' },
  { value: '∞', label: 'Explorable' },
];



export default function Home() {
  return (
    <main className="bg-white">
      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 md:pt-40 md:pb-32 overflow-hidden border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 tracking-tight leading-[1.1]">
            Visualize Mathematics
          </h1>

          {/* Sub-headline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            An open-source interactive platform for deep mathematical exploration.
            Go beyond static graphs — parametrize, animate, discover.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/pure" className="btn-primary text-base px-8 py-4">
              Explore Visualizations
              <ArrowRight size={18} />
            </Link>
            <a href="https://github.com/aashi-dani/mathviz" target="_blank" rel="noopener noreferrer" className="btn-outline text-base px-8 py-4">
              <GitBranch size={18} />
              View on GitHub
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-2xl mx-auto border-t border-gray-100 pt-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONCEPT OF THE DAY ===== */}
      <section className="py-16 px-6 bg-gray-50 border-b border-gray-200" aria-label="Concept of the Day">
        <div className="max-w-5xl mx-auto">
          <ConceptOfDay />
        </div>
      </section>

      {/* ===== SECTION CARDS ===== */}
      <section className="py-24 px-6 bg-white border-b border-gray-200" aria-label="Explore sections">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              5 Worlds of Mathematics
            </h2>
            <p className="text-gray-600 max-w-2xl text-lg">
              From elegant pure structures to quantitative finance —
              explore mathematics at depth and beyond.
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-wrap justify-center gap-8">
            {SECTIONS.filter(s => s.id !== 'mathematicians').map((section, i) => (
              <div key={section.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.4rem)]">
                <SectionCard section={section} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== CTA BANNER ===== */}
      <section className="py-24 px-6 bg-white border-t border-gray-200" aria-label="Call to action">
        <div className="max-w-4xl mx-auto bg-[#0F172A] rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white">Ready to explore?</h2>
          <p className="text-gray-300 mb-10 max-w-xl mx-auto text-lg">
            Start with complex numbers and Euler's formula,
            or jump straight to Black-Scholes option pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pure" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              Start with Pure Math <ArrowRight size={16} />
            </Link>
            <Link to="/finance" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              Jump to Finance <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
