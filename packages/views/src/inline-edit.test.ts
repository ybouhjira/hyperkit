import { describe, it, expect } from 'vitest';
import {
  detectEditorType,
  createEditState,
  startEditing,
  updateFieldValue,
  commitField,
  cancelField,
  getChanges,
  hasFieldError,
  hasErrors,
  editFieldClass,
  discardAll,
  type EditState,
} from './inline-edit';

describe('detectEditorType', () => {
  it('maps "number" to "number"', () => {
    expect(detectEditorType('number')).toBe('number');
    expect(detectEditorType('Number')).toBe('number');
    expect(detectEditorType('NUMBER')).toBe('number');
  });

  it('maps "integer" to "number"', () => {
    expect(detectEditorType('integer')).toBe('number');
    expect(detectEditorType('Integer')).toBe('number');
  });

  it('maps "float" to "number"', () => {
    expect(detectEditorType('float')).toBe('number');
    expect(detectEditorType('Float')).toBe('number');
  });

  it('maps "boolean" to "boolean"', () => {
    expect(detectEditorType('boolean')).toBe('boolean');
    expect(detectEditorType('Boolean')).toBe('boolean');
    expect(detectEditorType('bool')).toBe('boolean');
    expect(detectEditorType('Bool')).toBe('boolean');
  });

  it('maps "date" to "date"', () => {
    expect(detectEditorType('date')).toBe('date');
    expect(detectEditorType('Date')).toBe('date');
    expect(detectEditorType('datetime')).toBe('date');
    expect(detectEditorType('DateTime')).toBe('date');
    expect(detectEditorType('timestamp')).toBe('date');
  });

  it('maps "enum" to "select"', () => {
    expect(detectEditorType('enum')).toBe('select');
    expect(detectEditorType('Enum')).toBe('select');
    expect(detectEditorType('select')).toBe('select');
    expect(detectEditorType('Select')).toBe('select');
  });

  it('maps "tags" to "tags"', () => {
    expect(detectEditorType('tags')).toBe('tags');
    expect(detectEditorType('Tags')).toBe('tags');
    expect(detectEditorType('array')).toBe('tags');
    expect(detectEditorType('Array')).toBe('tags');
  });

  it('maps "content" to "textarea"', () => {
    expect(detectEditorType('content')).toBe('textarea');
    expect(detectEditorType('text')).toBe('textarea');
    expect(detectEditorType('richtext')).toBe('textarea');
    expect(detectEditorType('textarea')).toBe('textarea');
  });

  it('maps unknown types to "text"', () => {
    expect(detectEditorType('unknown')).toBe('text');
    expect(detectEditorType('string')).toBe('text');
    expect(detectEditorType('custom')).toBe('text');
    expect(detectEditorType('')).toBe('text');
  });
});

describe('createEditState', () => {
  it('returns empty initial state', () => {
    const state = createEditState();
    expect(state).toEqual({
      fields: {},
      isEditing: false,
      isDirty: false,
    });
  });
});

describe('startEditing', () => {
  it('sets field to editing with current value', () => {
    const state = createEditState();
    const newState = startEditing(state, 'title', 'Hello World');

    expect(newState.isEditing).toBe(true);
    expect(newState.fields.title).toEqual({
      editing: true,
      value: 'Hello World',
      error: null,
      dirty: false,
    });
  });

  it('can start editing multiple fields', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = startEditing(state, 'subtitle', 'World');

    expect(state.isEditing).toBe(true);
    expect(state.fields.title?.editing).toBe(true);
    expect(state.fields.subtitle?.editing).toBe(true);
  });

  it('preserves other fields when starting edit', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = startEditing(state, 'subtitle', 'World');

    expect(state.fields.title?.value).toBe('Updated');
    expect(state.fields.title?.dirty).toBe(true);
  });
});

describe('updateFieldValue', () => {
  it('updates value and sets dirty', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Hello World');

    expect(state.fields.title?.value).toBe('Hello World');
    expect(state.fields.title?.dirty).toBe(true);
    expect(state.isDirty).toBe(true);
  });

  it('runs validation when provided', () => {
    const validate = (value: unknown): string | null => {
      if (typeof value !== 'string') return 'Must be a string';
      if (value.length < 3) return 'Too short';
      return null;
    };

    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', validate);

    expect(state.fields.title?.error).toBe('Too short');
    expect(state.fields.title?.value).toBe('Hi');
  });

  it('clears error when validation passes', () => {
    const validate = (value: unknown): string | null => {
      if (typeof value !== 'string') return 'Must be a string';
      if (value.length < 3) return 'Too short';
      return null;
    };

    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', validate);
    expect(state.fields.title?.error).toBe('Too short');

    state = updateFieldValue(state, 'title', 'Hello', validate);
    expect(state.fields.title?.error).toBe(null);
  });

  it('returns state unchanged if field does not exist', () => {
    const state = createEditState();
    const newState = updateFieldValue(state, 'nonexistent', 'value');

    expect(newState).toEqual(state);
  });
});

