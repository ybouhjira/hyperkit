import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorControlId, EditorGroupId } from '../../editor/types.js';

export const InputEditorSchema = S.Struct({
  type: S.optional(
    S.Literal('text', 'email', 'password', 'search', 'url').annotations({
      [AST.DescriptionAnnotationId]: 'Input type variant.',
      [AST.DefaultAnnotationId]: 'text',
      [EditorGroupId]: 'Appearance',
    })
  ),
  placeholder: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Placeholder text displayed when input is empty.',
      [AST.DefaultAnnotationId]: 'Type here...',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'Content',
    })
  ),
  disabled: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Whether the input is disabled.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  error: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Error message displayed below the input.',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'State',
    })
  ),
});
