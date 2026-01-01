import React from 'react';

export function Panel({ title, children, theme, className = '' }) {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: theme.bgPanel,
        border: `2px solid ${theme.border}`,
        boxShadow: '3px 3px 0 rgba(0,0,0,0.5)'
      }}
    >
      {title && (
        <div style={{
          padding: '6px 12px',
          borderBottom: `2px solid ${theme.border}`,
          backgroundColor: theme.accentBg,
          color: theme.bg === '#0a0a12' ? '#000' : '#fff'
        }}>
          <span className="text-[10px] uppercase tracking-widest font-bold">{title}</span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Button({ children, active, onClick, theme, className = '' }) {
  const isDark = theme.bg === '#0a0a12';
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all ${className}`}
      style={{
        backgroundColor: active ? theme.accentBg : theme.buttonBg,
        color: active ? (isDark ? '#000' : '#fff') : theme.text,
        border: `1px solid ${theme.border}`,
        boxShadow: active 
          ? 'inset 1px 1px 0 rgba(255,255,255,0.3)' 
          : '2px 2px 0 rgba(0,0,0,0.5)'
      }}
    >
      {children}
    </button>
  );
}

export function StatBox({ label, value, warn, theme }) {
  return (
    <div style={{
      backgroundColor: theme.bgInset,
      border: `1px solid ${theme.border}`,
      padding: '12px',
      boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)'
    }}>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: theme.textDim }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: warn ? theme.warn : theme.accent }}>{value}</p>
    </div>
  );
}

export function ProgressBar({ value, max, label, theme }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] w-16 truncate" style={{ color: theme.textMuted }}>{label}</span>
      <div 
        className="flex-1 h-4"
        style={{
          backgroundColor: theme.bgInset,
          border: `1px solid ${theme.border}`,
          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        <div 
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: theme.accent }}
        />
      </div>
      <span className="text-[10px] w-12 text-right" style={{ color: theme.textMuted }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function Select({ options, value, onChange, theme, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 text-xs"
      style={{
        backgroundColor: theme.inputBg,
        border: `1px solid ${theme.border}`,
        color: theme.text
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function Histogram({ data, theme, color }) {
  const maxVal = Math.max(...data, 1);
  return (
    <div 
      className="h-32 flex items-end gap-0.5 p-2"
      style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
    >
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1"
          style={{ 
            height: `${(val / maxVal) * 100}%`,
            backgroundColor: color || theme.accent
          }}
        />
      ))}
    </div>
  );
}

export function Heatmap({ data, theme }) {
  if (!data || data.length === 0) return null;
  
  return (
    <div 
      className="aspect-video relative overflow-hidden"
      style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
    >
      <div 
        className="absolute inset-0 grid"
        style={{ 
          gridTemplateColumns: `repeat(${data[0]?.length || 1}, 1fr)`,
          gridTemplateRows: `repeat(${data.length}, 1fr)`
        }}
      >
        {data.flat().map((val, i) => (
          <div
            key={i}
            style={{
              backgroundColor: `rgba(255, ${Math.round(100 - val * 100)}, 0, ${val * 0.8})`,
              border: `1px solid ${theme.border}20`
            }}
          />
        ))}
      </div>
    </div>
  );
}
