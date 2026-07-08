import { describe, it, expect } from 'vitest';
import type { Kind, Shape, Intent, FieldState, BlueprintAnnotation, SolidkitViewsConfig } from './types';

describe('types', () => {
  it('Kind accepts all 15 values', () => {
    const kinds: Kind[] = [
      'title', 'subtitle', 'media', 'status', 'metric',
      'rating', 'tag', 'person', 'specs', 'timestamp',
      'content', 'identifier', 'geo', 'preview', 'attachment',
    ];
    expect(kinds).toHaveLength(15);
  });

  it('Shape accepts all 8 values', () => {
    const shapes: Shape[] = [
      'detail', 'card', 'row', 'table',
      'board', 'timeline', 'pin', 'compact-card',
    ];
    expect(shapes).toHaveLength(8);
  });

  it('Intent accepts all 3 values', () => {
    const intents: Intent[] = ['browse', 'edit', 'pick'];
    expect(intents).toHaveLength(3);
  });

  it('FieldState accepts all variants', () => {
    const states: FieldState[] = [
      false,
      'disabled',
      'readonly',
      (value: unknown) => value,
    ];
    expect(states).toHaveLength(4);
  });

  it('BlueprintAnnotation has required fields', () => {
    const annotation: BlueprintAnnotation = {
      kind: 'title',
      priority: 1,
    };
    expect(annotation.kind).toBe('title');
    expect(annotation.priority).toBe(1);
  });

  it('BlueprintAnnotation accepts optional label', () => {
    const annotation: BlueprintAnnotation = {
      kind: 'title',
      priority: 1,
      label: 'Title',
    };
    expect(annotation.label).toBe('Title');
  });

  it('SolidkitViewsConfig has required fields', () => {
    const config: SolidkitViewsConfig = {
      blueprints: 'src/blueprints/**/*.ts',
      output: 'src/generated/',
      viewKit: './viewkit.ts',
    };
    expect(config.blueprints).toBe('src/blueprints/**/*.ts');
  });
});
