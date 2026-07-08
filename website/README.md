# HyperKit Documentation Website

Built with [Docusaurus](https://docusaurus.io/).

## Development

```bash
npm install
npm run generate   # regenerate component pages from ../docs-manifest.json
npm start          # dev server
```

## Build

```bash
npm run build
```

The build defaults to GitHub Pages (`https://ybouhjira.github.io/hyperkit/`). For a custom domain:

```bash
DOCS_URL=https://example.com DOCS_BASE_URL=/ npm run build
```

## Deployment

Pushes to `main` that touch `website/` or `docs-manifest.json` trigger `.github/workflows/docs.yml`, which builds the site and deploys it to GitHub Pages.

## Component pages

Pages under `docs/components/` are generated — do not edit them by hand. Edit `scripts/generate-component-docs.mjs` (categories, descriptions, page layout) or the source manifest, then re-run `npm run generate`.
