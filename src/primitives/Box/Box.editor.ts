import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const BoxEditorSchema = S.Struct({
  p: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Padding on all sides.',
      [EditorGroupId]: 'Layout',
    })
  ),
  px: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Horizontal padding (left and right).',
      [EditorGroupId]: 'Layout',
    })
  ),
  py: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Vertical padding (top and bottom).',
      [EditorGroupId]: 'Layout',
    })
  ),
  m: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Margin on all sides.',
      [EditorGroupId]: 'Layout',
    })
  ),
  mx: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Horizontal margin (left and right).',
      [EditorGroupId]: 'Layout',
    })
  ),
  my: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'none').annotations({
      [AST.DescriptionAnnotationId]: 'Vertical margin (top and bottom).',
      [EditorGroupId]: 'Layout',
    })
  ),
  display: S.optional(
    S.Literal('block', 'flex', 'grid', 'inline', 'inline-flex', 'inline-block', 'none').annotations(
      {
        [AST.DescriptionAnnotationId]: 'Display type.',
        [AST.DefaultAnnotationId]: 'block',
        [EditorGroupId]: 'Layout',
      }
    )
  ),
  bg: S.optional(
    S.Literal(
      'primary',
      'secondary',
      'tertiary',
      'accent',
      'success',
      'warning',
      'error',
      'info'
    ).annotations({
      [AST.DescriptionAnnotationId]: 'Background color token. Maps to theme CSS variables.',
      [EditorGroupId]: 'Appearance',
    })
  ),
  color: S.optional(
    S.Literal('primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error').annotations(
      {
        [AST.DescriptionAnnotationId]: 'Text color token. Maps to theme CSS variables.',
        [EditorGroupId]: 'Appearance',
      }
    )
  ),
  borderRadius: S.optional(
    S.Literal('sm', 'md', 'lg', 'xl', 'full').annotations({
      [AST.DescriptionAnnotationId]: 'Border radius token. Maps to theme CSS variables.',
      [EditorGroupId]: 'Appearance',
    })
  ),
  border: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Enable border on all sides.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Appearance',
    })
  ),
  shadow: S.optional(
    S.Literal('sm', 'md', 'lg', 'xl').annotations({
      [AST.DescriptionAnnotationId]: 'Box shadow token. Maps to theme CSS variables.',
      [EditorGroupId]: 'Appearance',
    })
  ),
  overflow: S.optional(
    S.Literal('hidden', 'auto', 'scroll', 'visible').annotations({
      [AST.DescriptionAnnotationId]: 'Overflow behavior.',
      [AST.DefaultAnnotationId]: 'visible',
      [EditorGroupId]: 'Layout',
    })
  ),
  position: S.optional(
    S.Literal('relative', 'absolute', 'fixed', 'sticky').annotations({
      [AST.DescriptionAnnotationId]: 'CSS position property.',
      [EditorGroupId]: 'Layout',
    })
  ),
  cursor: S.optional(
    S.Literal('pointer', 'default', 'grab', 'not-allowed').annotations({
      [AST.DescriptionAnnotationId]: 'Cursor style.',
      [AST.DefaultAnnotationId]: 'default',
      [EditorGroupId]: 'State',
    })
  ),
  as: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'HTML element to render as.',
      [AST.DefaultAnnotationId]: 'div',
      [EditorGroupId]: 'Layout',
    })
  ),
});
