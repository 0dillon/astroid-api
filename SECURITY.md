# Security Policy

Astroid is financial infrastructure for autonomous AI agents. We take security
seriously and appreciate responsible disclosure.

## Supported Versions

The API follows Semantic Versioning. Security fixes are released for the latest
minor of the current major. During the `0.x` phase, please track the latest
release.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.**

Email `security@astroid.dev` with:

- A description of the vulnerability and its impact
- Steps to reproduce (proof of concept if possible)
- Affected module(s) and version(s)

We aim to acknowledge reports within 48 hours and to provide a remediation
timeline within five business days.

## Scope & handling guidance

- **Never commit secrets.** Database URIs, API keys, Stellar signing material,
  and webhook secrets must not appear in source, tests, or examples. Use `.env`
  files that are gitignored.
- **Input validation.** Every endpoint validates input using Zod schemas. Never
  trust client-side validation alone.
- **Secret redaction.** The API never logs request bodies containing passwords,
  tokens, API keys, or private keys. Please keep it that way in contributions.
- **Least privilege.** Scope API keys and roles to the minimum permissions
  required. Granular RBAC+ABAC is enforced at every layer.
- **Audit everything.** Every important action must record the actor, timestamp,
  entity, old/new values, and correlation ID.

Thank you for helping keep the Astroid ecosystem safe.
