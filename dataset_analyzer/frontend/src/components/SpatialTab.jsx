import React from 'react';
import { Panel, Heatmap } from './ui';

export function SpatialTab({ stats, theme }) {
  if (!stats) return <div style={{ color: theme.textMuted }}>Loading...</div>;

  const centerBias = stats.edge_proximity.center > 60;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel title="Object Center Heatmap" theme={theme}>
        <Heatmap data={stats.heatmap} theme={theme} />
        {centerBias && (
          <p className="text-[10px] text-center mt-2" style={{ color: theme.warn }}>
            ▲ STRONG CENTER BIAS DETECTED
          </p>
        )}
      </Panel>

      <Panel title="Edge Proximity Analysis" theme={theme}>
        <div 
          className="aspect-video relative p-6"
          style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
        >
          <div 
            className="w-full h-full relative"
            style={{ border: `2px dashed ${theme.borderLight}` }}
          >
            <span 
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs"
              style={{ color: theme.accent }}
            >
              {stats.edge_proximity.top}%
            </span>
            <span 
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs"
              style={{ color: theme.accent }}
            >
              {stats.edge_proximity.bottom}%
            </span>
            <span 
              className="absolute top-1/2 -left-8 -translate-y-1/2 text-xs"
              style={{ color: theme.accent }}
            >
              {stats.edge_proximity.left}%
            </span>
            <span 
              className="absolute top-1/2 -right-8 -translate-y-1/2 text-xs"
              style={{ color: theme.accent }}
            >
              {stats.edge_proximity.right}%
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm" style={{ color: theme.textMuted }}>
                {stats.edge_proximity.center}% CENTER
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-center mt-2" style={{ color: theme.textDim }}>
          % OF BOXES NEAR EACH EDGE
        </p>
      </Panel>

      <Panel title="Per-Class Spatial Distribution" theme={theme} className="col-span-2">
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(stats.per_class_heatmaps).slice(0, 5).map(([className, heatmap]) => (
            <div key={className} className="text-center">
              <div 
                className="aspect-square relative overflow-hidden"
                style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
              >
                <Heatmap data={heatmap} theme={theme} />
              </div>
              <span className="text-[10px] mt-1 block uppercase" style={{ color: theme.textMuted }}>
                {className}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
