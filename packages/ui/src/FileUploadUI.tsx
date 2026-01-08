import React, { useRef, useState } from 'react';

export interface FileUploadUIProps {
  onUpload: (file: { id: string; url: string; mimeType: string; originalName: string }) => void;
  visible?: boolean;
  onToggle?: () => void;
  serverUrl?: string;
  sessionId?: string;
}

export function FileUploadUI({
  onUpload,
  visible = false,
  onToggle,
  serverUrl = 'http://localhost:3001',
  sessionId,
}: FileUploadUIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads');

      const response = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.file) {
        onUpload(data.file);
        setProgress(100);
        // Reset after short delay
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          backdropFilter: 'blur(10px)',
          zIndex: 200,
        }}
      >
        📁 Upload File
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(20px)',
        zIndex: 200,
        color: '#fff',
        fontFamily: 'var(--font-system, system-ui)',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Upload File</h3>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            width: '24px',
            height: '24px',
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          border: `2px dashed ${dragActive ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
          transition: 'all 0.2s',
          marginBottom: '16px',
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        {uploading ? (
          <div>
            <div style={{ marginBottom: '8px' }}>Uploading...</div>
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#4CAF50',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📁</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Drag & drop a file here or click to browse
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
              PDF, Images, Videos (max 10MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(244, 67, 54, 0.2)',
            border: '1px solid rgba(244, 67, 54, 0.5)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#ff5252',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
