import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const SegmentedControlEditorSchema = S.Struct({
  value: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Controlled selected value.',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'State',
    })
  ),
  defaultValue: S.optional(
    S.String.annotations({
      [AST.DescriptionAnnotationId]: 'Initial selected value for uncontrolled mode.',
      [EditorControlId]: 'text',
      [EditorGroupId]: 'State',
    })
  ),
  disabled: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Disable all options.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'State',
    })
  ),
  size: S.optional(
    S.Literal('sm', 'md', 'lg').annotations({
      [AST.DescriptionAnnotationId]: 'Size variant.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Appearance',
    })
  ),
  fullWidth: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Stretch to fill the full width of the container.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Appearance',
    })
  ),
});
