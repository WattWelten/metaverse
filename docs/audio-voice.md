# Audio & Voice

## Spatial Audio

Das Spatial Audio System ermöglicht räumliche Audio-Effekte basierend auf der Position von Sprechern und Zuhörern.

### Features

- **Distance Attenuation**: Audio wird leiser/lauter basierend auf Distanz
- **Reverb**: Räumliche Reverb-Effekte
- **Doppler**: Geschwindigkeits-basierte Audio-Anpassungen

### Verwendung

```typescript
import { VoiceClient } from '@metaverse/voice';

const voiceClient = new VoiceClient({
  userId: 'user-123',
  roomId: 'room-1',
  enableSpatialAudio: true,
});

await voiceClient.enable();

// Listener-Position aktualisieren
voiceClient.updateListenerPosition(new Vector3(0, 0, 0));

// Speaker-Position aktualisieren
voiceClient.updateSpeakerPosition('user-456', new Vector3(10, 0, 0));
```

## Ambient Audio

Das Ambient-Audio-System spielt Hintergrundgeräusche ab.

### Verwendung

```typescript
import { AmbientManager } from '@metaverse/audio';

const ambientManager = new AmbientManager();

// Aus Template laden
ambientManager.loadFromTemplate(templateManifest);

// Manuell hinzufügen
ambientManager.addSource({
  id: 'birds',
  file: '/audio/birds.mp3',
  volume: 0.3,
  loop: true,
});

// Abspielen
ambientManager.playAll();
```

### Presets

Vordefinierte Presets:

- `nature`: Vogelgezwitscher, Wasserrauschen
- `urban`: Verkehr, Stadtgeräusche
- `indoor`: Innenraum-Ambient



