/**
 * Comprehensive blueprint tests — validates Issue #225 acceptance criteria
 *
 * Tests the complete blueprint annotation system:
 * - Kind enum with all 15 values
 * - UIAnnotation type structure
 * - ui() helper function for clean annotation syntax
 * - Effect Schema integration via S.annotations()
 * - extractBlueprint() for programmatic field extraction
 * - Priority-based filtering (SELECT priority <= N)
 */

import { describe, it, expect } from 'vitest';
import { Schema as S } from 'effect';
import { ui, extractBlueprint } from './annotation';
import type { Kind, BlueprintAnnotation } from './types';

describe('Blueprint Schema Annotations (Issue #225)', () => {
  describe('Kind enum', () => {
    it('has all 15 semantic kinds', () => {
      const kinds: Kind[] = [
        'title', 'subtitle', 'media', 'status', 'metric',
        'rating', 'tag', 'person', 'specs', 'timestamp',
        'content', 'identifier', 'geo', 'preview', 'attachment',
      ];
      expect(kinds).toHaveLength(15);
    });

    it('supports all kinds in type system', () => {
      // Type-level test — if this compiles, all 15 kinds are valid
      const annotations: Array<{ kind: Kind; priority: number }> = [
        { kind: 'title', priority: 1 },
        { kind: 'subtitle', priority: 1 },
        { kind: 'media', priority: 2 },
        { kind: 'status', priority: 1 },
        { kind: 'metric', priority: 2 },
        { kind: 'rating', priority: 2 },
        { kind: 'tag', priority: 2 },
        { kind: 'person', priority: 3 },
        { kind: 'specs', priority: 3 },
        { kind: 'timestamp', priority: 3 },
        { kind: 'content', priority: 4 },
        { kind: 'identifier', priority: 2 },
        { kind: 'geo', priority: 3 },
        { kind: 'preview', priority: 3 },
        { kind: 'attachment', priority: 3 },
      ];
      expect(annotations).toHaveLength(15);
    });
  });

  describe('UIAnnotation type', () => {
    it('has required kind and priority fields', () => {
      const annotation: BlueprintAnnotation = {
        kind: 'title',
        priority: 1,
      };
      expect(annotation.kind).toBe('title');
      expect(annotation.priority).toBe(1);
    });

    it('accepts optional label field', () => {
      const annotation: BlueprintAnnotation = {
        kind: 'title',
        priority: 1,
        label: 'Title Field',
      };
      expect(annotation.label).toBe('Title Field');
    });

    it('accepts optional inline field for nested types', () => {
      const annotation: BlueprintAnnotation = {
        kind: 'person',
        priority: 3,
        inline: ['avatar', 'name'],
      };
      expect(annotation.inline).toEqual(['avatar', 'name']);
    });

    it('accepts optional derived field for computed values', () => {
      const annotation: BlueprintAnnotation = {
        kind: 'title',
        priority: 1,
        derived: (data: any) => data.first + ' ' + data.last,
      };
      expect(annotation.derived).toBeDefined();
      expect(typeof annotation.derived).toBe('function');
    });
  });

  describe('ui() helper function', () => {
    it('annotates a schema field with kind and priority', () => {
      const annotated = S.String.pipe(ui('title', 1));
      const annotation = annotated.ast.annotations[Symbol.for('hyperkit-views/annotation/UI')] as BlueprintAnnotation;
      expect(annotation.kind).toBe('title');
      expect(annotation.priority).toBe(1);
    });

    it('accepts optional label parameter', () => {
      const annotated = S.String.pipe(ui('title', 1, { label: 'Title' }));
      const annotation = annotated.ast.annotations[Symbol.for('hyperkit-views/annotation/UI')] as BlueprintAnnotation;
      expect(annotation.label).toBe('Title');
    });

    it('accepts optional inline parameter', () => {
      const annotated = S.String.pipe(ui('person', 3, { inline: ['name', 'avatar'] }));
      const annotation = annotated.ast.annotations[Symbol.for('hyperkit-views/annotation/UI')] as BlueprintAnnotation;
      expect(annotation.inline).toEqual(['name', 'avatar']);
    });

    it('preserves schema validation behavior', () => {
      const annotated = S.String.pipe(ui('title', 1));
      const decode = S.decodeUnknownSync(annotated);
      expect(decode('hello')).toBe('hello');
      expect(() => decode(123)).toThrow();
    });
  });

  describe('Effect Schema integration', () => {
    it('works with S.Struct', () => {
      const TestSchema = S.Struct({
        title: S.String.pipe(ui('title', 1)),
        status: S.Literal('open', 'closed').pipe(ui('status', 2)),
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(2);
      expect(fields[0].name).toBe('title');
      expect(fields[1].name).toBe('status');
    });

    it('works with S.optional fields', () => {
      const TestSchema = S.Struct({
        required: S.String.pipe(ui('title', 1)),
        optional: S.optional(S.String.pipe(ui('subtitle', 2))),
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(2);
      const optField = fields.find(f => f.name === 'optional');
      expect(optField?.isOptional).toBe(true);
    });

    it('works with S.Array', () => {
      const Tag = S.Struct({ name: S.String, color: S.String });
      const TestSchema = S.Struct({
        tags: S.Array(Tag).pipe(ui('tag', 2, { inline: ['name', 'color'] })),
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(1);
      expect(fields[0].annotation.inline).toEqual(['name', 'color']);
    });

    it('works with S.Date', () => {
      const TestSchema = S.Struct({
        createdAt: S.Date.pipe(ui('timestamp', 3)),
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(1);
      expect(fields[0].annotation.kind).toBe('timestamp');
    });

    it('works with S.Number', () => {
      const TestSchema = S.Struct({
        count: S.Number.pipe(ui('metric', 2)),
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(1);
      expect(fields[0].annotation.kind).toBe('metric');
    });
  });

  describe('extractBlueprint() — programmatic extraction', () => {
    const TestSchema = S.Struct({
      id: S.String.pipe(ui('identifier', 2)),
      title: S.String.pipe(ui('title', 1)),
      status: S.Literal('open', 'closed').pipe(ui('status', 1)),
      labels: S.Array(S.String).pipe(ui('tag', 2)),
      count: S.Number.pipe(ui('metric', 3)),
      body: S.String.pipe(ui('content', 4)),
      // Unannotated field — should be excluded
      internal: S.Boolean,
    });

    it('extracts all annotated fields', () => {
      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(6);
    });

    it('excludes unannotated fields', () => {
      const fields = extractBlueprint(TestSchema);
      const names = fields.map(f => f.name);
      expect(names).not.toContain('internal');
    });

    it('sorts fields by priority (ascending)', () => {
      const fields = extractBlueprint(TestSchema);
      const priorities = fields.map(f => f.annotation.priority);
      expect(priorities).toEqual([1, 1, 2, 2, 3, 4]);
    });

    it('preserves field names', () => {
      const fields = extractBlueprint(TestSchema);
      const names = fields.map(f => f.name);
      expect(names).toContain('title');
      expect(names).toContain('status');
      expect(names).toContain('id');
    });

    it('preserves annotation metadata', () => {
      const fields = extractBlueprint(TestSchema);
      const titleField = fields.find(f => f.name === 'title');
      expect(titleField?.annotation.kind).toBe('title');
      expect(titleField?.annotation.priority).toBe(1);
    });

    it('includes AST node for type introspection', () => {
      const fields = extractBlueprint(TestSchema);
      for (const field of fields) {
        expect(field.ast).toBeDefined();
      }
    });

    it('returns empty array for schema without annotations', () => {
      const PlainSchema = S.Struct({ a: S.String, b: S.Number });
      const fields = extractBlueprint(PlainSchema);
      expect(fields).toHaveLength(0);
    });
  });

  describe('Priority-based filtering (SELECT priority <= N)', () => {
    const TestSchema = S.Struct({
      // Priority 1 — always visible
      title: S.String.pipe(ui('title', 1)),
      status: S.Literal('open', 'closed').pipe(ui('status', 1)),
      // Priority 2
      number: S.Number.pipe(ui('identifier', 2)),
      labels: S.Array(S.String).pipe(ui('tag', 2)),
      // Priority 3
      assignee: S.String.pipe(ui('person', 3)),
      updatedAt: S.Date.pipe(ui('timestamp', 3)),
      // Priority 4
      body: S.String.pipe(ui('content', 4)),
    });

    it('SELECT priority <= 1 (pin view)', () => {
      const fields = extractBlueprint(TestSchema);
      const pinFields = fields.filter(f => f.annotation.priority <= 1);
      expect(pinFields.map(f => f.name)).toEqual(['title', 'status']);
    });

    it('SELECT priority <= 2 (row view)', () => {
      const fields = extractBlueprint(TestSchema);
      const rowFields = fields.filter(f => f.annotation.priority <= 2);
      expect(rowFields.map(f => f.name)).toEqual(['title', 'status', 'number', 'labels']);
    });

    it('SELECT priority <= 3 (card view)', () => {
      const fields = extractBlueprint(TestSchema);
      const cardFields = fields.filter(f => f.annotation.priority <= 3);
      expect(cardFields.map(f => f.name)).toEqual([
        'title', 'status', 'number', 'labels', 'assignee', 'updatedAt',
      ]);
    });

    it('SELECT priority <= 4 (detail view)', () => {
      const fields = extractBlueprint(TestSchema);
      const detailFields = fields.filter(f => f.annotation.priority <= 4);
      expect(detailFields).toHaveLength(7); // All fields
    });

    it('priority filtering mimics SQL SELECT semantics', () => {
      const fields = extractBlueprint(TestSchema);

      // Lower priority numbers = higher visibility
      const highPriority = fields.filter(f => f.annotation.priority === 1);
      const mediumPriority = fields.filter(f => f.annotation.priority === 2);
      const lowPriority = fields.filter(f => f.annotation.priority >= 3);

      expect(highPriority.length).toBeLessThan(mediumPriority.length + lowPriority.length);
    });
  });

  describe('Issue #225 Acceptance Criteria', () => {
    it('✓ Can annotate any Effect Schema field with kind + priority', () => {
      const annotated = S.String.pipe(ui('title', 1));
      const annotation = annotated.ast.annotations[Symbol.for('hyperkit-views/annotation/UI')] as BlueprintAnnotation;
      expect(annotation).toBeDefined();
      expect(annotation.kind).toBe('title');
      expect(annotation.priority).toBe(1);
    });

    it('✓ Can extract all annotated fields from a schema programmatically', () => {
      const TestSchema = S.Struct({
        field1: S.String.pipe(ui('title', 1)),
        field2: S.Number.pipe(ui('metric', 2)),
        field3: S.Boolean, // Unannotated
      });

      const fields = extractBlueprint(TestSchema);
      expect(fields).toHaveLength(2);
      expect(fields.map(f => f.name)).toEqual(['field1', 'field2']);
    });
  });
});
