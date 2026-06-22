import { useState } from 'react';
// src/pages/Mechanics.jsx
import ProjectileMotion from '../visualizations/mechanics/ProjectileMotion';
import DoublePendulum from '../visualizations/mechanics/DoublePendulum';
import SpringMass from '../visualizations/mechanics/SpringMass';
import OrbitalMechanics from '../visualizations/mechanics/OrbitalMechanics';
import MathText from '../components/MathText';
import { SECTION_MAP } from '../data/sections';

const ACCENT = '#1E3A8A';

const COMPONENTS = {
  'projectile': ProjectileMotion,
  'pendulum': DoublePendulum,
  'spring-mass': SpringMass,
  'orbital': OrbitalMechanics,
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

export default function Mechanics() {
  const [sortOrder, setSortOrder] = useState('Default');
  const section = SECTION_MAP['mechanics'];
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
      <section className="domain-header py-16 px-6" aria-label="Mechanics section">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-100 text-3xl font-mono font-bold select-none">⃗F</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-white/10 text-blue-100 border border-blue-100/30">
              4 Live
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Mechanics
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed">
            From parabolic trajectories to the chaos of a double pendulum — simulate Newtonian
            mechanics in real time with fully interactive controls.
          </p>
          <div className="inline-flex items-center gap-4 bg-[#F0F0F0] rounded-lg px-6 py-4 shadow-sm">
            <span className="text-[#4A4A4A] font-mono text-sm">
              <MathText math="\vec{F} = m\ddot{\vec{r}}" />
            </span>
            <span className="text-[#4A4A4A] text-sm font-medium border-l border-[#4A4A4A]/20 pl-4">Newton's 2nd Law</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="mb-6">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded">
            <option value="default">Default Order</option>
            <option value="easy">Easy → Hard</option>
            <option value="hard">Hard → Easy</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
        {vizList.map(viz => {
          const Component = COMPONENTS[viz.id];
          return Component ? <Component key={viz.id} /> : null;
        })}
      </div>
    </main>
  );
}
