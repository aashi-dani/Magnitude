// src/components/VizContainer.jsx
// Flat, minimal design with info placeholder

import { Info } from 'lucide-react';
import MathText from './MathText';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function VizContainer({
  id, title, description, formula, formulaLabel,
  accentColor = '#1E3A8A', children, controls, fullWidth = false, infoTooltip,
}) {
  return (
    <section id={id} className="rounded-xl overflow-hidden scroll-mt-24 shadow-md" style={{ backgroundColor: '#1a1f2e', border: '1px solid #5A6B7A' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex justify-between items-start" style={{ borderColor: 'rgba(90, 107, 122, 0.4)' }}>
        <div>
          <h2 className="font-sans font-bold text-[20px] mb-1 tracking-tight" style={{ color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            {title}
          </h2>
          <p className="font-sans font-normal text-[13px] leading-relaxed m-0 mt-1" style={{ color: '#CBCBCB' }}>
            {description}
          </p>
        </div>
                {/* Info Placeholder */}
        {infoTooltip ? (
          <>
            <button data-tooltip-id={`tooltip-${id}`} data-tooltip-content={infoTooltip} className="text-gray-400 hover:text-white transition-colors p-2 -mr-2 rounded-full hover:bg-white/10" aria-label="More information">
              <Info size={20} />
            </button>
            <ReactTooltip id={`tooltip-${id}`} place="top" style={{ maxWidth: '300px', zIndex: 100, backgroundColor: '#3D3D3D', color: '#FFFFFF', fontSize: '12px', lineHeight: '1.5' }} />
          </>
        ) : (
          <button className="text-gray-400 hover:text-white transition-colors p-2 -mr-2 rounded-full hover:bg-white/10" aria-label="More information">
            <Info size={20} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className={`p-6 ${fullWidth ? 'block' : 'flex flex-col md:flex-row'} gap-6 items-start`}>
        <div className="flex-1 min-w-0 w-full relative group">
          {children}
        </div>

        {controls && !fullWidth && (
          <div className="rounded-lg p-5 flex flex-col gap-5 w-full md:min-w-[240px] md:max-w-[280px] shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(90, 107, 122, 0.3)' }}>
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase m-0" style={{ color: '#CBCBCB' }}>
              Controls
            </p>
            {controls}
          </div>
        )}

        {controls && fullWidth && (
          <div className="mt-4 rounded-lg p-5 flex flex-row flex-wrap gap-5 w-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(90, 107, 122, 0.3)' }}>
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase m-0 w-full" style={{ color: '#CBCBCB' }}>
              Controls
            </p>
            {controls}
          </div>
        )}
      </div>

      {/* Formula strip */}
      {formula && (
        <div className="px-6 py-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: 'rgba(90, 107, 122, 0.4)', backgroundColor: '#4A4A4A' }}>
          <span className="font-mono text-[12px]" style={{ color: '#FFFFFF' }}>
            <MathText math={formula} />
          </span>
          {formulaLabel && (
            <span className="font-sans text-[12px] border-l pl-4" style={{ color: '#CBCBCB', borderColor: 'rgba(90, 107, 122, 0.4)' }}>
              {formulaLabel}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
