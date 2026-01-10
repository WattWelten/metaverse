import { AppleModal, AppleButton } from '@metaverse/ui';
import { useState, useEffect } from 'react';

export type ConsentKind = 'screenshare' | 'recording';

interface ConsentModalProps {
  open: boolean;
  kind: ConsentKind;
  onConsent: (granted: boolean) => void;
}

export function ConsentModal({ open, kind, onConsent }: ConsentModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    if (open) {
      // Check if consent was already given
      const key = `consent:${kind}`;
      const stored = localStorage.getItem(key);
      if (stored === '1') {
        setHasConsented(true);
        onConsent(true);
      }
    }
  }, [open, kind, onConsent]);

  const handleAccept = () => {
    const key = `consent:${kind}`;
    localStorage.setItem(key, '1');
    setHasConsented(true);
    onConsent(true);
  };

  const handleDecline = () => {
    onConsent(false);
  };

  if (hasConsented) {
    return null;
  }

  const kindLabel = kind === 'screenshare' ? 'Bildschirmfreigabe' : 'Aufnahme';

  return (
    <AppleModal open={open} onClose={handleDecline} title={`Zustimmung zu ${kindLabel}`}>
      <div style={{ padding: '16px 0' }}>
        <p style={{ marginBottom: '16px', fontSize: '15px', lineHeight: '1.5' }}>
          Um {kindLabel} zu verwenden, benötigen wir Ihre Zustimmung. Ihre Zustimmung wird lokal
          gespeichert und muss nicht erneut erteilt werden.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <AppleButton variant="secondary" onClick={handleDecline}>
            Ablehnen
          </AppleButton>
          <AppleButton variant="primary" onClick={handleAccept}>
            Zustimmen
          </AppleButton>
        </div>
      </div>
    </AppleModal>
  );
}

export function ensureConsent(kind: ConsentKind): Promise<boolean> {
  return new Promise((resolve) => {
    const key = `consent:${kind}`;
    const stored = localStorage.getItem(key);
    if (stored === '1') {
      resolve(true);
      return;
    }

    // Show consent dialog
    const ok = confirm(
      `Zustimmung zu ${kind === 'screenshare' ? 'Bildschirmfreigabe' : 'Aufnahme'} erforderlich. Einverstanden?`
    );
    if (ok) {
      localStorage.setItem(key, '1');
      resolve(true);
    } else {
      resolve(false);
    }
  });
}
