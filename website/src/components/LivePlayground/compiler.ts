/**
 * In-browser Solid JSX compiler for the live playground.
 *
 * Uses @babel/standalone with babel-preset-solid (generate: 'dom') — the same
 * pipeline as playground.solidjs.com — plus a small plugin that rewrites bare
 * import specifiers to the self-hosted runtime bundle under /playground/.
 *
 * This module is dynamically imported so the (large) Babel payload only loads
 * on pages that actually render a playground, after hydration.
 */
import * as Babel from '@babel/standalone';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import solidPreset from 'babel-preset-solid';

export interface CompileResult {
  ok: boolean;
  code?: string;
  error?: string;
}

interface ImportNode {
  source?: { value: string } | null;
}

interface BabelPath {
  node: ImportNode;
  buildCodeFrameError(message: string): Error;
}

/** Creates the Babel plugin that maps bare specifiers to runtime bundle URLs. */
function createImportRewriter(moduleMap: Record<string, string>) {
  const rewrite = (path: BabelPath) => {
    const source = path.node.source;
    if (!source) return;
    const specifier = source.value;
    const target = moduleMap[specifier];
    if (target) {
      source.value = target;
      return;
    }
    // Relative/absolute URLs cannot resolve inside a Blob module — reject
    // everything that is not part of the playground runtime.
    throw path.buildCodeFrameError(
      `Cannot import '${specifier}' in the playground. Available modules: ${Object.keys(
        moduleMap
      ).join(', ')}.`
    );
  };
  return {
    visitor: {
      ImportDeclaration: rewrite,
      ExportNamedDeclaration: rewrite,
      ExportAllDeclaration: rewrite,
    },
  };
}

/**
 * Compiles a TSX snippet to a plain ES module whose imports point at the
 * playground runtime. Returns the compiled source or a compile error.
 */
export function compile(source: string, moduleMap: Record<string, string>): CompileResult {
  try {
    const result = Babel.transform(source, {
      filename: 'Demo.tsx',
      presets: [
        [solidPreset, { generate: 'dom', hydratable: false }],
        [Babel.availablePresets['typescript'], { isTSX: true, allExtensions: true }],
      ],
      plugins: [createImportRewriter(moduleMap)],
      sourceMaps: false,
    });
    if (!result?.code) {
      return { ok: false, error: 'Compilation produced no output.' };
    }
    return { ok: true, code: result.code };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
