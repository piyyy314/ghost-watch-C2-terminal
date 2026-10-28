---
name: Security Vulnerability Advisory
about: Report a potential vulnerability or cryptographic defect
title: "[SEC] "
labels: ["security", "critical"]
assignees: ''

---

> [!CAUTION]
> If this vulnerability affects active production systems or exposes cryptographic keys, please consider emailing security disclosures privately according to the guidelines in [SECURITY.md](../SECURITY.md).

**Summary**
Brief explanation of the vulnerability or cryptographic anomaly.

**Cryptographic / Architectural Surface**
- [ ] Post-Quantum Key Encapsulation (ML-KEM / Kyber-1024)
- [ ] Digital Signature Verification (ML-DSA / Dilithium-3)
- [ ] Real-Time Telemetry & SSE Stream Buffer
- [ ] Gemini AI Integration & Prompt Isolation
- [ ] Tarpitting & Anti-Reconnaissance Handlers
- [ ] Node.js Server & REST Endpoints

**Vulnerability Severity Assessment**
- [ ] Low
- [ ] Medium
- [ ] High
- [ ] Critical (Key compromise or remote execution)

**Reproduction Steps**
1. Step 1
2. Step 2
3. Observed impact

**Remediation Recommendation**
Suggested patch, constant-time algorithmic adjustment, or security configuration.
