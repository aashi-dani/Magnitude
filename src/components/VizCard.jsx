// src/components/VizCard.jsx
// Placeholder card for a visualization in a section stub page

import { Clock } from 'lucide-react';

/**
 * @param {object} props
 * @param {{ id: string, title: string, desc: string }} props.viz
 * @param {string} props.accentColor - hex color for this section
 * @param {number} props.index - For staggered animation
 */
export default function VizCard({ viz, accentColor, index = 0 }) {
  return (
    <div
      id={viz.id}
      className="viz-placeholder p-6 scroll-mt-24"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-slate-800 dark:text-white text-base leading-snug pr-2">
          {viz.title}
        </h3>
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
            whitespace-nowrap flex-shrink-0"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          <Clock size={10} />
          Coming soon
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        {viz.desc}
      </p>

      {/* Placeholder canvas area */}
      <div
        className="w-full h-48 rounded-xl flex items-center justify-center
          border-2 border-dashed border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden"
      >
        {/* Animated gradient shimmer */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${accentColor}, transparent 60%),
                         radial-gradient(ellipse at 70% 60%, ${accentColor}, transparent 60%)`
          }}
        />
        <div className="text-center z-10">
          <div
            className="text-4xl mb-2 opacity-20 font-mono font-bold"
            style={{ color: accentColor }}
          >
            ∿
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Visualization coming in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
}
