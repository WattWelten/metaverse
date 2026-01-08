import type { EmoteId } from '@metaverse/avatars';
import { AppleButton } from '@metaverse/ui';
import { useState, useEffect } from 'react';

interface EmoteBarProps {
  onEmote: (emoteId: EmoteId) => void;
}

const EMOTES: Array<{ id: EmoteId; emoji: string }> = [
  { id: '1', emoji: '👍' },
  { id: '2', emoji: '❤️' },
  { id: '3', emoji: '😂' },
  { id: '4', emoji: '🎉' },
  { id: '5', emoji: '🔥' },
  { id: '6', emoji: '👏' },
  { id: '7', emoji: '💯' },
  { id: '8', emoji: '✨' },
  { id: '9', emoji: '🎊' },
];

export function EmoteBar({ onEmote }: EmoteBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setVisible((v) => !v);
      }
      if (e.key >= '1' && e.key <= '9') {
        onEmote(e.key as EmoteId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEmote]);

  if (!visible) return null;

  return (
    <div
      className="toolbar"
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      {EMOTES.map((emote) => (
        <AppleButton
          key={emote.id}
          onClick={() => onEmote(emote.id)}
          style={{
            fontSize: '20px',
            padding: '8px 12px',
            minWidth: '44px',
          }}
        >
          {emote.emoji}
        </AppleButton>
      ))}
    </div>
  );
}
