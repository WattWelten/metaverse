import { FileUploadUI } from '@metaverse/ui';
import { useState } from 'react';

interface FileUploadPanelProps {
  visible: boolean;
  onClose: () => void;
  serverUrl?: string;
  sessionId?: string;
  onFileUploaded?: (file: {
    id: string;
    url: string;
    mimeType: string;
    originalName: string;
  }) => void;
}

export function FileUploadPanel({
  visible,
  onClose,
  serverUrl,
  sessionId,
  onFileUploaded,
}: FileUploadPanelProps) {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; url: string; mimeType: string; originalName: string; timestamp: number }>
  >([]);

  const handleUpload = (file: {
    id: string;
    url: string;
    mimeType: string;
    originalName: string;
  }) => {
    const fileWithTimestamp = {
      ...file,
      timestamp: Date.now(),
    };
    setUploadedFiles((prev) => [...prev, fileWithTimestamp]);
    onFileUploaded?.(file);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: 'var(--font-system, system-ui)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>File Upload</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
              width: '32px',
              height: '32px',
            }}
          >
            ×
          </button>
        </div>

        <FileUploadUI
          onUpload={handleUpload}
          visible={true}
          onToggle={onClose}
          serverUrl={serverUrl}
          sessionId={sessionId}
        />

        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              Uploaded Files
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{file.originalName}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginTop: '4px',
                      }}
                    >
                      {file.mimeType}
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#4CAF50',
                      textDecoration: 'none',
                      fontSize: '14px',
                      padding: '6px 12px',
                      border: '1px solid #4CAF50',
                      borderRadius: '6px',
                    }}
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
