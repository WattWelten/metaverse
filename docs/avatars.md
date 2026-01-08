# Avatare

## Ready Player Me Integration

Ready Player Me ist die primäre Avatar-Lösung für das Metaverse.

### Avatar laden

```typescript
import { AvatarManager } from '@metaverse/avatars';
import { getReadyPlayerMeUrl } from '@metaverse/avatars';

const avatarManager = new AvatarManager(scene);

// Avatar von Ready Player Me laden
const avatarUrl = getReadyPlayerMeUrl('user-123');
const avatar = await avatarManager.loadAvatar('user-123', avatarUrl);
```

### Avatar aktualisieren

```typescript
avatarManager.updateAvatar('user-123', new Vector3(0, 0, 0), new Vector3(0, 0, 0), 'walk');
```

### Multiplayer-Integration

Avatare werden automatisch über das Multiplayer-System synchronisiert:

```typescript
const netClient = new NetClient({
  serverUrl: 'http://localhost:3001',
  userId: 'user-123',
});

avatarManager.setNetClient(netClient);
```
