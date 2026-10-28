# Security Policy

## Supported Versions

Security updates and patches are actively applied to the following release trains:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

---

## Reporting a Vulnerability

The Ghost-Watch C2 Terminal engineering team takes cryptographic integrity and system security with utmost priority.

If you believe you have discovered a vulnerability related to:
- Post-Quantum Cryptographic key encapsulation (ML-KEM / Kyber-1024)
- Digital signatures (ML-DSA / Dilithium-3)
- Real-time kernel telemetry or SSE stream exhaustion
- Upstream AI proxy or prompt injection boundaries
- Arbitrary code execution in isolated environments

### Disclosure Process
1. **Do NOT open a public GitHub issue.**
2. Send an email to the security team with details of the vulnerability.
3. Include:
   - Reproduction steps or Proof of Concept (PoC).
   - Potential impact on operator confidentiality or cryptographic secrecy.
   - Any suggested mitigations.
4. The security response team will acknowledge receipt within 48 hours and provide a timeline for remediation.
5. Once a fix has been developed and tested, a coordinated security release and CVE will be issued.

---

## Cryptographic Posture

Ghost-Watch is built in alignment with:
- **NIST FIPS 203:** Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)
- **NIST FIPS 204:** Module-Lattice-Based Digital Signature Standard (ML-DSA)
- **NIST FIPS 205:** Stateless Hash-Based Digital Signature Standard (SLH-DSA)
- **OWASP Top 10 API Security** guidelines for telemetry streaming and rate-limiting.
