import * as pdfjsLib from 'pdfjs-dist';
import { useState, useRef, DragEvent } from 'react';

// PDF.js Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PinboardItem {
  id: string;
  type: 'pdf' | 'image' | 'link';
  url: string;
  x: number;
  y: number;
}

export function Pinboard({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [items, setItems] = useState<PinboardItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setItems([
          ...items,
          {
            id: Date.now().toString(),
            type: 'pdf',
            url,
            x: e.clientX - (containerRef.current?.offsetLeft || 0),
            y: e.clientY - (containerRef.current?.offsetTop || 0),
          },
        ]);
      } else if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setItems([
          ...items,
          {
            id: Date.now().toString(),
            type: 'image',
            url,
            x: e.clientX - (containerRef.current?.offsetLeft || 0),
            y: e.clientY - (containerRef.current?.offsetTop || 0),
          },
        ]);
      }
    });
  };

  const handleAddLink = () => {
    const url = prompt('URL eingeben:');
    if (url) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          type: 'link',
          url,
          x: 100,
          y: 100,
        },
      ]);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        pointerEvents: 'auto',
        overflow: 'auto',
      }}
      data-testid="pinboard"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <h3 style={{ color: '#fff', margin: 0 }}>Pinboard</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddLink}
            style={{
              background: 'rgba(0, 200, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Add Link
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
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
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
          }}
        >
          {item.type === 'pdf' && (
            <iframe
              src={item.url}
              sandbox="allow-same-origin allow-scripts"
              style={{ width: '400px', height: '600px', border: 'none' }}
              title="PDF Viewer"
            />
          )}
          {item.type === 'image' && (
            <img src={item.url} alt="Pinboard" style={{ maxWidth: '300px', display: 'block' }} />
          )}
          {item.type === 'link' && (
            <iframe
              src={item.url}
              sandbox="allow-same-origin allow-scripts allow-popups"
              style={{ width: '400px', height: '600px', border: 'none' }}
              title="Link Embed"
            />
          )}
        </div>
      ))}
    </div>
  );
}
