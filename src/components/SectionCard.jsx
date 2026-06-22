// src/components/SectionCard.jsx
// Flat, minimal design

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionCard({ section, index = 0 }) {
  return (
    <Link
      to={section.route}
      id={`section-card-${section.id}`}
      className="block bg-white rounded-xl overflow-hidden border border-gray-200 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50"
    >
      <div className="p-8">
        {/* Icon + emoji */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center text-xl font-bold font-mono">
            {section.icon}
          </div>
          <span className="text-2xl opacity-20 grayscale">{section.emoji}</span>
        </div>

        {/* Text */}
        <h3 className="font-bold text-xl text-gray-900 mb-2 tracking-tight">
          {section.title}
        </h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          {section.tagline}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-8 line-clamp-2">
          {section.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500">
            {section.visualizations.length} visualizations
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:gap-2 transition-all">
            Explore <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
