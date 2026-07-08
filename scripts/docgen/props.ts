/**
 * Prop extraction via the TypeScript Compiler API (already a dependency — no
 * ts-morph needed). Parses a `{Name}Props` interface into structured PropDocs,
 * including JSDoc descriptions and `@default` tags. This mirrors the proven
 * approach in scripts/generate-ai-docs.ts, distilled to just what the manifest
 * needs and fully unit-tested.
 */

import ts from 'typescript';
import type { PropDoc } from './types.js';

/** Flatten a JSDoc comment node (string or node-array) to trimmed text. */
function commentText(
  comment: string | ts.NodeArray<ts.JSDocComment> | undefined
): string | undefined {
  const text = ts.getTextOfJSDocComment(comment);
  return text === undefined ? undefined : text.trim();
}

/** The leading JSDoc description of a member, or '' when absent. */
function descriptionOf(node: ts.Node): string {
  for (const doc of ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc)) {
    const text = commentText(doc.comment);
    if (text !== undefined) return text;
  }
  return '';
}

/** The value of a `@<tag>` JSDoc tag on a member, or undefined. */
function tagValue(node: ts.Node, tag: string): string | undefined {
  const found = ts.getJSDocTags(node).find((t) => t.tagName.text === tag);
  return found === undefined ? undefined : commentText(found.comment);
}

/** Extract every public prop of the named interface from a source string. */
export function extractProps(source: string, interfaceName: string): PropDoc[] {
  const sf = ts.createSourceFile(
    'docgen.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  let iface: ts.InterfaceDeclaration | undefined;
  sf.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) iface = node;
  });
  if (iface === undefined) return [];

  const props: PropDoc[] = [];
  for (const member of iface.members) {
    if (!ts.isPropertySignature(member)) continue;
    const name = member.name.getText(sf);
    const type = member.type !== undefined ? member.type.getText(sf) : 'unknown';
    const defaultValue = tagValue(member, 'default');
    props.push({
      name,
      type,
      required: member.questionToken === undefined,
      description: descriptionOf(member),
      ...(defaultValue !== undefined ? { defaultValue } : {}),
    });
  }
  return props;
}
