import { LiveKitProvider } from '@metaverse/voice';
import { useEffect, useMemo, useState } from 'react';

const ENABLED = import.meta.env.VITE_VOICE_ENABLED === 'true';

interface VoicePanelProps {
  room: string;
}

export function VoicePanel({ room }: VoicePanelProps) {
  const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);
  const [joined, setJoined] = useState(false);
  const prov = useMemo(() => new LiveKitProvider(), []);

  useEffect(() => {
    prov.onState?.((s) => setState(s));
  }, [prov]);

  if (!ENABLED) return null;

  async function join() {
    const url = import.meta.env.VITE_LIVEKIT_URL || '';
    const base = import.meta.env.VITE_WATTOS_BASE_URL || '';
    const tokenUrl = `${base}/voice/token?room=${encodeURIComponent(room)}`;
    try {
      const response = await fetch(tokenUrl);
      // DEV: erwartet raw token (oder JSON.token)
      const tokenData = await response.text();
      const token = tokenData.startsWith('{') ? JSON.parse(tokenData).token : tokenData;
      await prov.join({ url, token, room });
      setJoined(true);
      const deviceList = await prov.listDevices();
      setDevices(deviceList.map((d) => ({ id: d.id, label: d.label || d.id })));
    } catch (error) {
      console.error('Failed to join voice room:', error);
      setState('error');
    }
  }

  async function leave() {
    await prov.leave();
    setJoined(false);
  }

  async function mute(m: boolean) {
    await prov.mute(m);
  }

  return (
    <div className="voice-panel" data-testid="voice-panel">
      <div>Voice: {state}</div>
      {!joined ? (
        <button onClick={join}>Join</button>
      ) : (
        <>
          <button onClick={leave}>Leave</button>
          <button onClick={() => mute(true)}>Mute</button>
          <button onClick={() => mute(false)}>Unmute</button>
          <select onChange={(e) => prov.setInputDevice(e.target.value)}>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
