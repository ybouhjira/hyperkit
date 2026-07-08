import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const CardEditorSchema = S.Struct({
  variant: S.optional(
    S.Literal('default', 'outlined', 'elevated').annotations({
      [AST.DescriptionAnnotationId]:
        'Visual style variant. Affects border, shadow, and background.',
      [AST.DefaultAnnotationId]: 'default',
      [EditorGroupId]: 'Appearance',
    })
  ),
  borderColor: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]:
        'Accent border colour — a --sk-* token reference or CSS color. Threads into --sk-card-border.',
      [EditorGroupId]: 'Appearance',
    })
  ),
  padding: S.optional(
    S.Literal('none', 'sm', 'md', 'lg').annotations({
      [AST.DescriptionAnnotationId]: 'Padding size for card content.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Layout',
    })
  ),
  hoverable: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Enable hover effect without click handler.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
});
