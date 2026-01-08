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
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
      }}
      data-testid="avatar-panel"
    >
      <input
        type="text"
        placeholder="Avatar-URL (RPM/VRM/GLB)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSpawn();
          }
        }}
        style={{
          width: 320,
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          fontSize: '12px',
        }}
      />
      <button
        onClick={handleSpawn}
        disabled={!url.trim() || loading}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: 'none',
          background: url.trim() && !loading ? 'rgba(0, 200, 0, 0.7)' : 'rgba(100, 100, 100, 0.5)',
          color: '#fff',
          cursor: url.trim() && !loading ? 'pointer' : 'not-allowed',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Loading...' : 'Spawn/Update'}
      </button>
    </div>
  );
}
