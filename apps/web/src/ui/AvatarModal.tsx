import { AppleModal, AppleButton, AppleInput, AppleTabs } from '@metaverse/ui';
import { useState, useEffect } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import { loadPrefs, savePrefs } from '../state/prefs';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { AvatarGallery } from './AvatarGallery';
import { AvatarPreview } from './AvatarPreview';
import { AvatarPresetPicker } from './AvatarPresetPicker';
import { AvaturnModal } from './AvaturnModal';
import { RpmCreatorModal } from './RpmCreatorModal';

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url?: string) => void;
}

export function AvatarModal({ open, onClose, onSelect }: AvatarModalProps) {
  const [url, setUrl] = useState('');
  const [showRpm, setShowRpm] = useState(false);
  const [showAvaturn, setShowAvaturn] = useState(false);
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
    console.log('[AvatarModal] Avatar selected:', finalUrl || 'none');
    if (finalUrl) {
      setSelectedUrl(finalUrl);
      console.log('[AvatarModal] Saving avatar URL to preferences');
      savePrefs({ avatarUrl: finalUrl });
    } else {
      console.log('[AvatarModal] Removing avatar URL from preferences');
      savePrefs({ avatarUrl: undefined });
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
      id: 'presets',
      label: 'Presets',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AvatarPresetPicker onSelect={handleSelect} selectedUrl={selectedUrl} />
        </div>
      ),
    },
    {
      id: 'gallery',
      label: 'Galerie',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AvatarGallery onSelect={handleSelect} selectedUrl={selectedUrl} />
        </div>
      ),
    },
    {
      id: 'create',
      label: 'Erstellen',
      content: (
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
            <p className="text-footnote" style={{ opacity: 0.7, marginBottom: '24px' }}>
              Wähle einen Avatar-Ersteller
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {flags.READY_PLAYER_ME_API_KEY && (
              <AppleButton
                onClick={() => setShowRpm(true)}
                style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
              >
                ✨ Ready Player Me
              </AppleButton>
            )}
            {flags.AVATURN_ENABLED && (
              <AppleButton
                onClick={() => setShowAvaturn(true)}
                variant="secondary"
                style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
              >
                🎭 Avaturn
              </AppleButton>
            )}
            {!flags.READY_PLAYER_ME_API_KEY && !flags.AVATURN_ENABLED && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: 'var(--color-label-secondary)',
                }}
              >
                <p className="text-footnote" style={{ opacity: 0.7 }}>
                  Keine Avatar-Ersteller verfügbar. Bitte verwende Presets oder URL-Eingabe.
                </p>
              </div>
            )}
          </div>
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
        <ErrorBoundary
          fallback={
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p className="text-body" style={{ marginBottom: '16px' }}>
                Avatar-Vorschau konnte nicht geladen werden
              </p>
              <AppleButton onClick={onClose}>Schließen</AppleButton>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Avatar Preview - Always visible */}
            {selectedUrl && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ErrorBoundary
                  fallback={
                    <div
                      style={{
                        width: 250,
                        height: 250,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--color-label-secondary)',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                        <div className="text-footnote">Vorschau nicht verfügbar</div>
                      </div>
                    </div>
                  }
                >
                  <AvatarPreview avatarUrl={selectedUrl} width={250} height={250} />
                </ErrorBoundary>
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
        </ErrorBoundary>
      </AppleModal>

      <RpmCreatorModal
        open={showRpm}
        onClose={() => {
          console.log('[AvatarModal] RPM Creator modal closed');
          setShowRpm(false);
        }}
        onExport={(exportedUrl) => {
          console.log('[AvatarModal] RPM Creator exported avatar:', exportedUrl);
          setSelectedUrl(exportedUrl);
          handleSelect(exportedUrl);
          setShowRpm(false);
        }}
      />

      <AvaturnModal
        open={showAvaturn}
        onClose={() => {
          console.log('[AvatarModal] Avaturn modal closed');
          setShowAvaturn(false);
        }}
        onExport={(exportedUrl) => {
          console.log('[AvatarModal] Avaturn exported avatar:', exportedUrl);
          setSelectedUrl(exportedUrl);
          handleSelect(exportedUrl);
          setShowAvaturn(false);
        }}
      />
    </>
  );
}
