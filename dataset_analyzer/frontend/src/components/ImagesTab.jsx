import React from 'react';
import { Panel } from './ui';

export function ImagesTab({ stats, theme }) {
  if (!stats) return <div style={{ color: theme.textMuted }}>Loading...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel title="Resolution Statistics" theme={theme}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-2" style={{ color: theme.textDim }}>WIDTH RANGE</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>MIN</p>
                <p className="text-lg font-bold" style={{ color: theme.accent }}>{stats.min_width}</p>
              </div>
              <span style={{ color: theme.textDim }}>→</span>
              <div className="text-right">
                <p className="text-[10px]" style={{ color: theme.textMuted }}>MAX</p>
                <p className="text-lg font-bold" style={{ color: theme.accent }}>{stats.max_width}</p>
              </div>
            </div>
          </div>

          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-2" style={{ color: theme.textDim }}>HEIGHT RANGE</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>MIN</p>
                <p className="text-lg font-bold" style={{ color: theme.accent }}>{stats.min_height}</p>
              </div>
              <span style={{ color: theme.textDim }}>→</span>
              <div className="text-right">
                <p className="text-[10px]" style={{ color: theme.textMuted }}>MAX</p>
                <p className="text-lg font-bold" style={{ color: theme.accent }}>{stats.max_height}</p>
              </div>
            </div>
          </div>

          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-1" style={{ color: theme.textDim }}>AVG WIDTH</p>
            <p className="text-xl font-bold" style={{ color: theme.accent }}>{stats.avg_width}px</p>
          </div>

          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-1" style={{ color: theme.textDim }}>AVG HEIGHT</p>
            <p className="text-xl font-bold" style={{ color: theme.accent }}>{stats.avg_height}px</p>
          </div>
        </div>
      </Panel>

      <Panel title="Image Properties" theme={theme}>
        <div className="space-y-3">
          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-2" style={{ color: theme.textDim }}>FILE FORMAT</p>
            <div className="flex gap-4">
              {Object.entries(stats.formats).map(([fmt, count]) => (
                <div key={fmt}>
                  <span className="font-bold" style={{ color: theme.accent }}>{count.toLocaleString()}</span>
                  <span className="text-xs ml-1" style={{ color: theme.textMuted }}>{fmt.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-[10px] mb-2" style={{ color: theme.textDim }}>COLOR MODE</p>
            <div className="flex gap-4">
              {Object.entries(stats.color_modes).map(([mode, count]) => (
                <div key={mode}>
                  <span className="font-bold" style={{ color: theme.accent }}>{count.toLocaleString()}</span>
                  <span className="text-xs ml-1" style={{ color: theme.textMuted }}>{mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Brightness Statistics" theme={theme} className="col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 text-center" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-2xl font-bold" style={{ color: theme.accent }}>{stats.brightness_mean}</p>
            <p className="text-[10px]" style={{ color: theme.textDim }}>MEAN BRIGHTNESS</p>
          </div>
          <div className="p-3 text-center" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-2xl font-bold" style={{ color: theme.accent }}>{stats.brightness_std}</p>
            <p className="text-[10px]" style={{ color: theme.textDim }}>STD DEVIATION</p>
          </div>
          <div className="p-3 text-center" style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}>
            <p className="text-2xl font-bold" style={{ color: theme.accent }}>
              {stats.brightness_std > 50 ? 'HIGH' : stats.brightness_std > 25 ? 'MED' : 'LOW'}
            </p>
            <p className="text-[10px]" style={{ color: theme.textDim }}>CONTRAST</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
