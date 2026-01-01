import React, { useState, useEffect } from 'react';
import { themes } from './theme';
import { api } from './api';
import { Button, StatBox } from './components/ui';
import { FolderBrowser } from './components/FolderBrowser';
import { OverviewTab } from './components/OverviewTab';
import { BoxesTab } from './components/BoxesTab';
import { ImagesTab } from './components/ImagesTab';
import { SpatialTab } from './components/SpatialTab';
import { ExplorerTab } from './components/ExplorerTab';

const TABS = [
  { id: 'overview', label: '◉ Overview' },
  { id: 'boxes', label: '■ Boxes' },
  { id: 'images', label: '▣ Images' },
  { id: 'spatial', label: '◫ Spatial' },
  { id: 'explorer', label: '⊞ Explorer' }
];

const FORMAT_INFO = [
  {
    name: 'COCO',
    structure: `dataset/
├── annotations/
│   ├── instances_train.json
│   └── instances_val.json
└── images/
    ├── train/
    │   └── *.jpg
    └── val/
        └── *.jpg`
  },
  {
    name: 'YOLO',
    structure: `dataset/
├── images/
│   ├── train/
│   │   └── *.jpg
│   └── val/
│       └── *.jpg
├── labels/
│   ├── train/
│   │   └── *.txt
│   └── val/
│       └── *.txt
└── data.yaml
    (or classes.txt)`
  },
  {
    name: 'PASCAL VOC',
    structure: `dataset/
├── Annotations/
│   └── *.xml
├── JPEGImages/
│   └── *.jpg
└── ImageSets/
    └── Main/
        ├── train.txt
        └── val.txt`
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [datasetPath, setDatasetPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useBrowser, setUseBrowser] = useState(false);
  
  const [overviewStats, setOverviewStats] = useState(null);
  const [boxStats, setBoxStats] = useState(null);
  const [imageStats, setImageStats] = useState(null);
  const [spatialStats, setSpatialStats] = useState(null);

  const theme = darkMode ? themes.dark : themes.light;

  useEffect(() => {
    api.getDatasetInfo()
      .then(info => {
        setDatasetInfo(info);
        loadAllStats();
      })
      .catch(() => {});
  }, []);

  const loadAllStats = async () => {
    try {
      const [overview, boxes, images, spatial] = await Promise.all([
        api.getOverviewStats(),
        api.getBoxStats(),
        api.getImageStats(),
        api.getSpatialStats()
      ]);
      setOverviewStats(overview);
      setBoxStats(boxes);
      setImageStats(images);
      setSpatialStats(spatial);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLoadDataset = async () => {
    if (!datasetPath.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const info = await api.loadDataset(datasetPath);
      setDatasetInfo(info);
      await loadAllStats();
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  if (!datasetInfo) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center p-8"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="flex items-center gap-3 mb-6 mt-8">
          <span className="font-bold tracking-wider text-lg" style={{ color: theme.accent }}>
            ◈ DATASET ANALYZER v2.1 ◈
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-2 py-1 text-[10px] uppercase"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              boxShadow: '2px 2px 0 rgba(0,0,0,0.5)'
            }}
          >
            {darkMode ? '☀ LIGHT' : '☾ DARK'}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button 
            theme={theme} 
            active={!useBrowser}
            onClick={() => setUseBrowser(false)}
          >
            ✎ MANUAL PATH
          </Button>
          <Button 
            theme={theme} 
            active={useBrowser}
            onClick={() => setUseBrowser(true)}
          >
            📁 BROWSE
          </Button>
        </div>

        {useBrowser ? (
          <FolderBrowser 
            theme={theme} 
            onDatasetLoad={(info) => {
              setDatasetInfo(info);
              loadAllStats();
            }}
          />
        ) : (
          <div
            style={{
              backgroundColor: theme.bgPanel,
              border: `2px solid ${theme.border}`,
              boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                borderBottom: `2px solid ${theme.border}`,
                backgroundColor: theme.accentBg,
                color: darkMode ? '#000' : '#fff'
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Enter Dataset Path
              </span>
            </div>
            
            <div className="p-4">
              <input
                type="text"
                value={datasetPath}
                onChange={(e) => setDatasetPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadDataset()}
                placeholder="/path/to/dataset"
                className="w-full px-3 py-2 text-sm mb-3"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text
                }}
              />
              
              <Button theme={theme} onClick={handleLoadDataset} className="w-full">
                {loading ? 'LOADING...' : 'LOAD DATASET'}
              </Button>
              
              {error && (
                <p className="text-xs mt-3" style={{ color: theme.error }}>{error}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4 mb-8" style={{ color: theme.textDim }}>
          <span className="text-[10px]">Supports: COCO • YOLO • Pascal VOC</span>
        </div>

        <div
          className="w-full max-w-4xl"
          style={{
            backgroundColor: theme.bgPanel,
            border: `2px solid ${theme.border}`,
            boxShadow: '3px 3px 0 rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              borderBottom: `2px solid ${theme.border}`,
              backgroundColor: theme.accentBg,
              color: darkMode ? '#000' : '#fff',
              textAlign: 'center'
            }}
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">
              Expected Formats
            </span>
          </div>
          
          <div className="grid grid-cols-3">
            {FORMAT_INFO.map((format, idx) => (
              <div
                key={format.name}
                className="p-4"
                style={{
                  borderRight: idx < 2 ? `1px solid ${theme.border}` : 'none'
                }}
              >
                <h3 
                  className="text-sm font-bold mb-3 text-center"
                  style={{ color: theme.accent }}
                >
                  {format.name}
                </h3>
                <pre
                  className="text-[10px] leading-relaxed"
                  style={{
                    color: theme.textMuted,
                    backgroundColor: theme.bgInset,
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'auto'
                  }}
                >
                  {format.structure}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-8 text-[10px]" style={{ color: theme.textDim }}>
          © 2024 Dataset Analyzer
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <header 
        className="px-4 py-2"
        style={{ backgroundColor: theme.bgPanel, borderBottom: `2px solid ${theme.border}` }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-wider" style={{ color: theme.accent }}>
              ◈ DATASET ANALYZER v2.1
            </span>
            <span 
              className="text-[10px] px-2 py-0.5 font-bold"
              style={{ backgroundColor: theme.accentBg, color: darkMode ? '#000' : '#fff' }}
            >
              {datasetInfo.format.toUpperCase()} FORMAT
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2 py-1 text-[10px] uppercase"
              style={{
                backgroundColor: theme.buttonBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)'
              }}
            >
              {darkMode ? '☀ LIGHT' : '☾ DARK'}
            </button>
            <button
              onClick={() => setDatasetInfo(null)}
              className="px-2 py-1 text-[10px] uppercase"
              style={{
                backgroundColor: theme.buttonBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)'
              }}
            >
              NEW
            </button>
          </div>
        </div>
      </header>

      <div 
        className="px-4 py-1"
        style={{ backgroundColor: theme.bgInset, borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-[10px]">
          <span style={{ color: theme.textMuted }}>PATH: {datasetInfo.path}</span>
          <span style={{ color: theme.textMuted }}>|</span>
          <span style={{ color: theme.textMuted }}>LOADED: {datasetInfo.total_images.toLocaleString()} images</span>
          <span style={{ color: theme.textMuted }}>|</span>
          <span style={{ color: theme.success }}>● READY</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-5 gap-3 mb-4">
          <StatBox label="Images" value={overviewStats?.total_images?.toLocaleString() || '—'} theme={theme} />
          <StatBox label="Annotations" value={overviewStats?.total_annotations?.toLocaleString() || '—'} theme={theme} />
          <StatBox label="Classes" value={overviewStats?.total_classes || '—'} theme={theme} />
          <StatBox label="Avg/Image" value={overviewStats?.avg_boxes_per_image || '—'} theme={theme} />
          <StatBox label="Empty" value={overviewStats?.empty_images || '—'} warn={overviewStats?.empty_images > 0} theme={theme} />
        </div>

        <div 
          className="flex gap-1 mb-4 p-1"
          style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
        >
          {TABS.map(tab => (
            <Button
              key={tab.id}
              theme={theme}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab stats={overviewStats} theme={theme} />}
        {activeTab === 'boxes' && <BoxesTab stats={boxStats} theme={theme} />}
        {activeTab === 'images' && <ImagesTab stats={imageStats} theme={theme} />}
        {activeTab === 'spatial' && <SpatialTab stats={spatialStats} theme={theme} />}
        {activeTab === 'explorer' && <ExplorerTab datasetInfo={datasetInfo} theme={theme} />}
      </div>

      <footer 
        className="px-4 py-2 mt-8"
        style={{ backgroundColor: theme.bgPanel, borderTop: `2px solid ${theme.border}` }}
      >
        <div className="max-w-7xl mx-auto flex justify-between text-[10px]" style={{ color: theme.textDim }}>
          <span>◈ DATASET ANALYZER v2.1 ◈</span>
          <span>{datasetInfo.classes.length} classes | {datasetInfo.splits.length} splits</span>
          <span>© 2024</span>
        </div>
      </footer>
    </div>
  );
}
