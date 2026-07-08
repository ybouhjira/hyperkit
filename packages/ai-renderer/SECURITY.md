# hyperkit-ai-renderer — DEV ONLY until hardened

> ⚠️ **NOT PRODUCTION-READY.** Do not ship builds that include
> `<LiveRenderer>` (or any JSON→UI endpoint powered by this package) to
> customers, teammates, or any environment exposed to the public
> internet — including Tailscale-public, ngrok, reverse proxies, or
> `0.0.0.0` binds — until every box in the checklist below is green.

## Why this is sensitive

Turning an incoming JSON tree into live SolidJS components is, by
definition, **remote code execution with a schema in front of it**. The
JSON feed is a privileged channel: whatever touches that feed can make
the running app render, fetch, navigate, or leak on behalf of the user.

## Threat model (active, not theoretical)

- **Prop-injection XSS** — any component accepting `innerHTML`, `src`,
  `href`, `style`, or URL-valued props is an exfil/script vector.
  Sanitize at the schema layer, never at render time.
- **Event-handler smuggling** — `onClick`, `onInput`, `on*` MUST be
  ignored when sourced from JSON. Only data props pass through.
- **Prototype pollution** — strip `__proto__`, `constructor`, `prototype`
  from any incoming object before it touches a component.
- **Fetch-on-mount exfil** — `<Image src>`, iframes, any component that
  issues a request on mount can ping an attacker-controlled URL with
  cookies / tokens / state-derived paths. Domain allowlist required.
- **Denial-of-render** — deeply-nested or fan-out JSON freezes the main
  thread. Enforce max depth + max node count at the schema.
- **Endpoint exposure** — the POST / WS channel that feeds the renderer
  is a remote-render RPC. Bind to `127.0.0.1` only. Public bind must be
  an explicit, loud opt-in with auth.

## Hardening checklist — all boxes green before anyone else sees this

- [ ] Effect Schema validates every node; unknown keys rejected
- [ ] Component whitelist — no arbitrary component names
- [ ] Per-component prop whitelist — data-only, no handlers
- [ ] URL-valued props go through a domain allowlist + strip `javascript:`
- [ ] Max tree depth, max node count, max string length enforced
- [ ] Feed endpoint auth-gated (bearer token + origin check)
- [ ] Loopback bind by default; public bind requires explicit flag
- [ ] `Content-Security-Policy` on any page embedding `<LiveRenderer>`
- [ ] Dependency audit + secret scanning in CI
- [ ] Pentest pass (external or paid)
- [ ] Threat model reviewed and signed off

## Until then

- Single-user, local-only, dev machines only.
- Do not demo over a shared screen / link without a loopback tunnel.
- Do not commit JSON mockups that contain real tokens, URLs, or PII.
- When in doubt: do not expose. Default closed.

## Broader

A production deployment needs a dedicated security review —
threat modeling, dep auditing, secret scanning, SBOM, and eventually a
paid pentest — before the product touches a paying customer.
