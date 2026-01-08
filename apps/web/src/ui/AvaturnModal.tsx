import { AppleModal, AppleButton } from '@metaverse/ui';
import { useEffect, useRef, useState } from 'react';

import { getFeatureFlags } from '../FeatureFlags';

interface AvaturnModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (url: string) => void;
}

export function AvaturnModal({ open, onClose, onExport }: AvaturnModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const flags = getFeatureFlags();

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setLoading(true);
      setError(null);
      setExported(false);
      return;
    }

    if (!iframeRef.current) return;

    // Avaturn Frame API: https://avaturn.me/docs/frame-api
    // Similar to Ready Player Me Frame API
    const handleMessage = (e: MessageEvent) => {
      // Security: Only accept messages from Avaturn domain
      if (e.origin !== 'https://avaturn.me' && e.origin !== 'https://www.avaturn.me') return;

      // Avaturn Frame API events
      if (e.data?.type === 'avaturn-avatar-exported' || e.data?.eventName === 'avatar.exported') {
        const url = e.data?.avatarUrl || e.data?.url;
        if (url) {
          console.log('[AvaturnModal] ✅ Avatar exported successfully:', url);
          setExported(true);
          setLoading(false);
          // Auto-close after short delay to show success message
          setTimeout(() => {
            console.log('[AvaturnModal] Saving avatar URL to preferences');
            onExport(url);
            onClose();
          }, 1500);
        } else {
          console.error('[AvaturnModal] ⚠️ Avatar exported but no URL provided');
          setError('Avatar wurde exportiert, aber die URL fehlt. Bitte versuche es erneut.');
          setLoading(false);
        }
      } else if (e.data?.type === 'avaturn-ready' || e.data?.eventName === 'frame.ready') {
        console.log('[AvaturnModal] ✅ Avaturn frame is ready');
        setLoading(false);
        setError(null);
      } else if (e.data?.type === 'avaturn-error' || e.data?.eventName === 'avatar.exportFailed') {
        console.error('[AvaturnModal] ❌ Avatar export failed');
        setError('Avatar konnte nicht exportiert werden. Bitte versuche es erneut.');
        setLoading(false);
      }
    };

    // Handle iframe load errors
    const handleIframeError = () => {
      setError('Avaturn konnte nicht geladen werden. Bitte überprüfe deine Internetverbindung.');
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

  // Avaturn Frame API URL
  // Format: https://avaturn.me/avatar?frameApi
  const avaturnUrl = 'https://avaturn.me/avatar?frameApi';

  if (!flags.AVATURN_ENABLED) {
    return null;
  }

  return (
    <AppleModal
      open={open}
      onClose={onClose}
      title="Avatar mit Avaturn erstellen"
      style={{ maxWidth: '900px', width: '90%', height: '80vh' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '600px',
          background: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p className="text-body">Avaturn wird geladen...</p>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 10,
              padding: '24px',
            }}
          >
            <div style={{ textAlign: 'center', color: '#fff', maxWidth: '400px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p className="text-body" style={{ marginBottom: '16px' }}>
                {error}
              </p>
              <AppleButton onClick={() => setError(null)} variant="secondary">
                Erneut versuchen
              </AppleButton>
            </div>
          </div>
        )}

        {exported && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p className="text-body">Avatar erfolgreich erstellt!</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={avaturnUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          }}
          title="Avaturn Avatar Creator"
          allow="camera; microphone"
        />
      </div>
    </AppleModal>
  );
}
