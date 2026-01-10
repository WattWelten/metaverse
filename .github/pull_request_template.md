## Titel

<!-- kurz & präzise, z. B.: "feat: SFU/LiveKit + Token API" -->

## Ziel / Kontext

<!-- Was löst der PR? Warum jetzt? -->

## Änderungen (Kurzliste)

- [ ] SFU/RTC
- [ ] Zonen/Stage
- [ ] Collab (Yjs)
- [ ] Companion /remote
- [ ] Strapi-Content
- [ ] Moderation/Consent
- [ ] CI/Doku/Sentry

## Acceptance-Criteria (ABHACKEN)

- [ ] Join p90 < 6 s
- [ ] Audio stabil (5–10 TN), p95 < 400 ms
- [ ] Screenshare 1080p/30 sichtbar
- [ ] Zonen isolieren Gruppen (Cross-Leak < −55 dB)
- [ ] Whiteboard+Markdown Sync < 200 ms (5 Editoren)
- [ ] /remote PTT < 300 ms, Pairing < 5 s
- [ ] Scene aus Strapi publiziert → live im Client
- [ ] CI grün

## Testhinweise

- `pnpm smoke`, `pnpm e2e`, `pnpm audit`
- Manuelle Schritte: …

## Screens / GIFs

<!-- optional -->

## Risiken / Rollback

<!-- kurz -->
