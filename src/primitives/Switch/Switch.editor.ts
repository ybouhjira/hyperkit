import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const SwitchEditorSchema = S.Struct({
  checked: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Controlled checked state.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  disabled: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Disable the switch.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  size: S.optional(
    S.Literal('sm', 'md').annotations({
      [AST.DescriptionAnnotationId]: 'Size preset.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Appearance',
    })
  ),
  label: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Label text displayed next to the switch.',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'Content',
    })
  ),
  description: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Description text displayed below the label.',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'Content',
    })
  ),
});
