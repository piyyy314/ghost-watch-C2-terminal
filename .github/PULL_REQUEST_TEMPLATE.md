## Description
Briefly describe the intent and changes introduced in this pull request.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Cryptographic hardening / Security patch
- [ ] Documentation / Badges / CI update

## Modules Impacted
- [ ] `Overview` & `SystemHealthWidget` (Real-Time Telemetry & Recharts)
- [ ] `Cryptography` (Kyber, Dilithium, SLH-DSA)
- [ ] `Defense` (Canary, Tarpits, Decoys)
- [ ] `SatCom` (Doppler, LEO Orbit Simulation)
- [ ] `Geolocation` (Geo-Fence & Vector Tracking)
- [ ] `Intelligence` (Gemini 3.8 Flash C2 Engine)
- [ ] `Server` (`server.ts`, SSE endpoints, metrics collection)

## Testing Checklist
- [ ] `npm run lint` (`tsc --noEmit`) passes with zero errors.
- [ ] `npm run build` completes successfully.
- [ ] Real-time SSE telemetry streams continuous 1-second updates without memory leaks.
- [ ] Recharts graphs render smoothly without layout shift or unexpected scrolling.
- [ ] Fallback polling activates if the SSE connection is interrupted.
- [ ] Responsive behavior verified on both mobile viewports and desktop resolutions.
