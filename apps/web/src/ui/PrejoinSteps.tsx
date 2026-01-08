import { AppleButton, AppleInput, AppleSegmentedControl } from '@metaverse/ui';
import { useState } from 'react';

import { type Quality } from '../state/prefs';

import { AvatarModal } from './AvatarModal';
import { AvatarPreview } from './AvatarPreview';

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}

interface AvatarSelectionStepProps extends StepProps {
  avatarUrl?: string;
  onAvatarSelect: (url?: string) => void;
  showRpmCreator?: boolean;
}

export function AvatarSelectionStep({
  avatarUrl,
  onAvatarSelect,
  onNext,
}: AvatarSelectionStepProps) {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        alignItems: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 className="text-title2" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
          Wähle deinen Avatar
        </h3>
        <p
          className="text-footnote"
          style={{ color: 'var(--color-label-secondary)', opacity: 0.8 }}
        >
          Du kannst später jederzeit einen anderen Avatar wählen
        </p>
      </div>

      {/* Avatar Preview */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          animation: avatarUrl ? 'scaleIn 0.5s var(--ease-spring)' : 'none',
        }}
      >
        <AvatarPreview avatarUrl={avatarUrl} width={280} height={280} />
      </div>

      {/* Avatar Selection Button */}
      <AppleButton
        onClick={() => setAvatarModalOpen(true)}
        variant="secondary"
        style={{ width: '100%', maxWidth: '300px' }}
      >
        {avatarUrl ? 'Avatar ändern' : 'Avatar auswählen'}
      </AppleButton>

      {/* Continue Button */}
      <AppleButton onClick={onNext} style={{ width: '100%', maxWidth: '300px', marginTop: '8px' }}>
        Weiter
      </AppleButton>

      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSelect={(url) => {
          onAvatarSelect(url);
          setAvatarModalOpen(false);
        }}
      />
    </div>
  );
}

interface UsernameQualityStepProps extends StepProps {
  username: string;
  quality: Quality;
  onUsernameChange: (username: string) => void;
  onQualityChange: (quality: Quality) => void;
}

export function UsernameQualityStep({
  username,
  quality,
  onUsernameChange,
  onQualityChange,
  onNext,
  onBack,
}: UsernameQualityStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 className="text-title2" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
          Persönliche Einstellungen
        </h3>
        <p
          className="text-footnote"
          style={{ color: 'var(--color-label-secondary)', opacity: 0.8 }}
        >
          Wähle deinen Namen und die Qualitätseinstellung
        </p>
      </div>

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
          Username
        </h4>
        <AppleInput
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Gast"
          style={{ width: '100%' }}
          autoFocus
        />
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
          onChange={(v) => onQualityChange(v as Quality)}
        />
        <p
          className="text-footnote"
          style={{ marginTop: '8px', color: 'var(--color-label-secondary)', opacity: 0.7 }}
        >
          Low = Beste Performance • Fair = Ausgewogen • High = Beste Qualität
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {onBack && (
          <AppleButton variant="secondary" onClick={onBack} style={{ flex: 1 }}>
            Zurück
          </AppleButton>
        )}
        <AppleButton onClick={onNext} style={{ flex: 1 }}>
          Weiter
        </AppleButton>
      </div>
    </div>
  );
}

interface ControlsInfoStepProps extends StepProps {
  onContinue?: () => void;
}

export function ControlsInfoStep({ onContinue, onBack, onNext }: ControlsInfoStepProps) {
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (onNext) {
      onNext();
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 className="text-title2" style={{ margin: '0 0 8px', color: 'var(--color-label)' }}>
          Steuerung
        </h3>
        <p
          className="text-footnote"
          style={{ color: 'var(--color-label-secondary)', opacity: 0.8 }}
        >
          So bewegst du dich im Metaverse
        </p>
      </div>

      {/* Controls Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {[
          { key: 'WASD', label: 'Laufen', icon: '⌨️' },
          { key: 'Maus', label: 'Schauen', icon: '🖱️' },
          { key: 'SPACE', label: 'Springen', icon: '⬆️' },
          { key: 'SHIFT', label: 'Sprinten', icon: '💨' },
          { key: 'V', label: 'Ansicht wechseln', icon: '👁️' },
          { key: 'E', label: 'Sitzen/Aufstehen', icon: '🪑' },
          { key: 'ESC/M', label: 'Menü', icon: '⚙️' },
          { key: '1-9', label: 'Emotes', icon: '😊' },
        ].map((control) => (
          <div
            key={control.key}
            style={{
              padding: '12px',
              background: 'var(--color-fill-primary)',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{control.icon}</div>
            <div
              className="text-body"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-label)',
                marginBottom: '2px',
              }}
            >
              {control.key}
            </div>
            <div
              className="text-footnote"
              style={{ fontSize: '10px', color: 'var(--color-label-secondary)' }}
            >
              {control.label}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {onBack && (
          <AppleButton variant="secondary" onClick={onBack} style={{ flex: 1 }}>
            Zurück
          </AppleButton>
        )}
        <AppleButton onClick={handleContinue} style={{ flex: 1 }}>
          Los geht's!
        </AppleButton>
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background:
              index < currentStep ? 'var(--color-system-blue)' : 'var(--color-fill-primary)',
            transition: 'all 0.2s var(--ease-out)',
            opacity: index < currentStep ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
