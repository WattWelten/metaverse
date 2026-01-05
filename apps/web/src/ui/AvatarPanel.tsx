import { useState } from 'react';

interface AvatarPanelProps {
  onSetUrl: (url: string) => void;
}

export function AvatarPanel({ onSetUrl }: AvatarPanelProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSpawn = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      onSetUrl(url.trim());
    } catch (error) {
      console.error('Failed to load avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="avatar-panel"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '16px',
        borderRadius: '8px',
        color: '#fff',
        zIndex: 1000,
        minWidth: '320px',
      }}
      data-testid="avatar-panel"
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Avatar URL</h3>
      <input
        type="text"
        placeholder="Ready Player Me / GLB / VRM URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSpawn();
          }
        }}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '8px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          fontSize: '14px',
        }}
      />
      <button
        onClick={handleSpawn}
        disabled={!url.trim() || loading}
        style={{
          width: '100%',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          background: url.trim() && !loading ? 'rgba(0, 200, 0, 0.7)' : 'rgba(100, 100, 100, 0.5)',
          color: '#fff',
          cursor: url.trim() && !loading ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Loading...' : 'Spawn Avatar'}
      </button>
    </div>
  );
}
