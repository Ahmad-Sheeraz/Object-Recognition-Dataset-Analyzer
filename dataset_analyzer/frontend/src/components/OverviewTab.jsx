import React from 'react';
import { Panel, ProgressBar } from './ui';

export function OverviewTab({ stats, theme }) {
  if (!stats) return <div style={{ color: theme.textMuted }}>Loading...</div>;
  
  const maxCount = Math.max(...Object.values(stats.class_distribution), 1);
  const classes = Object.entries(stats.class_distribution);
  
  const issues = [
    classes.length > 1 && {
      type: 'warn',
      title: 'CLASS IMBALANCE',
      desc: `Ratio: ${Math.round(classes[0][1] / (classes[classes.length-1]?.[1] || 1))}:1`
    },
    stats.empty_images > 0 && {
      type: 'error',
      title: 'EMPTY IMAGES',
      desc: `${stats.empty_images} images with no annotations`
    },
    {
      type: 'success',
      title: 'DATASET LOADED',
      desc: `${stats.total_images} images, ${stats.total_annotations} annotations`
    }
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Panel title="Class Distribution" theme={theme} className="col-span-2">
        {classes.map(([name, count]) => (
          <ProgressBar key={name} label={name} value={count} max={maxCount} theme={theme} />
        ))}
      </Panel>

      <Panel title="System Diagnostics" theme={theme}>
        <div className="space-y-2">
          {issues.map((issue, i) => (
            <div 
              key={i}
              className="p-2 flex items-center gap-2"
              style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
            >
              <span className="text-lg" style={{ 
                color: issue.type === 'error' ? theme.error : 
                       issue.type === 'warn' ? theme.warn : theme.success 
              }}>
                {issue.type === 'error' ? '✖' : issue.type === 'warn' ? '▲' : '✔'}
              </span>
              <div>
                <p className="text-xs" style={{ color: theme.text }}>{issue.title}</p>
                <p className="text-[10px]" style={{ color: theme.textDim }}>{issue.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
