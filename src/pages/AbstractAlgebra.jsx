import { useState } from 'react';
// src/pages/AbstractAlgebra.jsx
import SortingVisualizer from '../visualizations/abstract/SortingVisualizer';
import GraphExplorer from '../visualizations/abstract/GraphExplorer';
import RecursionTrees from '../visualizations/abstract/RecursionTrees';
import LatticePoset from '../visualizations/abstract/LatticePoset';
import MathText from '../components/MathText';
import { SECTION_MAP } from '../data/sections';

const COMPONENTS = {
  'sorting': SortingVisualizer,
  'graph-explorer': GraphExplorer,
  'recursion-trees': RecursionTrees,
  'lattice': LatticePoset,
};
const DIFFICULTY_RANK = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

function StubCard({ id, title, desc }) {
  return (
    <div id={id} className="bg-white rounded-xl overflow-hidden border border-gray-200 scroll-mt-24">
      <div className="h-1 bg-blue-900" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-bold text-xl text-gray-900">{title}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ml-3 bg-gray-100 text-gray-500">
            Phase 3
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">{desc}</p>
        <div className="h-32 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          <span className="text-gray-400 font-mono text-xl">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default function AbstractAlgebra() {
  const [sortOrder, setSortOrder] = useState('Default');
  const section = SECTION_MAP['abstract'];
  let vizList = [...section.visualizations];

  if (sortOrder === 'easy') {
    vizList.sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);
  } else if (sortOrder === 'hard') {
    vizList.sort((a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty]);
  } else if (sortOrder === 'alpha') {
    vizList.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="domain-header py-16 px-6" aria-label="Abstract Algebra section">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-blue-100 text-5xl font-mono font-bold select-none">∀</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold
              tracking-widest uppercase bg-white/10 text-blue-100 border border-blue-100/30">
              4 Visualizations
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Abstract Algebra & Discrete Math
          </h1>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl leading-relaxed">
            Step through sorting algorithms, explore graph structures with force-directed layouts,
            and visualize recursion trees with memoization.
          </p>
          <div className="inline-flex items-center gap-3 bg-[#F0F0F0] rounded-xl px-5 py-3 shadow-sm">
            <span className="text-[#4A4A4A] font-mono text-sm">
              <MathText math="|G| = |H| \cdot [G:H]" />
            </span>
            <span className="text-[#4A4A4A] text-xs font-medium border-l border-[#4A4A4A]/20 pl-3">
              Lagrange's Theorem
            </span>
          </div>
        </div>
      </section>

      {/* Visualizations */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded">
            <option value="default">Default Order</option>
            <option value="easy">Easy → Hard</option>
            <option value="hard">Hard → Easy</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
        <div className="space-y-10">
          {vizList.map(viz => {
            const Comp = COMPONENTS[viz.id];
            if (Comp) return <Comp key={viz.id} />;
            return <StubCard key={viz.id} {...viz} />;
          })}
        </div>
      </div>
    </main>
  );
}
