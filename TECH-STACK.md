# Tech Stack — @ybouhjira/hyperkit

> Auto-generated: 2026-03-10 15:33 UTC | Script: scripts/generate-tech-stack.sh

## Languages

| Language   | Version | Config                                                  |
| ---------- | ------- | ------------------------------------------------------- |
| TypeScript | 5.9.x   | strict: true, target: ESNext, moduleResolution: bundler |
| CSS        | 3       | CSS Modules                                             |

## Frameworks & Libraries

| Name          | Version | Purpose                  |
| ------------- | ------- | ------------------------ |
| @kobalte/core | 0.13.x  | Accessible UI primitives |
| vitest        | 4.0.x   | Test framework           |
| solid-js      | 1.9.x   | UI framework             |
| effect        | 3.19.x  | Functional effect system |

## Build & Dev Tools

| Tool    | Version | Purpose              |
| ------- | ------- | -------------------- |
| vite    | 7.3.x   | Bundler + dev server |
| esbuild | 0.27.x  | Bundler              |

## Quality Tools

| Tool                      | Version | Purpose                    |
| ------------------------- | ------- | -------------------------- |
| @testing-library/jest-dom | 6.9.x   | Testing utilities          |
| eslint                    | 9.39.x  | Linting                    |
| vitest                    | 4.0.x   | Unit testing               |
| prettier                  | 3.8.x   | Code formatting            |
| stylelint                 | 17.4.x  | CSS linting                |
| publint                   | 0.3.x   | Package publish validation |
| size-limit                | 12.0.x  | Bundle size checking       |
| @arethetypeswrong/cli     | 0.18.x  | Type checking for packages |
| knip                      | 5.85.x  | Unused code detection      |

## Logging & Observability

- Logger: None configured
- Error tracking: None
- Tracing: None

## Deployment

- Target: npm registry
- CI: GitHub Actions
- Node versions: 20, 22

## Workspace Packages

| Package                           | Path                            | Description                                                                     |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| @ybouhjira/diagram-core           | packages/diagram-core           | Framework-agnostic diagramming engine core - graph model, layouts, edge routing |
| @ybouhjira/diagram-solid          | packages/diagram-solid          | SolidJS bindings for diagram-core diagramming engine                            |
| @ybouhjira/diagram-svg            | packages/diagram-svg            | Framework-agnostic SVG renderer for diagram-core                                |
| @ybouhjira/eslint-plugin-hyperkit | packages/eslint-plugin-hyperkit | No description                                                                  |
| @ybouhjira/explorer               | packages/explorer               | No description                                                                  |
