import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const StackEditorSchema = S.Struct({
  direction: S.optional(
    S.Literal('horizontal', 'vertical').annotations({
      [AST.DescriptionAnnotationId]:
        'Stack direction. Controls whether children stack vertically or horizontally.',
      [AST.DefaultAnnotationId]: 'vertical',
      [EditorGroupId]: 'Layout',
    })
  ),
  gap: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl').annotations({
      [AST.DescriptionAnnotationId]: 'Spacing between children using SpaceToken.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Layout',
    })
  ),
  align: S.optional(
    S.Literal('start', 'center', 'end', 'stretch').annotations({
      [AST.DescriptionAnnotationId]: 'Cross-axis alignment of children.',
      [AST.DefaultAnnotationId]: 'stretch',
      [EditorGroupId]: 'Layout',
    })
  ),
  justify: S.optional(
    S.Literal('start', 'center', 'end', 'between', 'around').annotations({
      [AST.DescriptionAnnotationId]: 'Main-axis justification of children.',
      [AST.DefaultAnnotationId]: 'start',
      [EditorGroupId]: 'Layout',
    })
  ),
});
