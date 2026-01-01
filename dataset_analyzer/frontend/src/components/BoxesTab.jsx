import React from 'react';
import { Panel, Histogram } from './ui';

export function BoxesTab({ stats, theme }) {
  if (!stats) return <div style={{ color: theme.textMuted }}>Loading...</div>;

  const total = stats.small_count + stats.medium_count + stats.large_count || 1;
  const smallPct = Math.round(stats.small_count / total * 100);
  const mediumPct = Math.round(stats.medium_count / total * 100);
  const largePct = Math.round(stats.large_count / total * 100);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel title="Box Size Distribution" theme={theme}>
        <Histogram data={stats.size_distribution} theme={theme} />
        <div className="flex justify-between mt-2 text-[10px]" style={{ color: theme.textDim }}>
          <span>0px²</span>
          <span>→ AREA →</span>
          <span>MAX</span>
        </div>
      </Panel>

      <Panel title="Aspect Ratio Distribution" theme={theme}>
        <Histogram data={stats.aspect_ratio_distribution} theme={theme} color="#ff6600" />
        <div className="flex justify-between mt-2 text-[10px]" style={{ color: theme.textDim }}>
          <span>TALL</span>
          <span>1:1</span>
          <span>WIDE</span>
        </div>
      </Panel>

      <Panel title="COCO Size Categories" theme={theme}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'SMALL', value: stats.small_count, pct: smallPct, desc: '<32²px' },
            { label: 'MEDIUM', value: stats.medium_count, pct: mediumPct, desc: '32²-96²px' },
            { label: 'LARGE', value: stats.large_count, pct: largePct, desc: '>96²px' },
          ].map((cat) => (
            <div 
              key={cat.label}
              className="p-3 text-center"
              style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
            >
              <p className="text-2xl font-bold" style={{ color: theme.accent }}>{cat.pct}%</p>
              <p className="text-xs mt-1" style={{ color: theme.text }}>{cat.label}</p>
              <p className="text-[10px]" style={{ color: theme.textDim }}>{cat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Boxes Per Image" theme={theme}>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['min', 'max', 'avg', 'median'].map((key) => (
            <div 
              key={key}
              className="p-2 text-center"
              style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
            >
              <p className="text-lg font-bold" style={{ color: theme.accent }}>
                {stats.boxes_per_image[key]}
              </p>
              <p className="text-[10px] uppercase" style={{ color: theme.textDim }}>{key}</p>
            </div>
          ))}
        </div>
        {stats.tiny_boxes > 0 && (
          <p className="text-[10px] mt-2" style={{ color: theme.warn }}>
            ▲ {stats.tiny_boxes} tiny boxes (&lt;16px)
          </p>
        )}
      </Panel>
    </div>
  );
}
