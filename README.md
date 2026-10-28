<div align="center">

# 🛰️ GHOST-WATCH C2 TERMINAL
### *Apex Tier Real-Time Command & Control Operations Station*

[![CI Build](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge&logo=githubactions)](https://github.com/)
[![Real-Time Telemetry](https://img.shields.io/badge/live_telemetry-SSE_1000ms-00ff41.svg?style=for-the-badge)](https://github.com/)
[![React 19](https://img.shields.io/badge/react-19.0.0-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Recharts](https://img.shields.io/badge/recharts-3.10.1-22b5bf.svg?style=for-the-badge)](https://recharts.org/)
[![Vite](https://img.shields.io/badge/vite-8.3.1-646cff.svg?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.1.14-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.2-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-339933.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![PQC Standard](https://img.shields.io/badge/PQC-Kyber--1024%20%7C%20Dilithium--3-emerald.svg?style=for-the-badge)](https://csrc.nist.gov/projects/post-quantum-cryptography)
[![AI Sub-System](https://img.shields.io/badge/AI_Engine-Gemini_3.8_Flash-8b5cf6.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=for-the-badge)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](./CONTRIBUTING.md)

<p align="center">
  <b>Ghost-Watch C2 Terminal</b> is an elite, tactical Command & Control operations workstation featuring real-time kernel telemetry, sub-second Server-Sent Events (SSE) streaming, Recharts data visualization, Post-Quantum Cryptographic (PQC) hardening (NIST FIPS 203/204), and autonomous cognitive threat intelligence powered by Google Gemini 3.8 Flash.
</p>

</div>

---

## ⚡ Core Operational Capabilities

- 📊 **Real-Time System Health Widget (Recharts 3.x):** 
  - Live kernel CPU, RAM, and Disk storage graphs streaming at 1000ms intervals via Server-Sent Events (SSE).
  - Multi-core thread breakdown with per-core usage percentages and frequency clock rates.
  - Granular memory allocation (Used/Total GB, Node.js Process RSS, and V8 Heap metrics).
  - Storage partition telemetry (`/` mount point utilization, total capacity, and available buffer).
  - Interactive controls: Pause/Resume telemetry, historical buffer scrub, and raw JSON export.

- 🛡️ **Post-Quantum Cryptographic Engine (PQC):**
  - NIST FIPS 203 (ML-KEM / Kyber-1024) key encapsulation mechanisms.
  - NIST FIPS 204 (ML-DSA / Dilithium-3) quantum-resistant digital signatures.
  - SPHINCS+ (SLH-DSA) stateless hash-based backup verification.
  - Constant-time side-channel defense and verified entropy shielding.

- 🛰️ **Tactical Satellite & Orbital Recon (SatCom):**
  - LEO satellite constellation tracking with Doppler frequency compensation.
  - Multi-satellite telemetry feeds with azimuth/elevation antenna coordinates.

- 🎯 **Geo-Trace & Perimeter Defense:**
  - Dynamic geofence breach detection with automated acoustic tripping.
  - Sub-space crystal resonant tuning with variable delay and feedback gain.

- 🧠 **Autonomous Cognitive Threat Intelligence:**
  - Primary analysis via Google Gemini `gemini-3.8-flash` with graceful failover to `gemini-3.1-flash-lite`.
  - Offline autonomous heuristic engine providing clinical operational threat categorization under zero-network conditions.

---

## 📡 Live Telemetry Architecture

Ghost-Watch provides genuine real-time system metrics directly from the host operating system:

```
┌────────────────────────────────────────────────────────┐
│                   Host Linux / Kernel                  │
│       [os.cpus()]  [os.totalmem()]  [fs.statfs('/')]   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Node.js C2 Express Engine                │
│    - Rolling 40-sample in-memory ring buffer           │
│    - Real-time CPU delta computation (user/sys/idle)   │
│    - Memory & Process RSS measurement                  │
│    - Disk partition capacity & free space calculation  │
└─────────────┬────────────────────────────┬─────────────┘
              │ SSE Stream (1000ms)        │ REST Fallback
              ▼                            ▼
┌────────────────────────────────────────────────────────┐
│            Ghost-Watch React 19 Frontend               │
│  - EventSource hook with automatic reconnect           │
│  - Recharts AreaChart & ResponsiveContainer            │
│  - Monospace HUD with zero-latency visual feedback     │
└────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Reference

### 1. `GET /api/system/stream`
- **Protocol:** Server-Sent Events (`text/event-stream`)
- **Interval:** 1000ms
- **Payload Example:**
```json
{
  "timestamp": 1730090000000,
  "timeString": "03:15:22",
  "cpu": {
    "usagePercent": 14,
    "cores": [
      { "core": 0, "model": "AMD EPYC", "speed": 2800, "usagePercent": 18 },
      { "core": 1, "model": "AMD EPYC", "speed": 2800, "usagePercent": 10 }
    ],
    "loadAvg": [0.42, 0.38, 0.25],
    "model": "AMD EPYC 7B13",
    "coreCount": 8
  },
  "memory": {
    "totalBytes": 34359738368,
    "usedBytes": 8589934592,
    "freeBytes": 25769803776,
    "usagePercent": 25.0,
    "totalGB": 32.0,
    "usedGB": 8.0,
    "freeGB": 24.0,
    "processRssMB": 68.4,
    "heapUsedMB": 32.1,
    "heapTotalMB": 48.5
  },
  "disk": {
    "totalBytes": 107374182400,
    "usedBytes": 28991029248,
    "freeBytes": 78383153152,
    "usagePercent": 27.0,
    "totalGB": 100.0,
    "usedGB": 27.0,
    "freeGB": 73.0,
    "mountPoint": "/"
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "release": "6.1.0",
    "hostname": "c2-apex-01",
    "uptimeSeconds": 14820,
    "uptimeFormatted": "04:07:00",
    "nodeVersion": "v22.14.0",
    "pid": 4821
  }
}
```

### 2. `GET /api/system/health`
- **Protocol:** HTTP GET (`application/json`)
- Returns the current single-point system snapshot.

### 3. `GET /api/system/history`
- **Protocol:** HTTP GET (`application/json`)
- Returns the ring buffer containing the last 30-40 snapshots for immediate graph population on page load.

### 4. `POST /api/gemini/process-logs`
- **Protocol:** HTTP POST (`application/json`)
- Analyzes security events and signal logs using Google Gemini 3.8 Flash, with automatic failover to Gemini 3.1 Flash-Lite and clinical tactical heuristics.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** `>=20.0.0` (LTS recommended)
- **npm:** `>=9.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/your-org/ghost-watch-c2.git
cd ghost-watch-c2
npm install
```

### 2. Environment Configuration
Create your `.env` file from `.env.example`:
```bash
cp .env.example .env
```
*(Optional)* Add your Google Gemini API key if upstream AI intelligence features are desired:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If no API key is provided, the embedded Autonomous Tactical Heuristic Engine will run locally.*

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🏗️ Repository Architecture

```
ghost-watch-c2/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # GitHub Actions CI matrix (Node 20.x, 22.x)
│   │   └── release.yml            # Automated production release pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          # Bug report template
│   │   ├── feature_request.md     # Feature request template
│   │   └── security_advisory.md   # Cryptographic security advisory template
│   ├── PULL_REQUEST_TEMPLATE.md   # Pull request checklist
│   └── dependabot.yml             # Automated dependency updates
├── src/
│   ├── components/
│   │   ├── SystemHealthWidget.tsx # Live CPU, RAM, Disk Recharts widget
│   │   ├── Overview.tsx           # Mission overview & telemetry configurator
│   │   ├── Cryptography.tsx       # Post-quantum algorithms (Kyber, Dilithium)
│   │   ├── Defense.tsx            # Honeypot, canary, and tarpitting controls
│   │   ├── SatCom.tsx             # Satellite orbit & Doppler frequency tracking
│   │   ├── Geolocation.tsx        # Geo-fence target tracking & breach logic
│   │   ├── Intelligence.tsx       # AI threat correlation & operations briefs
│   │   ├── Sandbox.tsx            # Isolated memory payload execution
│   │   ├── SecureComm.tsx         # PQC encrypted peer terminal
│   │   ├── Tactical.tsx           # Tactical surveillance feeds
│   │   └── Logs.tsx               # Immutable C2 audit log stream
│   ├── App.tsx                    # Shell layout, navigation, and sidebar telemetry
│   ├── types.ts                   # TypeScript interfaces & system contracts
│   ├── index.css                  # Tailwind CSS v4 styling & tactical scanlines
│   └── main.tsx                   # React 19 entrypoint
├── server.ts                      # Express server, SSE streaming, Gemini SDK proxy
├── package.json                   # Verified dependencies & build scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── vite.config.ts                 # Vite 8 configuration with React plugin
├── CHANGELOG.md                   # Version history & release notes
├── CODE_OF_CONDUCT.md             # Contributor Covenant v2.1
├── CONTRIBUTING.md                # Development & contribution guidelines
├── LICENSE                        # Apache 2.0 License
├── SECURITY.md                    # Vulnerability reporting & PQC policy
├── CITATION.cff                   # Citation format
└── .editorconfig                  # Code formatting standard
```

---

## 🛡️ Security & Compliance

- **Post-Quantum Standard Compliance:** Adheres to the latest NIST standards for post-quantum key agreement (FIPS 203) and digital signatures (FIPS 204).
- **Zero Pill / Anti-Slop UI Standard:** Crafted with strict architectural principles, authentic monospace telemetry, military contrast ratios, and responsive viewport resilience.
- **Air-Gapped Autonomous Capability:** Fully operational even when upstream cloud APIs are offline or disconnected.

---

## 📜 License

Distributed under the **Apache License 2.0**. See [`LICENSE`](./LICENSE) for full details.
