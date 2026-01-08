import { AppleCard } from '@metaverse/ui';
import { useState, useEffect } from 'react';

import { loadPrefs } from '../state/prefs';

interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

// Preset-Avatare - können später erweitert werden
const DEFAULT_PRESETS: AvatarPreset[] = [
  // Placeholder für zukünftige Preset-Avatare
  // Beispiel:
  // { id: 'rpm-default-1', name: 'Standard Avatar', url: 'https://models.readyplayer.me/...', thumbnail: '...' },
];

interface AvatarGalleryProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export function AvatarGallery({ onSelect, selectedUrl }: AvatarGalleryProps) {
  const [presets] = useState<AvatarPreset[]>(DEFAULT_PRESETS);
  const [recentAvatars, setRecentAvatars] = useState<string[]>([]);

  useEffect(() => {
    // Lade zuletzt verwendete Avatare aus localStorage
    const prefs = loadPrefs();
    const recent = prefs.recentAvatars || [];
    setRecentAvatars(recent.slice(0, 5)); // Maximal 5 letzte Avatare
  }, []);

  const handlePresetSelect = (preset: AvatarPreset) => {
    onSelect(preset.url);
    // Speichere in Recent-Avatare
    const prefs = loadPrefs();
    const recent = prefs.recentAvatars || [];
    const updated = [preset.url, ...recent.filter((url) => url !== preset.url)].slice(0, 5);
    localStorage.setItem('wattwelten_prefs', JSON.stringify({ ...prefs, recentAvatars: updated }));
  };

  const handleRecentSelect = (url: string) => {
    onSelect(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Recent Avatars */}
      {recentAvatars.length > 0 && (
        <div>
          <h4
            className="text-headline"
            style={{
              margin: '0 0 12px',
              color: 'var(--color-label)',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            Zuletzt verwendet
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {recentAvatars.map((url, index) => (
              <AppleCard
                key={`recent-${index}`}
                onClick={() => handleRecentSelect(url)}
                style={{
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border:
                    selectedUrl === url
                      ? '2px solid var(--color-system-blue)'
                      : '1px solid var(--glass-border)',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--color-fill-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    marginBottom: '8px',
                  }}
                >
                  👤
                </div>
                <span
                  className="text-footnote"
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-label-secondary)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    padding: '0 4px',
                  }}
                >
                  Avatar {index + 1}
                </span>
              </AppleCard>
            ))}
          </div>
        </div>
      )}

      {/* Preset Avatars */}
      {presets.length > 0 && (
        <div>
          <h4
            className="text-headline"
            style={{
              margin: '0 0 12px',
              color: 'var(--color-label)',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            Vorgefertigte Avatare
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {presets.map((preset) => (
              <AppleCard
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                style={{
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border:
                    selectedUrl === preset.url
                      ? '2px solid var(--color-system-blue)'
                      : '1px solid var(--glass-border)',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                {preset.thumbnail ? (
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      background: 'var(--color-fill-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      marginBottom: '8px',
                    }}
                  >
                    👤
                  </div>
                )}
                <span
                  className="text-body"
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-label)',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  {preset.name}
                </span>
              </AppleCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {presets.length === 0 && recentAvatars.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-label-secondary)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <p className="text-body" style={{ marginBottom: '8px' }}>
            Noch keine Avatare verfügbar
          </p>
          <p className="text-footnote" style={{ opacity: 0.7 }}>
            Erstelle einen neuen Avatar oder füge eine URL ein
          </p>
        </div>
      )}
    </div>
  );
}
