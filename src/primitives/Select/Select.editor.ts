import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const SelectEditorSchema = S.Struct({
  placeholder: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Placeholder text shown when no option is selected.',
      [AST.DefaultAnnotationId]: 'Select...',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'Content',
    })
  ),
  disabled: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Whether the select is disabled.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
});
