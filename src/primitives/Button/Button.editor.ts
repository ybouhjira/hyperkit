import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const ButtonEditorSchema = S.Struct({
  variant: S.optional(
    S.Literal('primary', 'secondary', 'ghost', 'danger', 'outline', 'link').annotations({
      [AST.DescriptionAnnotationId]:
        'Visual style variant. Affects background, border, and text color.',
      [AST.DefaultAnnotationId]: 'primary',
      [EditorGroupId]: 'Appearance',
    })
  ),
  size: S.optional(
    S.Literal('sm', 'md', 'lg').annotations({
      [AST.DescriptionAnnotationId]: 'Size variant. Controls padding and font size.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Appearance',
    })
  ),
  disabled: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Disable button interaction.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  loading: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Show loading spinner and disable interaction.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  fullWidth: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Expand button to full width of container.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Layout',
    })
  ),
  rounded: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Apply pill shape with fully rounded corners.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Appearance',
    })
  ),
});
