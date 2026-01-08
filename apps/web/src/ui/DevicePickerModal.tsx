import { AppleModal, AppleButton, AppleCard } from '@metaverse/ui';
import type { DeviceInfo } from '@metaverse/voice';
import { useEffect, useState } from 'react';

import type { VoiceClientWithProvider } from '../types/voiceProvider';
import type { World } from '../World';

interface DevicePickerModalProps {
  open: boolean;
  onClose: () => void;
  world: World | null;
}

export function DevicePickerModal({ open, onClose, world }: DevicePickerModalProps) {
  const [inputDevices, setInputDevices] = useState<DeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<DeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [testToneAudio, setTestToneAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open || !world) return;

    const voiceClient = world.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (!provider) return;

    // Load devices - use listDevices if available
    const loadDevices = async (): Promise<DeviceInfo[]> => {
      if (typeof provider.listDevices === 'function') {
        return await provider.listDevices();
      }
      return [];
    };

    loadDevices().then((devices: DeviceInfo[]) => {
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      const outputs = devices.filter((d) => d.kind === 'audiooutput');
      setInputDevices(inputs);
      setOutputDevices(outputs);

      // Set default selections (first device or current)
      if (inputs.length > 0 && !selectedInput && inputs[0]) {
        setSelectedInput(inputs[0].id);
      }
      if (outputs.length > 0 && !selectedOutput && outputs[0]) {
        setSelectedOutput(outputs[0].id);
      }
    });
  }, [open, world]);

  const handleInputChange = async (deviceId: string) => {
    setSelectedInput(deviceId);
    const voiceClient = world?.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (provider && typeof provider.setInputDevice === 'function') {
      try {
        await provider.setInputDevice(deviceId);
      } catch (error) {
        console.error('Failed to set input device:', error);
      }
    }
  };

  const handleOutputChange = async (deviceId: string) => {
    setSelectedOutput(deviceId);
    const voiceClient = world?.getVoiceClient();
    if (!voiceClient) return;

    const provider = (voiceClient as VoiceClientWithProvider).provider;
    if (provider && typeof provider.setOutputDevice === 'function') {
      try {
        await provider.setOutputDevice(deviceId);
      } catch (error) {
        console.error('Failed to set output device:', error);
      }
    }
  };

  const playTestTone = () => {
    if (isPlayingTestTone) {
      // Stop test tone
      if (testToneAudio) {
        testToneAudio.pause();
        testToneAudio.currentTime = 0;
        setTestToneAudio(null);
      }
      setIsPlayingTestTone(false);
      return;
    }

    // Create test tone (440 Hz sine wave)
    interface WindowWithWebkitAudioContext extends Window {
      webkitAudioContext?: typeof AudioContext;
    }
    const audioContext = new (
      window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.1; // Low volume

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds

    setIsPlayingTestTone(true);
    setTimeout(() => {
      setIsPlayingTestTone(false);
    }, 500);
  };

  return (
    <AppleModal open={open} onClose={onClose} title="Audio-Geräte">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Input Devices */}
        <div>
          <h4 className="text-headline" style={{ margin: '0 0 12px', color: 'var(--color-label)' }}>
            Mikrofon
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inputDevices.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--color-label-secondary)',
                  fontSize: '14px',
                }}
              >
                Keine Mikrofone gefunden
              </div>
            ) : (
              inputDevices.map((device) => (
                <AppleCard
                  key={device.id}
                  onClick={() => handleInputChange(device.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background:
                      selectedInput === device.id
                        ? 'rgba(10, 132, 255, 0.15)'
                        : 'var(--color-fill-secondary)',
                    border:
                      selectedInput === device.id
                        ? '1px solid var(--color-system-blue)'
                        : '1px solid transparent',
                    transition: 'all 150ms var(--ease-in-out)',
                  }}
                >
                  <div
                    className="text-body"
                    style={{
                      color: 'var(--color-label)',
                      fontWeight: selectedInput === device.id ? 600 : 400,
                    }}
                  >
                    {device.label || `Gerät ${device.id.slice(0, 8)}`}
                  </div>
                </AppleCard>
              ))
            )}
          </div>
        </div>

        {/* Output Devices */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h4 className="text-headline" style={{ margin: 0, color: 'var(--color-label)' }}>
              Lautsprecher
            </h4>
            <AppleButton
              variant="secondary"
              onClick={playTestTone}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
              }}
            >
              {isPlayingTestTone ? 'Stopp' : 'Test-Ton'}
            </AppleButton>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {outputDevices.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--color-label-secondary)',
                  fontSize: '14px',
                }}
              >
                Keine Lautsprecher gefunden
              </div>
            ) : (
              outputDevices.map((device) => (
                <AppleCard
                  key={device.id}
                  onClick={() => handleOutputChange(device.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background:
                      selectedOutput === device.id
                        ? 'rgba(10, 132, 255, 0.15)'
                        : 'var(--color-fill-secondary)',
                    border:
                      selectedOutput === device.id
                        ? '1px solid var(--color-system-blue)'
                        : '1px solid transparent',
                    transition: 'all 150ms var(--ease-in-out)',
                  }}
                >
                  <div
                    className="text-body"
                    style={{
                      color: 'var(--color-label)',
                      fontWeight: selectedOutput === device.id ? 600 : 400,
                    }}
                  >
                    {device.label || `Gerät ${device.id.slice(0, 8)}`}
                  </div>
                </AppleCard>
              ))
            )}
          </div>
        </div>
      </div>
    </AppleModal>
  );
}
