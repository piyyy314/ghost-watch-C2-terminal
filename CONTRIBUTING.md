# Contributing to Ghost-Watch C2 Terminal

Thank you for your interest in contributing to Ghost-Watch C2 Terminal! We welcome contributions that improve system stability, enhance post-quantum cryptographic security, optimize telemetry throughput, or expand operational modules.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/your-username/ghost-watch-c2.git
   cd ghost-watch-c2
   ```

2. **Install Dependencies**
   Ensure you are using Node.js `>= 20.0.0`:
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The local terminal will be available at `http://localhost:3000`.

---

## 📋 Coding Standards

- **TypeScript Strictness:** All code must compile with zero errors under `npm run lint` (`tsc --noEmit`).
- **Tailwind CSS v4:** Use utility classes directly in JSX. No inline style objects unless calculating dynamic animated heights or SVG dimensions.
- **Post-Quantum Cryptographic Principles:** Never introduce legacy non-PQC primitives (e.g. RSA-1024 or unpadded SHA-1) into core security modules.
- **Telemetry Performance:** Server-Sent Events (SSE) handlers must maintain non-blocking execution and cleanly remove client listeners on socket closure to prevent memory leaks.
- **Recharts Responsiveness:** All chart components must be wrapped in `ResponsiveContainer` and test cleanly across both desktop and mobile viewports.

---

## 🌿 Branching & Commit Conventions

- Use feature branches branched from `main`:
  - `feat/feature-name`
  - `fix/bug-description`
  - `docs/update-guide`
  - `refactor/subsystem-optimization`
- Commit messages follow conventional commits:
  ```
  feat(telemetry): integrate real-time SSE disk utilization tracking
  fix(charts): eliminate layout shift in Recharts ResponsiveContainer
  docs(readme): add live badges and API schema
  ```

---

## 🧪 Verification Before Submitting a PR

Before submitting your pull request, execute the following commands:
```bash
# 1. Verify TypeScript types and syntax
npm run lint

# 2. Verify complete client & server bundle compilation
npm run build
```

---

## 📜 Pull Request Process

1. Open a Pull Request referencing any associated issues.
2. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
3. Ensure CI checks pass on all supported Node versions (`20.x`, `22.x`).
4. Maintainers will review the submission and provide feedback.
