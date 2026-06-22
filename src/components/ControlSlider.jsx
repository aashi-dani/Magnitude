// src/components/ControlSlider.jsx — Ink Wash uniform slider

export default function ControlSlider({
  label, value, min, max, step = 0.01, unit = '', decimals = 2,
  onChange, accentColor = '#FFFFE3', disabled = false,
}) {
  const display = typeof value === 'number' ? value.toFixed(decimals) : String(value);

  return (
    <div style={{ marginBottom: 0 }}>
      {/* Label row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 7,
      }}>
        <span style={{
          fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif',
          color: '#CBCBCB', fontWeight: 500, userSelect: 'none',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
          color: '#FFFFFF', fontWeight: 600,
          background: 'rgba(255,255,255,0.07)',
          padding: '1px 7px', borderRadius: 5,
          border: '1px solid rgba(203,203,203,0.12)',
          minWidth: 44, textAlign: 'right',
        }}>
          {display}{unit}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="magnitude-slider"
        style={{ '--slider-accent': accentColor }}
        aria-label={label}
      />

      {/* Min / Max */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, color: '#666666', fontFamily: 'JetBrains Mono, monospace' }}>{min}</span>
        <span style={{ fontSize: 10, color: '#666666', fontFamily: 'JetBrains Mono, monospace' }}>{max}</span>
      </div>
    </div>
  );
}
