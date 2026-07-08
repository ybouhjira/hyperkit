---
summary: Adapter-driven "where does this video come from" picker — Library, Paste-URL, Local file, plus pluggable cloud sources.
status: stable
a11y: Built on the @kobalte Tabs primitive (role=tablist/tab/tabpanel), arrow-key navigable. Provider errors are surfaced in a role=alert banner.
---

A generic shell that renders one tab per `VideoSourceProvider` and hands back the chosen `VideoSource`. The built-in factories cover a host library, paste-a-URL-to-download (cached on repeat), and a local file; a provider with no `render` shows a "coming soon" placeholder, so new sources (Google Drive, Google Photos, Filesystem) can be slotted in before their backend is wired.

## Do

- Compose the built-in `libraryVideoProvider` / `urlVideoProvider` / `localVideoProvider` factories instead of re-implementing the panels.
- Use `comingSoonVideoProvider` to stub a not-yet-wired source with a labelled, icon'd placeholder tab.
- Handle `onError` to surface download/list failures, and keep backend coupling in the `VideoSourceAdapter` you supply.

## Don't

- Don't hand-roll provider objects when a factory exists — the factories carry the correct label, icon and behavior.
- Don't put API/network code inside the widget — it stays backend-agnostic via the adapter.
- Don't assume a fixed tab set — the provider list is the contract; order and availability come from it.
