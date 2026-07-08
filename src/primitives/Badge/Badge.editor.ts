import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const BadgeEditorSchema = S.Struct({
  variant: S.optional(
    S.Literal('default', 'success', 'warning', 'danger', 'info').annotations({
      [AST.DescriptionAnnotationId]: 'Color variant for the badge.',
      [AST.DefaultAnnotationId]: 'default',
      [EditorGroupId]: 'Appearance',
    })
  ),
  type: S.optional(
    S.Literal('label', 'dot', 'count').annotations({
      [AST.DescriptionAnnotationId]: 'Badge display type.',
      [AST.DefaultAnnotationId]: 'label',
      [EditorGroupId]: 'Appearance',
    })
  ),
  count: S.optional(
    S.Number.annotations({
      [AST.DescriptionAnnotationId]: 'Numeric count to display when type is count.',
      [EditorGroupId]: 'Content',
    })
  ),
  maxCount: S.optional(
    S.Number.annotations({
      [AST.DescriptionAnnotationId]: 'Maximum count value before showing plus sign.',
      [AST.DefaultAnnotationId]: 99,
      [EditorGroupId]: 'Content',
    })
  ),
});
