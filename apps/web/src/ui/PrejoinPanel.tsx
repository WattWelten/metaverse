import { useState } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import { loadPrefs, savePrefs, type Quality } from '../state/prefs';

import {
  AvatarSelectionStep,
  UsernameQualityStep,
  ControlsInfoStep,
  DeviceCheckStep,
  ProgressIndicator,
} from './PrejoinSteps';

interface PrejoinPanelProps {
  onContinue: () => void;
}

type Step = 'avatar' | 'username' | 'controls' | 'devices';

const STEPS: Step[] = ['avatar', 'username', 'controls', 'devices'];

export function PrejoinPanel({ onContinue }: PrejoinPanelProps) {
  const init = loadPrefs();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useState(init.username);
  const [quality, setQuality] = useState<Quality>(init.quality);
  const [avatarUrl, setAvatarUrl] = useState(init.avatarUrl);
  const flags = getFeatureFlags();

  const step = STEPS[currentStep];
  const shouldSkipDevices = !flags.VOICE_ENABLED;

  const handleNext = () => {
    // Skip devices step if voice is disabled
    if (step === 'devices' && shouldSkipDevices) {
      savePrefs({
        username: name.trim() || 'Gast',
        quality,
        avatarUrl,
      });
      onContinue();
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save and continue
      savePrefs({
        username: name.trim() || 'Gast',
        quality,
        avatarUrl,
      });
      onContinue();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAvatarSelect = (url?: string) => {
    console.log('[PrejoinPanel] Avatar selected:', url || 'none');
    setAvatarUrl(url);
    if (url) {
      console.log('[PrejoinPanel] Saving avatar URL to preferences');
      savePrefs({ avatarUrl: url });
    } else {
      console.log('[PrejoinPanel] Removing avatar URL from preferences');
      savePrefs({ avatarUrl: undefined });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        pointerEvents: 'auto',
        background: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        className="glass"
        style={{
          width: '90%',
          maxWidth: '520px',
          background: 'var(--glass-background)',
          backdropFilter: 'var(--glass-backdrop-blur)',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          color: 'var(--color-label)',
          fontFamily: 'var(--font-system)',
          animation: 'slideUp 300ms var(--ease-spring)',
          pointerEvents: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />

        {/* Step Content with Animation */}
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            key={currentStep}
            style={{
              animation: 'slideIn 0.4s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))',
            }}
          >
            {step === 'avatar' && (
              <AvatarSelectionStep
                avatarUrl={avatarUrl}
                onAvatarSelect={handleAvatarSelect}
                onNext={handleNext}
                showRpmCreator={!!flags.READY_PLAYER_ME_API_KEY}
              />
            )}

            {step === 'username' && (
              <UsernameQualityStep
                username={name}
                quality={quality}
                onUsernameChange={setName}
                onQualityChange={setQuality}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 'controls' && <ControlsInfoStep onNext={handleNext} onBack={handleBack} />}

            {step === 'devices' && (
              <DeviceCheckStep
                onNext={handleNext}
                onBack={handleBack}
                skip={!flags.VOICE_ENABLED}
              />
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