describe('commitField', () => {
  it('sets editing to false and preserves value', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = commitField(state, 'title');

    expect(state.fields.title?.editing).toBe(false);
    expect(state.fields.title?.value).toBe('Updated');
    expect(state.fields.title?.dirty).toBe(true);
    expect(state.isEditing).toBe(false);
  });

  it('updates isEditing when other fields still editing', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = startEditing(state, 'subtitle', 'World');
    state = commitField(state, 'title');

    expect(state.fields.title?.editing).toBe(false);
    expect(state.fields.subtitle?.editing).toBe(true);
    expect(state.isEditing).toBe(true);
  });

  it('returns state unchanged if field does not exist', () => {
    const state = createEditState();
    const newState = commitField(state, 'nonexistent');

    expect(newState).toEqual(state);
  });
});

describe('cancelField', () => {
  it('removes field from state', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = cancelField(state, 'title');

    expect(state.fields.title).toBeUndefined();
    expect(state.isEditing).toBe(false);
    expect(state.isDirty).toBe(false);
  });

  it('updates isEditing correctly when other fields still editing', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = startEditing(state, 'subtitle', 'World');
    state = cancelField(state, 'title');

    expect(state.fields.title).toBeUndefined();
    expect(state.fields.subtitle?.editing).toBe(true);
    expect(state.isEditing).toBe(true);
  });

  it('updates isDirty correctly when other fields still dirty', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated Title');
    state = startEditing(state, 'subtitle', 'World');
    state = updateFieldValue(state, 'subtitle', 'Updated Subtitle');
    state = cancelField(state, 'title');

    expect(state.fields.title).toBeUndefined();
    expect(state.isDirty).toBe(true);
  });

  it('sets isDirty to false when no more dirty fields', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = cancelField(state, 'title');

    expect(state.isDirty).toBe(false);
  });
});

describe('getChanges', () => {
  it('returns only dirty field values', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated Title');
    state = startEditing(state, 'subtitle', 'World');

    const changes = getChanges(state);
    expect(changes).toEqual({
      title: 'Updated Title',
    });
  });

  it('returns multiple dirty fields', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated Title');
    state = startEditing(state, 'subtitle', 'World');
    state = updateFieldValue(state, 'subtitle', 'Updated Subtitle');

    const changes = getChanges(state);
    expect(changes).toEqual({
      title: 'Updated Title',
      subtitle: 'Updated Subtitle',
    });
  });

  it('returns empty object when no dirty fields', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');

    const changes = getChanges(state);
    expect(changes).toEqual({});
  });

  it('includes committed dirty fields', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = commitField(state, 'title');

    const changes = getChanges(state);
    expect(changes).toEqual({
      title: 'Updated',
    });
  });
});

describe('hasFieldError', () => {
  it('returns true when field has error', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', () => 'Too short');

    expect(hasFieldError(state, 'title')).toBe(true);
  });

  it('returns false when field has no error', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');

    expect(hasFieldError(state, 'title')).toBe(false);
  });

  it('returns false for nonexistent field', () => {
    const state = createEditState();
    expect(hasFieldError(state, 'nonexistent')).toBe(false);
  });
});

describe('hasErrors', () => {
  it('returns true when any field has error', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', () => 'Too short');
    state = startEditing(state, 'subtitle', 'World');

    expect(hasErrors(state)).toBe(true);
  });

  it('returns false when no fields have errors', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = startEditing(state, 'subtitle', 'World');

    expect(hasErrors(state)).toBe(false);
  });

  it('returns false for empty state', () => {
    const state = createEditState();
    expect(hasErrors(state)).toBe(false);
  });
});

describe('editFieldClass', () => {
  it('returns base class for non-editing field', () => {
    const state = createEditState();
    expect(editFieldClass(state, 'title')).toBe('sk-editable');
  });

  it('returns editing class when field is being edited', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');

    const classes = editFieldClass(state, 'title');
    expect(classes).toContain('sk-editable');
    expect(classes).toContain('sk-editable--editing');
  });

  it('returns dirty class when field is modified', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');

    const classes = editFieldClass(state, 'title');
    expect(classes).toContain('sk-editable--dirty');
  });

  it('returns error class when field has error', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', () => 'Too short');

    const classes = editFieldClass(state, 'title');
    expect(classes).toContain('sk-editable--error');
  });

  it('returns all applicable classes', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hi');
    state = updateFieldValue(state, 'title', 'Hi', () => 'Too short');

    const classes = editFieldClass(state, 'title');
    expect(classes).toContain('sk-editable');
    expect(classes).toContain('sk-editable--editing');
    expect(classes).toContain('sk-editable--dirty');
    expect(classes).toContain('sk-editable--error');
  });
});

describe('discardAll', () => {
  it('resets to initial state', () => {
    let state = createEditState();
    state = startEditing(state, 'title', 'Hello');
    state = updateFieldValue(state, 'title', 'Updated');
    state = startEditing(state, 'subtitle', 'World');

    const newState = discardAll();
    expect(newState).toEqual(createEditState());
  });
});
