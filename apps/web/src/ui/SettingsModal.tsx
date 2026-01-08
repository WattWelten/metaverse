import {
  AppleModal,
  AppleButton,
  AppleInput,
  AppleSegmentedControl,
  AppleSlider,
  AppleTabs,
} from '@metaverse/ui';
import { useEffect, useState } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import { loadPrefs, savePrefs, type Quality } from '../state/prefs';

import { AvatarModal } from './AvatarModal';
import { AvatarPreview } from './AvatarPreview';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onViewToggle: () => void;
  onQuality: (q: Quality) => void;
  onAudioVolume?: (volume: number) => void;
  onMouseLockToggle?: () => void;
  onMouseInvert?: (invert: boolean) => void;
}

export function SettingsModal({
  open,
  onClose,
  onViewToggle,
  onQuality,
  onAudioVolume,
  onMouseLockToggle,
  onMouseInvert,
}: SettingsModalProps) {
  const init = loadPrefs();
  const [name, setName] = useState(init.username);
  const [quality, setQuality] = useState<Quality>(init.quality);
  const [audioVolume, setAudioVolume] = useState(init.audioVolume ?? 1);
  const [mouseInvert, setMouseInvert] = useState(init.mouseInvert ?? false);
  const [mouseLockEnabled, setMouseLockEnabled] = useState(init.mouseLockEnabled ?? true);
  const [avatarUrl, setAvatarUrl] = useState(init.avatarUrl);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    // Lade Prefs beim Öffnen
    const prefs = loadPrefs();
    setAudioVolume(prefs.audioVolume ?? 1);
    setMouseInvert(prefs.mouseInvert ?? false);
    setMouseLockEnabled(prefs.mouseLockEnabled ?? true);
    setAvatarUrl(prefs.avatarUrl);
    setName(prefs.username);
    setQuality(prefs.quality);
  }, [open]);

  const handleQualityChange = (q: Quality) => {
    setQuality(q);
    onQuality(q);
    savePrefs({ quality: q });
  };

  const handleNameChange = () => {
    savePrefs({ username: name.trim() || 'Gast' });
  };

  const handleAvatarSelect = (url?: string) => {
    setAvatarUrl(url);
    if (url) {
      savePrefs({ avatarUrl: url });
    }
    setAvatarModalOpen(false);
  };

  const tabs = [
    {
      id: 'general',
      label: 'Allgemein',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Username */}
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
              Name
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <AppleInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gast"
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameChange();
                  }
                }}
              />
              <AppleButton onClick={handleNameChange}>Ändern</AppleButton>
            </div>
          </div>

          {/* Quality */}
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
              Qualität
            </h4>
            <AppleSegmentedControl
              options={[
                { value: 'low', label: 'Low' },
                { value: 'fair', label: 'Fair' },
                { value: 'high', label: 'High' },
              ]}
              value={quality}
              onChange={(v) => handleQualityChange(v as Quality)}
            />
            <p
              className="text-footnote"
              style={{ marginTop: '8px', color: 'var(--color-label-secondary)', opacity: 0.7 }}
            >
              Low = Beste Performance • Fair = Ausgewogen • High = Beste Qualität
            </p>
          </div>

          {/* Actions */}
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
              Aktionen
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  document.documentElement.requestFullscreen?.();
                }}
                style={{ width: '100%' }}
              >
                Vollbild aktivieren
              </AppleButton>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  location.reload();
                }}
                style={{ width: '100%' }}
              >
                Respawn (Neu laden)
              </AppleButton>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'controls',
      label: 'Steuerung',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Mouse Lock */}
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
              Maus
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  color: 'var(--color-label)',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s var(--ease-out)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-fill-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={mouseLockEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setMouseLockEnabled(enabled);
                    savePrefs({ mouseLockEnabled: enabled });
                    onMouseLockToggle?.();
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-system-blue)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    Mouse Lock aktivieren
                  </span>
                  <p className="text-footnote" style={{ margin: '4px 0 0', opacity: 0.7 }}>
                    Maus wird beim Klicken gesperrt für bessere Steuerung
                  </p>
                </div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  color: 'var(--color-label)',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s var(--ease-out)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-fill-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={mouseInvert}
                  onChange={(e) => {
                    const invert = e.target.checked;
                    setMouseInvert(invert);
                    savePrefs({ mouseInvert: invert });
                    onMouseInvert?.(invert);
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-system-blue)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    Maus invertieren
                  </span>
                  <p className="text-footnote" style={{ margin: '4px 0 0', opacity: 0.7 }}>
                    Vertikale Mausbewegung umkehren
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* View Mode */}
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
              Ansicht
            </h4>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                color: 'var(--color-label)',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background 0.2s var(--ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-fill-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <input
                type="checkbox"
                onChange={onViewToggle}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-system-blue)',
                }}
              />
              <div style={{ flex: 1 }}>
                <span className="text-body" style={{ fontWeight: 500 }}>
                  First-Person Modus
                </span>
                <p className="text-footnote" style={{ margin: '4px 0 0', opacity: 0.7 }}>
                  Wechselt zwischen First-Person und Third-Person Ansicht (V-Taste)
                </p>
              </div>
            </label>
          </div>

          {/* Keyboard Shortcuts */}
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
              Tastenkürzel
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                padding: '12px',
                background: 'var(--color-fill-primary)',
                borderRadius: '8px',
              }}
            >
              {[
                { key: 'WASD', label: 'Bewegen' },
                { key: 'Maus', label: 'Schauen' },
                { key: 'SPACE', label: 'Springen' },
                { key: 'SHIFT', label: 'Sprinten' },
                { key: 'V', label: 'Ansicht' },
                { key: 'E', label: 'Sitzen' },
                { key: 'ESC/M', label: 'Menü' },
                { key: '1-9', label: 'Emotes' },
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span className="text-footnote" style={{ color: 'var(--color-label-secondary)' }}>
                    {shortcut.label}
                  </span>
                  <kbd
                    style={{
                      padding: '2px 6px',
                      background: 'var(--color-background)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-label)',
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'audio',
      label: 'Audio',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              Lautstärke
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span
                className="text-footnote"
                style={{ minWidth: '40px', color: 'var(--color-label-secondary)' }}
              >
                0%
              </span>
              <AppleSlider
                min={0}
                max={1}
                step={0.01}
                value={audioVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setAudioVolume(vol);
                  savePrefs({ audioVolume: vol });
                  onAudioVolume?.(vol);
                }}
                style={{ flex: 1 }}
              />
              <span
                className="text-footnote"
                style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  color: 'var(--color-label-secondary)',
                }}
              >
                {Math.round(audioVolume * 100)}%
              </span>
            </div>
            <p
              className="text-footnote"
              style={{ marginTop: '8px', color: 'var(--color-label-secondary)', opacity: 0.7 }}
            >
              Regelt die Lautstärke für Ambient-Audio und Voice-Chat
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'avatar',
      label: 'Avatar',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              Aktueller Avatar
            </h4>
            {avatarUrl ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <AvatarPreview avatarUrl={avatarUrl} width={200} height={200} />
                <AppleButton
                  onClick={() => setAvatarModalOpen(true)}
                  variant="secondary"
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  Avatar ändern
                </AppleButton>
              </div>
            ) : (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: 'var(--color-fill-primary)',
                  borderRadius: '8px',
                  color: 'var(--color-label-secondary)',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                <p className="text-body" style={{ marginBottom: '8px' }}>
                  Kein Avatar ausgewählt
                </p>
                <AppleButton
                  onClick={() => setAvatarModalOpen(true)}
                  variant="secondary"
                  style={{ marginTop: '12px' }}
                >
                  Avatar auswählen
                </AppleButton>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'advanced',
      label: 'Erweitert',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              Entwickler-Optionen
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  localStorage.clear();
                  location.reload();
                }}
                style={{ width: '100%' }}
              >
                Alle Einstellungen zurücksetzen
              </AppleButton>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  console.log('Feature Flags:', getFeatureFlags());
                  alert('Feature Flags wurden in der Konsole ausgegeben (F12)');
                }}
                style={{ width: '100%' }}
              >
                Feature Flags anzeigen
              </AppleButton>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <AppleModal open={open} onClose={onClose} title="Einstellungen" style={{ maxWidth: '700px' }}>
        <AppleTabs tabs={tabs} defaultTab="general" />
      </AppleModal>

      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
      />
    </>
  );
}
