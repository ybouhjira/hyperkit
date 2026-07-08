import { describe, it, expect } from 'vitest';
import { Schema as S } from 'effect';
import { ui, extractBlueprint, UI_ANNOTATION_ID } from './annotation';
import type { BlueprintAnnotation } from './types';

describe('ui', () => {
  it('adds UI annotation to a schema field', () => {
    const annotated = S.String.pipe(ui('title', 1, { label: 'Title' }));
    const annotation = annotated.ast.annotations[UI_ANNOTATION_ID] as BlueprintAnnotation;

    expect(annotation).toBeDefined();
    expect(annotation.kind).toBe('title');
    expect(annotation.priority).toBe(1);
    expect(annotation.label).toBe('Title');
  });

  it('works without optional label', () => {
    const annotated = S.String.pipe(ui('status', 3));
    const annotation = annotated.ast.annotations[UI_ANNOTATION_ID] as BlueprintAnnotation;

    expect(annotation.kind).toBe('status');
    expect(annotation.priority).toBe(3);
    expect(annotation.label).toBeUndefined();
  });

  it('preserves inline option', () => {
    const annotated = S.String.pipe(ui('title', 1, { label: 'Title', inline: ['subtitle'] }));
    const annotation = annotated.ast.annotations[UI_ANNOTATION_ID] as BlueprintAnnotation;

    expect(annotation.inline).toEqual(['subtitle']);
  });

  it('preserves the schema type', () => {
    const original = S.String;
    const annotated = original.pipe(ui('title', 1));

    // Should still decode/encode correctly
    const decode = S.decodeUnknownSync(annotated);
    expect(decode('hello')).toBe('hello');
  });
});

describe('extractBlueprint', () => {
  const TestSchema = S.Struct({
    id: S.String.pipe(ui('identifier', 1, { label: 'ID' })),
    title: S.String.pipe(ui('title', 2, { label: 'Title' })),
    status: S.Literal('open', 'closed').pipe(ui('status', 3, { label: 'Status' })),
    description: S.String.pipe(ui('content', 5, { label: 'Description' })),
    count: S.Number.pipe(ui('metric', 4, { label: 'Count' })),
    // Field without UI annotation — should be excluded
    internalFlag: S.Boolean,
  });

  it('extracts all annotated fields', () => {
    const fields = extractBlueprint(TestSchema);
    expect(fields).toHaveLength(5);
  });

  it('excludes non-annotated fields', () => {
    const fields = extractBlueprint(TestSchema);
    const names = fields.map(f => f.name);
    expect(names).not.toContain('internalFlag');
  });

  it('returns fields sorted by priority', () => {
    const fields = extractBlueprint(TestSchema);
    const priorities = fields.map(f => f.annotation.priority);
    expect(priorities).toEqual([1, 2, 3, 4, 5]);
  });

  it('preserves field names', () => {
    const fields = extractBlueprint(TestSchema);
    const names = fields.map(f => f.name);
    expect(names).toEqual(['id', 'title', 'status', 'count', 'description']);
  });

  it('preserves annotation data', () => {
    const fields = extractBlueprint(TestSchema);
    const titleField = fields.find(f => f.name === 'title');
    expect(titleField?.annotation.kind).toBe('title');
    expect(titleField?.annotation.label).toBe('Title');
  });

  it('detects optional fields', () => {
    const SchemaWithOptional = S.Struct({
      name: S.String.pipe(ui('title', 1)),
      nickname: S.optional(S.String.pipe(ui('subtitle', 2))),
    });
    const fields = extractBlueprint(SchemaWithOptional);
    const nicknameField = fields.find(f => f.name === 'nickname');
    expect(nicknameField?.isOptional).toBe(true);
  });

  it('returns empty array for schema with no annotations', () => {
    const PlainSchema = S.Struct({ a: S.String, b: S.Number });
    const fields = extractBlueprint(PlainSchema);
    expect(fields).toHaveLength(0);
  });

  it('includes AST node for each field', () => {
    const fields = extractBlueprint(TestSchema);
    for (const field of fields) {
      expect(field.ast).toBeDefined();
    }
  });
});
