import { useState } from 'react';
import ComplexNumbers from '../visualizations/pure/ComplexNumbers';
import PolarCoordinates from '../visualizations/pure/PolarCoordinates';
import Mandelbrot from '../visualizations/pure/Mandelbrot';
import MatrixTransformations from '../visualizations/pure/MatrixTransformations';
import ParametricCurves from '../visualizations/pure/ParametricCurves';
import HyperbolicFunctions from '../visualizations/pure/HyperbolicFunctions';
import FourierSeries from '../visualizations/pure/FourierSeries';
import ThreeDSurfaces from '../visualizations/pure/3DSurfaces';
import MathText from '../components/MathText';
import { SECTION_MAP } from '../data/sections';

const COMPONENTS = {
  'complex-numbers': ComplexNumbers,
  'polar-coordinates': PolarCoordinates,
  'mandelbrot': Mandelbrot,
  'matrix-transformations': MatrixTransformations,
  'parametric-curves': ParametricCurves,
  'hyperbolic-functions': HyperbolicFunctions,
  'fourier-series': FourierSeries,
  '3d-surfaces': ThreeDSurfaces,
};
const DIFFICULTY_RANK = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

export default function Pure() {
  const [sortOrder, setSortOrder] = useState('Default');
  const section = SECTION_MAP['pure'];
  let vizList = [...section.visualizations];

  if (sortOrder === 'easy') {
    vizList.sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);
  } else if (sortOrder === 'hard') {
    vizList.sort((a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty]);
  } else if (sortOrder === 'alpha') {
    vizList.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="domain-header py-16 px-6" aria-label="Pure Mathematics section">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-blue-100 text-5xl font-mono font-bold select-none">∑</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-blue-100 border border-blue-100/30">
              8 Visualizations
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Pure Mathematics</h1>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl leading-relaxed">
            Explore the abstract beauty of mathematics — from complex numbers dancing in the Argand plane
            to fractal infinities at the boundary of the Mandelbrot set.
          </p>
          <div className="inline-flex items-center gap-3 bg-[#F0F0F0] rounded-xl px-5 py-3 shadow-sm">
            <span className="text-[#4A4A4A] font-mono text-sm"><MathText math="e^{i\pi} + 1 = 0" /></span>
            <span className="text-[#4A4A4A] text-xs font-medium border-l border-[#4A4A4A]/20 pl-3">Euler's Identity</span>
          </div>
        </div>
      </section>

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
            return Comp ? <Comp key={viz.id} /> : null;
          })}
        </div>
      </div>
    </main>
  );
}
