# Authentication System

Dokumentation für das Username-basierte Authentifizierungssystem.

## Architektur

```
Client → POST /api/auth/login → Server → Session → Socket.io
```

## Server-API

### POST /api/auth/login

Erstelle eine neue Session.

**Request:**

```json
{
  "username": "TestUser"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "uuid",
  "user": {
    "userId": "uuid",
    "username": "TestUser"
  }
}
```

### POST /api/auth/logout

Beende Session.

**Request:**

- Headers: `Authorization: Bearer <sessionId>`

**Response:**

```json
{
  "success": true
}
```

### GET /api/auth/me

Get aktueller User.

**Request:**

- Headers: `Authorization: Bearer <sessionId>`

**Response:**

```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "username": "TestUser"
  }
}
```

## Client-Integration

### AuthService

```typescript
const authService = new AuthService('https://realtime.wattwelten.de');

// Login
const session = await authService.login('TestUser');

// Get current session
const session = authService.getSession();

// Logout
await authService.logout();

// Validate session
const valid = await authService.validateSession();
```

### LoginModal Component

```tsx
<LoginModal
  onLogin={(session) => {
    console.log('Logged in:', session);
  }}
  serverUrl="https://realtime.wattwelten.de"
/>
```

## Socket.io-Integration

Socket.io-Verbindungen erfordern eine gültige Session:

```typescript
const socket = io(serverUrl, {
  auth: {
    sessionId: session.sessionId,
  },
});
```

## Session-Management

### Server-seitig

- In-Memory Storage (MVP)
- Session-Timeout: 24h (konfigurierbar)
- Automatische Cleanup alle 1h

### Client-seitig

- localStorage (key: `metaverse_session`)
- Auto-Login bei vorhandener Session
- Session-Validierung beim Start

## Konfiguration

### Server Environment Variables

```env
SESSION_SECRET=xxx
SESSION_MAX_AGE=86400000  # 24h
```

## Sicherheit

1. **Session-Tokens**: Zufällige UUIDs
2. **HTTPS-only**: In Production
3. **Rate-Limiting**: Auf Login-Endpoint
4. **Session-Timeout**: Automatisches Ablaufen

## Username-Validierung

- Min-Länge: 2 Zeichen
- Max-Länge: 50 Zeichen
- Trim: Automatisch

## Nächste Schritte (Post-MVP)

1. Redis für Session-Management
2. User-Profile-System
3. OAuth-Integration
4. JWT-Tokens
