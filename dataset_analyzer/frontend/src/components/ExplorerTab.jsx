import React, { useState, useEffect, useCallback } from 'react';
import { Panel, Button, Select } from './ui';
import { api } from '../api';

export function ExplorerTab({ datasetInfo, theme }) {
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  
  const [filters, setFilters] = useState({
    class_filter: '',
    split_filter: '',
    min_boxes: '',
    max_boxes: ''
  });

  const limit = 24;

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.class_filter) params.class_filter = filters.class_filter;
      if (filters.split_filter) params.split_filter = filters.split_filter;
      if (filters.min_boxes) params.min_boxes = parseInt(filters.min_boxes);
      if (filters.max_boxes) params.max_boxes = parseInt(filters.max_boxes);
      
      const data = await api.getImages(params);
      setImages(data.images);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load images:', err);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const totalPages = Math.ceil(total / limit);

  const handleKeyDown = useCallback((e) => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    } else if (e.key === 'Escape') {
      setSelectedImage(null);
    }
  }, [selectedImage, images]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex gap-4">
      <div className="w-56 flex-shrink-0">
        <Panel title="Filters" theme={theme}>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] block mb-1" style={{ color: theme.textDim }}>CLASS</label>
              <Select
                theme={theme}
                value={filters.class_filter}
                onChange={(v) => { setFilters(f => ({ ...f, class_filter: v })); setPage(1); }}
                placeholder="All Classes"
                options={datasetInfo?.classes?.map(c => ({ value: c, label: c })) || []}
              />
            </div>
            
            <div>
              <label className="text-[10px] block mb-1" style={{ color: theme.textDim }}>SPLIT</label>
              <Select
                theme={theme}
                value={filters.split_filter}
                onChange={(v) => { setFilters(f => ({ ...f, split_filter: v })); setPage(1); }}
                placeholder="All Splits"
                options={datasetInfo?.splits?.map(s => ({ value: s, label: s })) || []}
              />
            </div>

            <div>
              <label className="text-[10px] block mb-1" style={{ color: theme.textDim }}>BOX COUNT</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_boxes}
                  onChange={(e) => { setFilters(f => ({ ...f, min_boxes: e.target.value })); setPage(1); }}
                  className="w-16 px-2 py-1 text-xs"
                  style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_boxes}
                  onChange={(e) => { setFilters(f => ({ ...f, max_boxes: e.target.value })); setPage(1); }}
                  className="w-16 px-2 py-1 text-xs"
                  style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="View Options" theme={theme} className="mt-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              <span className="text-xs" style={{ color: theme.text }}>Show Labels</span>
            </label>
          </div>
        </Panel>
      </div>

      <div className="flex-1">
        <div 
          className="flex items-center justify-between p-2 mb-4"
          style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
        >
          <span className="text-[10px]" style={{ color: theme.textMuted }}>
            {loading ? 'LOADING...' : `SHOWING ${images.length} OF ${total.toLocaleString()}`}
          </span>
          <div className="flex gap-2">
            <Button 
              theme={theme} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              active={false}
            >
              ◀ PREV
            </Button>
            <span className="text-xs self-center px-2" style={{ color: theme.text }}>
              {page} / {totalPages}
            </span>
            <Button 
              theme={theme} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              active={false}
            >
              NEXT ▶
            </Button>
          </div>
        </div>

        {!selectedImage && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="cursor-pointer transition-all hover:scale-[1.02]"
                style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
                onClick={() => setSelectedImage(img)}
              >
                <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: theme.bgInset }}>
                  <img
                    src={api.getImageUrl(img.id)}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {showLabels && img.annotations.map((ann, i) => (
                    <div
                      key={i}
                      className="absolute border-2 pointer-events-none"
                      style={{
                        left: `${ann.x * 100}%`,
                        top: `${ann.y * 100}%`,
                        width: `${ann.width * 100}%`,
                        height: `${ann.height * 100}%`,
                        borderColor: theme.accent
                      }}
                    />
                  ))}
                </div>
                <div className="p-2 flex justify-between">
                  <span className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                    {img.filename}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.accent }}>
                    {img.annotations.length}▢
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedImage && (
          <ImageViewer
            image={selectedImage}
            theme={theme}
            showLabels={showLabels}
            onClose={() => setSelectedImage(null)}
            onPrev={() => {
              const idx = images.findIndex(img => img.id === selectedImage.id);
              if (idx > 0) setSelectedImage(images[idx - 1]);
            }}
            onNext={() => {
              const idx = images.findIndex(img => img.id === selectedImage.id);
              if (idx < images.length - 1) setSelectedImage(images[idx + 1]);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ImageViewer({ image, theme, showLabels, onClose, onPrev, onNext }) {
  const colors = ['#00ff88', '#ff6600', '#00aaff', '#ff00aa', '#aaff00', '#aa00ff'];
  
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div 
          className="relative"
          style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
        >
          <img
            src={api.getImageUrl(image.id)}
            alt={image.filename}
            className="w-full"
          />
          {showLabels && image.annotations.map((ann, i) => (
            <React.Fragment key={i}>
              <div
                className="absolute border-2 pointer-events-none"
                style={{
                  left: `${ann.x * 100}%`,
                  top: `${ann.y * 100}%`,
                  width: `${ann.width * 100}%`,
                  height: `${ann.height * 100}%`,
                  borderColor: colors[i % colors.length]
                }}
              />
              <span
                className="absolute text-[10px] px-1"
                style={{
                  left: `${ann.x * 100}%`,
                  top: `${ann.y * 100}%`,
                  transform: 'translateY(-100%)',
                  backgroundColor: colors[i % colors.length],
                  color: '#000'
                }}
              >
                {ann.class_name}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button theme={theme} onClick={onPrev}>◀ PREV</Button>
          <Button theme={theme} onClick={onClose}>✕ CLOSE</Button>
          <Button theme={theme} onClick={onNext}>NEXT ▶</Button>
        </div>
      </div>

      <div className="w-64">
        <Panel title="Image Info" theme={theme}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span style={{ color: theme.textDim }}>Filename</span>
              <span style={{ color: theme.text }}>{image.filename}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.textDim }}>Size</span>
              <span style={{ color: theme.text }}>{image.width} × {image.height}</span>
            </div>
            {image.split && (
              <div className="flex justify-between">
                <span style={{ color: theme.textDim }}>Split</span>
                <span style={{ color: theme.text }}>{image.split}</span>
              </div>
            )}
          </div>
        </Panel>

        <Panel title={`Annotations (${image.annotations.length})`} theme={theme} className="mt-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {image.annotations.map((ann, i) => (
              <div
                key={i}
                className="p-2 text-xs"
                style={{ backgroundColor: theme.bgInset, border: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span style={{ color: theme.text }}>{ann.class_name}</span>
                </div>
                <div className="mt-1 text-[10px]" style={{ color: theme.textDim }}>
                  x:{(ann.x * 100).toFixed(1)}% y:{(ann.y * 100).toFixed(1)}% 
                  w:{(ann.width * 100).toFixed(1)}% h:{(ann.height * 100).toFixed(1)}%
                </div>
                {ann.confidence && (
                  <div className="text-[10px]" style={{ color: theme.accent }}>
                    conf: {(ann.confidence * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
