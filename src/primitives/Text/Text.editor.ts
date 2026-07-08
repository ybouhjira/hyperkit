import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const TextEditorSchema = S.Struct({
  size: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl').annotations({
      [AST.DescriptionAnnotationId]: 'Font size token. Maps to theme typography scale.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Appearance',
    })
  ),
  weight: S.optional(
    S.Literal('light', 'normal', 'medium', 'semibold', 'bold').annotations({
      [AST.DescriptionAnnotationId]: 'Font weight variant.',
      [AST.DefaultAnnotationId]: 'normal',
      [EditorGroupId]: 'Appearance',
    })
  ),
  color: S.optional(
    S.Literal('primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error').annotations(
      {
        [AST.DescriptionAnnotationId]: 'Text color token. Maps to theme color variables.',
        [AST.DefaultAnnotationId]: 'primary',
        [EditorGroupId]: 'Appearance',
      }
    )
  ),
  align: S.optional(
    S.Literal('left', 'center', 'right').annotations({
      [AST.DescriptionAnnotationId]: 'Text alignment.',
      [AST.DefaultAnnotationId]: 'left',
      [EditorGroupId]: 'Layout',
    })
  ),
  truncate: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Truncate text with ellipsis on overflow.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Content',
    })
  ),
  lineClamp: S.optional(
    S.Number.annotations({
      [AST.DescriptionAnnotationId]: 'Limit text to specified number of lines with ellipsis.',
      [EditorControlId]: 'number',
      [EditorGroupId]: 'Content',
    })
  ),
  as: S.optional(
    S.Literal('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'div').annotations({
      [AST.DescriptionAnnotationId]: 'HTML element to render as.',
      [AST.DefaultAnnotationId]: 'span',
      [EditorGroupId]: 'Layout',
    })
  ),
});
