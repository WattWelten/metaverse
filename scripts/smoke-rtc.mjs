import assert from 'node:assert/strict';

const TOKEN_API = process.env.RTC_TOKEN_URL || process.env.VITE_RTC_TOKEN_ENDPOINT || 'http://localhost:3001/api/rtc/token';
const ROOM = process.env.E2E_ROOM || 'plaza';

const res = await fetch(TOKEN_API, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    roomId: ROOM,
    userId: 'smoke-user',
    displayName: 'Smoke',
    role: 'speaker',
  }),
});

if (!res.ok) {
  const error = await res.json().catch(() => ({ error: res.statusText }));
  if (res.status === 500 && error.error?.includes('LiveKit configuration missing')) {
    console.log('⚠️  RTC token endpoint: LiveKit nicht konfiguriert (LIVEKIT_URL/API_KEY/API_SECRET fehlen)');
    console.log('   → Test übersprungen (erwartet für lokale Entwicklung ohne LiveKit)');
    process.exit(0);
  }
  throw new Error(`rtc token endpoint failed: ${res.status} ${res.statusText}`);
}

const js = await res.json();
assert.ok(js.token, 'no token in response');
assert.ok(js.url, 'no url in response');
console.log('✅ RTC token OK');
