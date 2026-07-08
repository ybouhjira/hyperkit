import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId, EditorControlId } from '../../editor/types.js';

export const GridEditorSchema = S.Struct({
  columns: S.optional(
    S.Number.annotations({
      [AST.DescriptionAnnotationId]: 'Number of columns (1-12). Creates equal 1fr columns.',
      [AST.DefaultAnnotationId]: 2,
      [EditorControlId]: 'slider',
      [EditorGroupId]: 'Layout',
    })
  ),
  gap: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl').annotations({
      [AST.DescriptionAnnotationId]: 'Gap between both rows and columns using SpaceToken.',
      [AST.DefaultAnnotationId]: 'md',
      [EditorGroupId]: 'Layout',
    })
  ),
  rowGap: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl').annotations({
      [AST.DescriptionAnnotationId]: 'Gap between rows using SpaceToken.',
      [EditorGroupId]: 'Layout',
    })
  ),
  columnGap: S.optional(
    S.Literal('xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl').annotations({
      [AST.DescriptionAnnotationId]: 'Gap between columns using SpaceToken.',
      [EditorGroupId]: 'Layout',
    })
  ),
  placeItems: S.optional(
    S.Literal('start', 'center', 'end', 'stretch').annotations({
      [AST.DescriptionAnnotationId]: 'Alignment of items along both axes.',
      [AST.DefaultAnnotationId]: 'stretch',
      [EditorGroupId]: 'Layout',
    })
  ),
  autoFlow: S.optional(
    S.Literal('row', 'column', 'dense').annotations({
      [AST.DescriptionAnnotationId]: 'Direction of auto-placement for grid items.',
      [AST.DefaultAnnotationId]: 'row',
      [EditorGroupId]: 'Layout',
    })
  ),
});
