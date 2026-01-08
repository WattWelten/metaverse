import { AppleModal, AppleButton } from '@metaverse/ui';
import { useEffect, useRef, useState } from 'react';

import { getFeatureFlags } from '../FeatureFlags';

interface RpmCreatorModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (url: string) => void;
}

export function RpmCreatorModal({ open, onClose, onExport }: RpmCreatorModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const flags = getFeatureFlags();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setLoading(true);
      setError(null);
      setExported(false);
      return;
    }

    if (!iframeRef.current) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://readyplayer.me') return;

      if (e.data?.eventName === 'v1.avatar.exported') {
        const url = e.data?.avatarUrl;
        if (url) {
          setExported(true);
          setLoading(false);
          // Auto-close after short delay to show success message
          setTimeout(() => {
            onExport(url);
            onClose();
          }, 1500);
        }
      } else if (e.data?.eventName === 'v1.frame.ready') {
        setLoading(false);
        setError(null);
      } else if (e.data?.eventName === 'v1.avatar.exportFailed') {
        setError('Avatar konnte nicht exportiert werden. Bitte versuche es erneut.');
        setLoading(false);
      }
    };

    // Handle iframe load errors
    const handleIframeError = () => {
      setError(
        'Ready Player Me konnte nicht geladen werden. Bitte überprüfe deine Internetverbindung.'
      );
      setLoading(false);
    };

    window.addEventListener('message', handleMessage);
    iframeRef.current.addEventListener('error', handleIframeError);

    // Timeout for loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setError('Das Laden dauert länger als erwartet. Bitte versuche es erneut.');
        setLoading(false);
      }
    }, 30000); // 30 second timeout

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('error', handleIframeError);
      }
      clearTimeout(loadingTimeout);
    };
  }, [open, loading, onClose, onExport]);

  if (!flags.READY_PLAYER_ME_API_KEY) {
    return null;
  }

  const rpmUrl = `https://readyplayer.me/avatar?frameApi&clearCache=true`;

  return (
    <AppleModal
      open={open}
      onClose={onClose}
      title="Avatar erstellen"
      style={{ maxWidth: '800px', maxHeight: '90vh' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Loading State */}
        {loading && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '8px',
              zIndex: 10,
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '48px' }}>⏳</div>
            <div className="text-body" style={{ color: 'var(--color-label)' }}>
              Ready Player Me wird geladen...
            </div>
          </div>
        )}

        {/* Success State */}
        {exported && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              zIndex: 10,
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '48px' }}>✅</div>
            <div className="text-body" style={{ color: 'var(--color-label)' }}>
              Avatar erfolgreich erstellt!
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: '16px',
              background: 'var(--color-fill-primary)',
              borderRadius: '8px',
              border: '1px solid var(--color-system-red)',
              color: 'var(--color-label)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span className="text-body" style={{ fontWeight: 600 }}>
                Fehler
              </span>
            </div>
            <p className="text-footnote" style={{ margin: 0, opacity: 0.9 }}>
              {error}
            </p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <AppleButton
                variant="secondary"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  if (iframeRef.current) {
                    iframeRef.current.src = rpmUrl + '&t=' + Date.now();
                  }
                }}
                style={{ flex: 1 }}
              >
                Erneut versuchen
              </AppleButton>
              <AppleButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                Abbrechen
              </AppleButton>
            </div>
          </div>
        )}

        {/* Info Text */}
        <div
          style={{
            padding: '12px',
            background: 'var(--color-fill-primary)',
            borderRadius: '8px',
            marginBottom: '8px',
          }}
        >
          <p className="text-footnote" style={{ margin: 0, color: 'var(--color-label-secondary)' }}>
            Erstelle deinen personalisierten Avatar mit Ready Player Me. Du kannst dein Gesicht
            scannen oder manuell anpassen.
          </p>
        </div>

        {/* Iframe */}
        <div style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
          <iframe
            ref={iframeRef}
            src={rpmUrl}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: '8px',
              background: '#000',
            }}
            allow="camera; microphone"
            title="Ready Player Me Avatar Creator"
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <AppleButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Abbrechen
          </AppleButton>
        </div>
      </div>
    </AppleModal>
  );
}
