// src/components/PlayControls.jsx — Ink Wash

import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PlayControls({
  playing, onPlay, onPause, onReset,
  speed, onSpeedChange, accentColor = '#FFFFE3', showSpeed = true,
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 13px', borderRadius: 7, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none', fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'opacity 0.15s, transform 0.1s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
      {/* Play / Pause */}
      <button
        onClick={playing ? onPause : onPlay}
        style={{ ...base, background: '#FFFFE3', color: '#4A4A4A' }}
        aria-label={playing ? 'Pause' : 'Play'}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          ...base,
          background: '#F0F0F0',
          color: '#4A4A4A',
          border: '1px solid rgba(0,0,0,0.1)',
        }}
        aria-label="Reset"
        onMouseEnter={e => { e.currentTarget.style.background = '#E5E5E5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F0F0F0'; }}
      >
        <RotateCcw size={12} /> Reset
      </button>

      {/* Speed chips */}
      {showSpeed && onSpeedChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 3 }}>
          <span style={{ fontSize: 10, color: '#666', marginRight: 2 }}>Speed</span>
          {[0.5, 1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                ...base, padding: '3px 7px', fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace', minWidth: 30,
                background: speed === s ? '#FFFFE3' : 'rgba(255,255,255,0.06)',
                color: speed === s ? '#4A4A4A' : '#999',
                border: speed === s ? 'none' : '1px solid rgba(203,203,203,0.12)',
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
