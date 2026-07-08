import * as AST from 'effect/SchemaAST';
import { Option } from 'effect';
import type { Schema } from 'effect';

import { EditorControlId, EditorGroupId, EditorHiddenId } from './types.js';
import type { EditorControl, PropDescriptor } from './types.js';

export function introspectSchema(schema: Schema.Schema.AnyNoContext): PropDescriptor[] {
  const ast = schema.ast;
  if (ast._tag !== 'TypeLiteral') return [];

  const descriptors: PropDescriptor[] = [];

  for (const prop of ast.propertySignatures) {
    if (typeof prop.name !== 'string') continue;

    const { type: propType, isOptional } = prop;
    const inner = unwrapOptional(propType);
    const descriptor = buildDescriptor(prop.name, inner, !isOptional);
    descriptors.push(descriptor);
  }

  return descriptors
    .filter((d) => !d.hidden)
    .sort((a, b) => {
      const ga = a.group ?? '';
      const gb = b.group ?? '';
      if (ga !== gb) return ga.localeCompare(gb);
      return a.name.localeCompare(b.name);
    });
}

function unwrapOptional(ast: AST.AST): AST.AST {
  if (ast._tag === 'Union') {
    const nonUndef = ast.types.filter((t) => t._tag !== 'UndefinedKeyword');
    if (nonUndef.length === 1 && nonUndef.length < ast.types.length) {
      // nonUndef.length === 1 is checked above, so index 0 is guaranteed to exist
      const first = nonUndef[0];
      if (first !== undefined) return first;
    }
  }
  return ast;
}

function buildDescriptor(name: string, ast: AST.AST, required: boolean): PropDescriptor {
  const desc: PropDescriptor = {
    name,
    type: resolveType(ast),
    required,
  };

  // Extract enum options
  if (ast._tag === 'Union') {
    const literals = ast.types.filter((t): t is AST.Literal => t._tag === 'Literal');
    if (literals.length === ast.types.length && literals.length > 0) {
      desc.type = 'enum';
      desc.options = literals.map((l) => l.literal as string | number | boolean);
    }
  }

  // Read annotations
  const description = Option.getOrUndefined(
    AST.getAnnotation<string>(ast, AST.DescriptionAnnotationId)
  );
  if (description) desc.description = description;

  const defaultVal = Option.getOrUndefined(
    AST.getAnnotation<unknown>(ast, AST.DefaultAnnotationId)
  );
  if (defaultVal !== undefined) desc.default = defaultVal;

  const control = Option.getOrUndefined(AST.getAnnotation<EditorControl>(ast, EditorControlId));
  if (control) desc.control = control;

  const group = Option.getOrUndefined(AST.getAnnotation<string>(ast, EditorGroupId));
  if (group) desc.group = group;

  const hidden = Option.getOrUndefined(AST.getAnnotation<boolean>(ast, EditorHiddenId));
  if (hidden) desc.hidden = hidden;

  return desc;
}

function resolveType(ast: AST.AST): PropDescriptor['type'] {
  switch (ast._tag) {
    case 'StringKeyword':
      return 'string';
    case 'NumberKeyword':
      return 'number';
    case 'BooleanKeyword':
      return 'boolean';
    case 'Union':
      return 'enum'; // will be refined in buildDescriptor
    default:
      return 'unknown';
  }
}
