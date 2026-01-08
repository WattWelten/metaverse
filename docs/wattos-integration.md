# wattos_plattform Integration

## Übersicht

Das WattWelten Metaverse integriert die [wattos_plattform](https://github.com/WattWelten/wattos_plattform) für AI-Features über den `AgentBridge`.

## AgentBridge Setup

### Konfiguration

Die AgentBridge wird automatisch initialisiert, wenn `VITE_AI_ENABLED=true` gesetzt ist.

**Environment Variables:**

```env
VITE_AI_ENABLED=true
VITE_WATTOS_BASE_URL=https://api.wattos.local
VITE_WATTOS_WS_URL=wss://api.wattos.local/realtime
VITE_WATTOS_API_KEY=your-api-key
VITE_WATTOS_TENANT=your-tenant
```

### Initialisierung

Die AgentBridge wird in `World.ts` automatisch initialisiert:

```typescript
private initAgentBridge(flags: FeatureFlags): void {
  if (!flags.AI_ENABLED) {
    return;
  }

  this.agentBridge = new AgentBridge({
    baseUrl: flags.WATTOS_BASE_URL || 'https://api.wattos.local',
    wsUrl: flags.WATTOS_WS_URL || 'wss://api.wattos.local/realtime',
    apiKey: flags.WATTOS_API_KEY || '',
    tenant: flags.WATTOS_TENANT,
    sessionId: this.userId,
    userId: this.userId,
  });

  this.agentBridge.connect();
}
```

## AI-Features

### Event-Handler

Die AgentBridge unterstützt folgende Events:

- `connected`: Verbindung hergestellt
- `disconnected`: Verbindung getrennt
- `agent_speech`: AI-Agent spricht
- `tool_call`: Tool wird aufgerufen
- `tool_result`: Tool-Ergebnis
- `error`: Fehler aufgetreten

### Beispiel: Event-Handler

```typescript
const world = worldRef.current;
const agentBridge = world?.getAgentBridge();

if (agentBridge) {
  agentBridge.on('agent_speech', (data) => {
    console.log('[AI] Agent speech:', data);
    // Zeige AI-Nachricht in UI
  });

  agentBridge.on('tool_call', (data) => {
    console.log('[AI] Tool call:', data);
    // Führe Aktion aus (z.B. Objekt platzieren)
  });
}
```

### Text senden

```typescript
await agentBridge.sendText('Hello, AI!');
```

### Tool aufrufen

```typescript
const result = await agentBridge.invokeTool('tool-id', {
  param1: 'value1',
});
```

## Konfiguration

### Feature Flags

Die AI-Integration ist vollständig flag-gesteuert:

- `VITE_AI_ENABLED`: Aktiviert/deaktiviert AI-Features
- Wenn `false`: AgentBridge wird nicht initialisiert (No-Op)

### Fallback

Wenn `AI_ENABLED=false`, wird eine No-Op-Implementierung verwendet:

```typescript
const bridge = AgentBridge.createNoOp();
```

## Zukünftige Features

### AI-Guided Workflows

- AI-Agent führt User durch immersive Experiences
- Workflow-Orchestrierung
- Objekte platzieren via AI

### AI Actions

- Objekte in der Szene platzieren
- Pinboards erstellen
- Navigation zu Points of Interest

### AI Notes & Context Memory

- Realtime Notes während Sessions
- Perfect Recall (Context Memory)
- Notes anzeigen für Teilnehmer

## Troubleshooting

### Verbindungsfehler

1. Prüfe `VITE_WATTOS_BASE_URL` und `VITE_WATTOS_WS_URL`
2. Prüfe `VITE_WATTOS_API_KEY`
3. Prüfe Browser-Console für Fehler

### Events werden nicht empfangen

1. Prüfe ob `agentBridge.isEnabled()` `true` zurückgibt
2. Prüfe WebSocket-Verbindung in Browser DevTools
3. Prüfe Server-Logs in wattos_plattform

## Weitere Ressourcen

- [wattos_plattform Repository](https://github.com/WattWelten/wattos_plattform)
- [AgentBridge Dokumentation](../packages/ai/src/AgentBridge.ts)
