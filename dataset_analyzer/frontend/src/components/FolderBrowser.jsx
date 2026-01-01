import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Button } from './ui';

export function FolderBrowser({ theme, onDatasetLoad }) {
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState(null);
  const [folders, setFolders] = useState([]);
  const [detectedDatasets, setDetectedDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(null);

  const browse = async (path) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.browse(path || '');
      setCurrentPath(data.current_path);
      setParentPath(data.parent_path);
      setFolders(data.folders);
      setDetectedDatasets(data.detected_datasets);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    browse('');
  }, []);

  const handleFolderClick = (folderName) => {
    const newPath = currentPath + '/' + folderName;
    browse(newPath);
  };

  const handleGoUp = () => {
    if (parentPath) {
      browse(parentPath);
    }
  };

  const handleLoadDataset = async (folderName) => {
    const datasetPath = currentPath + '/' + folderName;
    setLoadingDataset(folderName);
    try {
      const info = await api.loadDataset(datasetPath);
      onDatasetLoad(info);
    } catch (err) {
      setError(err.message);
    }
    setLoadingDataset(null);
  };

  const isDark = theme.bg === '#0a0a12';

  return (
    <div
      style={{
        backgroundColor: theme.bgPanel,
        border: `2px solid ${theme.border}`,
        boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '600px'
      }}
    >
      <div
        style={{
          padding: '6px 12px',
          borderBottom: `2px solid ${theme.border}`,
          backgroundColor: theme.accentBg,
          color: isDark ? '#000' : '#fff'
        }}
      >
        <span className="text-[10px] uppercase tracking-widest font-bold">
          Select Dataset
        </span>
      </div>

      <div className="p-4">
        <div
          className="p-2 mb-3 text-xs truncate"
          style={{
            backgroundColor: theme.bgInset,
            border: `1px solid ${theme.border}`,
            color: theme.text
          }}
        >
          {currentPath}
        </div>

        {error && (
          <div className="mb-3 p-2 text-xs" style={{ color: theme.error }}>
            {error}
          </div>
        )}

        <div
          className="overflow-y-auto"
          style={{
            maxHeight: '400px',
            backgroundColor: theme.bgInset,
            border: `1px solid ${theme.border}`
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-xs" style={{ color: theme.textMuted }}>
              Loading...
            </div>
          ) : (
            <>
              {parentPath && (
                <div
                  className="flex items-center justify-between p-2 cursor-pointer transition-colors"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                  onClick={handleGoUp}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    ..
                  </span>
                  <span className="text-[10px]" style={{ color: theme.textDim }}>
                    GO UP
                  </span>
                </div>
              )}

              {folders.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: theme.textMuted }}>
                  No folders found
                </div>
              ) : (
                folders.map((folder) => {
                  const datasetType = detectedDatasets[folder];
                  return (
                    <div
                      key={folder}
                      className="flex items-center justify-between p-2 transition-colors"
                      style={{ borderBottom: `1px solid ${theme.border}` }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.buttonBg}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <span className="text-xs" style={{ color: theme.text }}>
                          {folder}
                        </span>
                        {datasetType && (
                          <span
                            className="text-[10px] px-1.5 py-0.5"
                            style={{
                              backgroundColor: theme.accent,
                              color: isDark ? '#000' : '#fff'
                            }}
                          >
                            {datasetType}
                          </span>
                        )}
                      </div>
                      {datasetType && (
                        <Button
                          theme={theme}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadDataset(folder);
                          }}
                        >
                          {loadingDataset === folder ? '...' : 'LOAD'}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
