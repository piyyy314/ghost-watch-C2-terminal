# Changelog

All notable changes to the Ghost-Watch C2 Terminal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-10-28

### Added
- **Real-Time System Health Widget:** Integrated Recharts 3.x in the `Overview` module displaying live CPU, RAM, and Disk storage graphs.
- **Server-Sent Events (SSE) Telemetry Stream:** High-throughput streaming endpoint at `/api/system/stream` delivering 1000ms updates of kernel metrics.
- **Multi-Core Thread Telemetry:** Per-core CPU load percentages, processor clock speeds, and rolling 1-minute load averages.
- **Memory & Process Footprint Tracking:** Kernel memory allocation (Used/Free GB), Node.js process RSS, and V8 heap tracking.
- **Storage Partition Analytics:** Real `/` mount point capacity, utilized storage, and buffer headroom.
- **Live C2 Environment Sidebar:** Right sidebar synchronized with live server uptime, host platform, and architecture.
- **Professional GitHub Repository Architecture:**
  - Automated CI matrix workflows (`.github/workflows/ci.yml`).
  - Production release pipeline (`.github/workflows/release.yml`).
  - Issue templates (bug report, feature request, security advisory).
  - Dependabot configuration for continuous dependency audits.
  - Apache-2.0 License, Security Policy, Code of Conduct, and citation metadata.
  - Comprehensive documentation with real-data technology badges.

### Changed
- Upgraded `recharts` to v3.10.1 with React 19 compatibility.
- Memoized telemetry handlers and eliminated layout shifts in responsive charting containers.

---

## [2.0.0] - 2026-09-28

### Added
- Post-Quantum Cryptography (PQC) integration with NIST FIPS 203 (ML-KEM / Kyber-1024) and NIST FIPS 204 (ML-DSA / Dilithium-3).
- Google Gemini 3.8 Flash C2 Cognitive Intelligence sub-system with autonomous tactical heuristic fallback.
- SatCom LEO satellite tracker with Doppler effect calculation.
- Geo-Trace perimeter defense and ultrasonic honeypot acoustic triggers.
- Multi-viewport responsive interface with mobile drawers and collapsible command rails.

---

## [1.0.0] - 2026-08-15

### Added
- Initial release of Ghost-Watch C2 Terminal.
- Basic telemetry logging and cryptographic baseline engines.
