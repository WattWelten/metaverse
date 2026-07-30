import { useRef, useState } from 'react';

export interface MediaUploadUIProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  visible?: boolean;
  onToggle?: () => void;
}

export function MediaUploadUI({ onUpload, visible = false, onToggle }: MediaUploadUIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Bitte wähle ein Bild oder Video');
      return;
    }

    setUploading(true);
    try {
      // Convert to data URL for now (in production, upload to server/CDN)
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        onUpload(url, type);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
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
        📷 Share Media
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '300px',
        background: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>Media teilen</div>
        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '24px',
              height: '24px',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div
        style={{
          border: `2px dashed ${dragActive ? 'rgba(33, 150, 243, 0.8)' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          background: dragActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div style={{ color: '#fff', fontSize: '14px' }}>Uploading...</div>
        ) : (
          <>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ color: '#fff', fontSize: '13px', marginBottom: '4px' }}>
              Klicken oder Datei hier ablegen
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' }}>
              Bilder & Videos
            </div>
          </>
        )}
      </div>
    </div>
  );
}
