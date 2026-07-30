import { useState } from 'react';

export interface EmoteUIProps {
  onEmote: (emote: string) => void;
  visible?: boolean;
  onToggle?: () => void;
}

const EMOTES = [
  { id: 'wave', label: '👋', name: 'Winken' },
  { id: 'dance', label: '💃', name: 'Tanzen' },
  { id: 'sit', label: '🪑', name: 'Hinsetzen' },
  { id: 'jump', label: '🦘', name: 'Springen' },
  { id: 'clap', label: '👏', name: 'Klatschen' },
  { id: 'thumbsup', label: '👍', name: 'Daumen hoch' },
];

export function EmoteUI({ onEmote, visible = false, onToggle }: EmoteUIProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleEmote = (emoteId: string) => {
    setSelected(emoteId);
    onEmote(emoteId);
    setTimeout(() => setSelected(null), 2000);
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
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
        😊 Emotes
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '12px',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>Emotes</div>
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
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {EMOTES.map((emote) => (
          <button
            key={emote.id}
            onClick={() => handleEmote(emote.id)}
            style={{
              background:
                selected === emote.id ? 'rgba(33, 150, 243, 0.8)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '24px',
              transition: 'background 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
            title={emote.name}
          >
            <div>{emote.label}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>{emote.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
