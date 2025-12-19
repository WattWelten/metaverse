# AI Integration

## AgentBridge zu wattos_plattform

Der AgentBridge ermöglicht die Integration mit der wattos_plattform für KI-Funktionen.

### Konfiguration

```typescript
import { AgentBridge } from '@metaverse/ai';

const bridge = new AgentBridge({
  baseUrl: 'https://api.wattos.local',
  wsUrl: 'wss://api.wattos.local/realtime',
  apiKey: 'your-api-key',
  tenant: 'your-tenant',
  sessionId: 'session-123',
  userId: 'user-123',
});
```

### Verbindung

```typescript
await bridge.connect();

bridge.on('agent_speech', (data) => {
  console.log('Agent said:', data);
});

bridge.on('tool_call', (data) => {
  console.log('Tool called:', data);
});
```

### Text senden

```typescript
await bridge.sendText('Hello, AI!');
```

### Tool aufrufen

```typescript
const result = await bridge.invokeTool('tool-id', {
  param1: 'value1',
});
```

### No-Op Modus

Wenn `AI_ENABLED=false`, wird eine No-Op-Implementierung verwendet:

```typescript
const bridge = AgentBridge.createNoOp();
```

