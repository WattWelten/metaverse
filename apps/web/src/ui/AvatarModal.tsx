import { AppleModal, AppleButton, AppleInput, AppleTabs } from '@metaverse/ui';
import { useState, useEffect } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import { loadPrefs, savePrefs } from '../state/prefs';

import { AvatarGallery } from './AvatarGallery';
import { AvatarPreview } from './AvatarPreview';
import { RpmCreatorModal } from './RpmCreatorModal';

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url?: string) => void;
}

export function AvatarModal({ open, onClose, onSelect }: AvatarModalProps) {
  const [url, setUrl] = useState('');
  const [showRpm, setShowRpm] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>();
  const flags = getFeatureFlags();

  useEffect(() => {
    if (open) {
      // Load current avatar URL from prefs
      const prefs = loadPrefs();
      setSelectedUrl(prefs.avatarUrl);
      setUrl(prefs.avatarUrl || '');
    }
  }, [open]);

  const handleSelect = (presetUrl?: string) => {
    const finalUrl = presetUrl || url || undefined;
    if (finalUrl) {
      setSelectedUrl(finalUrl);
      savePrefs({ avatarUrl: finalUrl });
    }
    onSelect(finalUrl);
    if (presetUrl) {
      setUrl('');
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      handleSelect();
    }
  };

  const tabs = [
    {
      id: 'gallery',
      label: 'Galerie',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AvatarGallery onSelect={handleSelect} selectedUrl={selectedUrl} />
          {flags.READY_PLAYER_ME_API_KEY && (
            <AppleButton
              onClick={() => setShowRpm(true)}
              variant="secondary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              ✨ Neuen Avatar mit Ready Player Me erstellen
            </AppleButton>
          )}
        </div>
      ),
    },
    {
      id: 'create',
      label: 'Erstellen',
      content: flags.READY_PLAYER_ME_API_KEY ? (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--color-label-secondary)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎨</div>
            <p className="text-body" style={{ marginBottom: '8px' }}>
              Erstelle deinen eigenen Avatar
            </p>
            <p className="text-footnote" style={{ opacity: 0.7 }}>
              Mit Ready Player Me kannst du einen personalisierten Avatar erstellen
            </p>
          </div>
          <AppleButton
            onClick={() => setShowRpm(true)}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            Avatar erstellen
          </AppleButton>
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-label-secondary)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <p className="text-body" style={{ marginBottom: '8px' }}>
            Ready Player Me nicht verfügbar
          </p>
          <p className="text-footnote" style={{ opacity: 0.7 }}>
            Bitte verwende die Galerie oder URL-Eingabe
          </p>
        </div>
      ),
    },
    {
      id: 'url',
      label: 'URL',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4
              className="text-headline"
              style={{
                margin: '0 0 8px',
                color: 'var(--color-label)',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Avatar-URL eingeben
            </h4>
            <p
              className="text-footnote"
              style={{
                margin: '0 0 16px',
                color: 'var(--color-label-secondary)',
                opacity: 0.8,
              }}
            >
              Füge eine Ready Player Me, VRM oder GLB URL ein
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <AppleInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://models.readyplayer.me/..."
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && url.trim()) {
                    handleUrlSubmit();
                  }
                }}
              />
              <AppleButton onClick={handleUrlSubmit} disabled={!url.trim()}>
                Übernehmen
              </AppleButton>
            </div>
          </div>
          {selectedUrl && (
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
                Vorschau
              </h4>
              <AvatarPreview avatarUrl={selectedUrl} width={300} height={300} />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <AppleModal
        open={open}
        onClose={onClose}
        title="Avatar auswählen"
        style={{ maxWidth: '600px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar Preview - Always visible */}
          {selectedUrl && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AvatarPreview avatarUrl={selectedUrl} width={250} height={250} />
            </div>
          )}

          {/* Tabs */}
          <AppleTabs tabs={tabs} defaultTab="gallery" />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <AppleButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Abbrechen
            </AppleButton>
            <AppleButton
              onClick={() => handleSelect()}
              disabled={!selectedUrl && !url.trim()}
              style={{ flex: 1 }}
            >
              Übernehmen
            </AppleButton>
          </div>
        </div>
      </AppleModal>

      <RpmCreatorModal
        open={showRpm}
        onClose={() => setShowRpm(false)}
        onExport={(exportedUrl) => {
          setSelectedUrl(exportedUrl);
          handleSelect(exportedUrl);
          setShowRpm(false);
        }}
      />
    </>
  );
}
