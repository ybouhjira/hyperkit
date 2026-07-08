/**
 * Blueprint schema annotation utilities for hyperkit-views.
 *
 * Provides tools for annotating Effect Schema fields with UI metadata
 * and extracting those annotations for rendering.
 */

import { Schema as S, SchemaAST as AST, Option } from 'effect';
import type { Kind, BlueprintAnnotation } from './types';

/** Symbol key for hyperkit-views UI annotations on Effect Schema AST nodes */
export const UI_ANNOTATION_ID: unique symbol = Symbol.for('hyperkit-views/annotation/UI');

/**
 * Annotate an Effect Schema field with UI metadata.
 * Returns a schema transformer compatible with `.pipe()`.
 *
 * @example
 * ```ts
 * const IssueSchema = S.Struct({
 *   title: S.String.pipe(ui('title', 1, { label: 'Title' })),
 *   status: S.Literal('open', 'closed').pipe(ui('status', 2)),
 * });
 * ```
 */
export const ui = (
  kind: Kind,
  priority: number,
  opts?: { readonly label?: string; readonly inline?: readonly string[] }
) =>
  <A, I, R>(schema: S.Schema<A, I, R>): S.Schema<A, I, R> => {
    const annotation: BlueprintAnnotation = {
      kind,
      priority,
      ...opts,
    };
    return schema.annotations({ [UI_ANNOTATION_ID]: annotation });
  };

/** Extracted field info from a blueprint schema */
export interface BlueprintField {
  /** Field name in the schema */
  readonly name: string;
  /** UI annotation attached to this field */
  readonly annotation: BlueprintAnnotation;
  /** The field's AST node (for type introspection) */
  readonly ast: AST.AST;
  /** Whether the field is optional */
  readonly isOptional: boolean;
}

/**
 * Extract all UI-annotated fields from an Effect Schema.
 * Returns fields sorted by priority (ascending).
 *
 * @example
 * ```ts
 * const fields = extractBlueprint(IssueSchema);
 * // [{ name: 'title', annotation: { kind: 'title', priority: 1, ... }, ... }, ...]
 * ```
 */
/**
 * Get the type to check for annotations.
 * For optional fields (S.optional), the annotation is on the first type in the Union.
 * For other Unions (like S.Literal('a', 'b')), the annotation is on the Union itself.
 */
const getAnnotatedType = (ps: any): AST.AST => {
  if (ps.isOptional && ps.type._tag === 'Union') {
    // For optional fields, the annotation is on the first type in the union
    return ps.type.types[0];
  }
  return ps.type;
};

export const extractBlueprint = <A, I, R>(
  schema: S.Schema<A, I, R>
): ReadonlyArray<BlueprintField> => {
  const propertySignatures = AST.getPropertySignatures(schema.ast);
  const fields: BlueprintField[] = [];

  for (const ps of propertySignatures) {
    // Get the correct type to check for annotations
    const typeToCheck = getAnnotatedType(ps);
    const annotation = AST.getAnnotation(UI_ANNOTATION_ID)(typeToCheck);

    if (Option.isSome(annotation)) {
      fields.push({
        name: String(ps.name),
        annotation: annotation.value as BlueprintAnnotation,
        ast: typeToCheck,
        isOptional: ps.isOptional,
      });
    }
  }

  // Sort by priority ascending
  fields.sort((a, b) => a.annotation.priority - b.annotation.priority);
  return fields;
};
