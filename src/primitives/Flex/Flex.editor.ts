import { Schema as S } from 'effect';
import * as AST from 'effect/SchemaAST';
import { EditorGroupId } from '../../editor/types.js';

export const FlexEditorSchema = S.Struct({
  direction: S.optional(
    S.Literal('row', 'column', 'row-reverse', 'column-reverse').annotations({
      [AST.DescriptionAnnotationId]: 'Flex direction. Controls main axis orientation.',
      [AST.DefaultAnnotationId]: 'row',
      [EditorGroupId]: 'Layout',
    })
  ),
  align: S.optional(
    S.Literal('start', 'center', 'end', 'stretch', 'baseline').annotations({
      [AST.DescriptionAnnotationId]: 'Align items along cross axis.',
      [EditorGroupId]: 'Layout',
    })
  ),
  justify: S.optional(
    S.Literal('start', 'center', 'end', 'between', 'around', 'evenly').annotations({
      [AST.DescriptionAnnotationId]: 'Justify content along main axis.',
      [EditorGroupId]: 'Layout',
    })
  ),
  gap: S.optional(
    S.Literal('0', 'px', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl').annotations({
      [AST.DescriptionAnnotationId]: 'Gap between flex children. Uses spacing token.',
      [EditorGroupId]: 'Layout',
    })
  ),
  wrap: S.optional(
    S.Literal('nowrap', 'wrap', 'wrap-reverse').annotations({
      [AST.DescriptionAnnotationId]: 'Flex wrap behavior.',
      [AST.DefaultAnnotationId]: 'nowrap',
      [EditorGroupId]: 'Layout',
    })
  ),
  inline: S.optional(
    S.Boolean.annotations({
      [AST.DescriptionAnnotationId]: 'Use inline-flex instead of flex display.',
      [AST.DefaultAnnotationId]: false,
      [EditorGroupId]: 'Layout',
    })
  ),
});
