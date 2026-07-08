/**
 * Inline editing state management and type-based editor mapping.
 *
 * Provides:
 * - Editor type detection from schema type hints
 * - Field-level edit state management
 * - Validation support
 * - CSS class generation for editable fields
 */

/** Schema type to editor component mapping */
export type EditorType = 'text' | 'number' | 'select' | 'date' | 'tags' | 'textarea' | 'boolean';

/** Field editor configuration */
export interface FieldEditor {
  /** The editor type to use */
  readonly type: EditorType;
  /** Field name in the data model */
  readonly field: string;
  /** Human-readable label */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Options for select editor */
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  /** Validation function */
  readonly validate?: (value: unknown) => string | null;
}

/** Edit state for a single field */
export interface EditFieldState {
  /** Whether this field is currently being edited */
  readonly editing: boolean;
  /** The current value while editing (may differ from committed value) */
  readonly value: unknown;
  /** Validation error message, null if valid */
  readonly error: string | null;
  /** Whether the value has been modified */
  readonly dirty: boolean;
}

/** Edit state for an entire item */
export interface EditState {
  /** Per-field edit states */
  readonly fields: Record<string, EditFieldState>;
  /** Whether any field is currently being edited */
  readonly isEditing: boolean;
  /** Whether any field has been modified */
  readonly isDirty: boolean;
}

/** Callbacks for inline editing */
export interface EditCallbacks {
  /** Called when a field value changes */
  readonly onFieldChange?: (fieldName: string, newValue: unknown) => void;
  /** Called when editing starts on a field */
  readonly onEditStart?: (fieldName: string) => void;
  /** Called when editing ends (commit or cancel) */
  readonly onEditEnd?: (fieldName: string, committed: boolean) => void;
  /** Called when all changes are committed */
  readonly onCommit?: (changes: Record<string, unknown>) => void;
  /** Called when all changes are discarded */
  readonly onDiscard?: () => void;
}

/** Detect the editor type from a schema type hint string */
export const detectEditorType = (typeHint: string): EditorType => {
  const hint = typeHint.toLowerCase();
  if (hint === 'number' || hint === 'integer' || hint === 'float') return 'number';
  if (hint === 'boolean' || hint === 'bool') return 'boolean';
  if (hint === 'date' || hint === 'datetime' || hint === 'timestamp') return 'date';
  if (hint === 'enum' || hint === 'select') return 'select';
  if (hint === 'tags' || hint === 'array') return 'tags';
  if (hint === 'text' || hint === 'content' || hint === 'richtext' || hint === 'textarea') return 'textarea';
  return 'text';
};

/** Create initial edit state */
export const createEditState = (): EditState => ({
  fields: {},
  isEditing: false,
  isDirty: false,
});

/** Start editing a field */
export const startEditing = (
  state: EditState,
  fieldName: string,
  currentValue: unknown,
): EditState => ({
  ...state,
  fields: {
    ...state.fields,
    [fieldName]: {
      editing: true,
      value: currentValue,
      error: null,
      dirty: false,
    },
  },
  isEditing: true,
});

/** Update a field's value while editing */
export const updateFieldValue = (
  state: EditState,
  fieldName: string,
  newValue: unknown,
  validate?: (value: unknown) => string | null,
): EditState => {
  const fieldState = state.fields[fieldName];
  if (!fieldState) return state;

  const error = validate ? validate(newValue) : null;

  return {
    ...state,
    fields: {
      ...state.fields,
      [fieldName]: {
        ...fieldState,
        value: newValue,
        error,
        dirty: true,
      },
    },
    isDirty: true,
  };
};

/** Commit (finish) editing a field */
export const commitField = (
  state: EditState,
  fieldName: string,
): EditState => {
  const fieldState = state.fields[fieldName];
  if (!fieldState) return state;

  const newFields = { ...state.fields };
  newFields[fieldName] = { ...fieldState, editing: false };

  const stillEditing = Object.values(newFields).some(f => f.editing);

  return {
    ...state,
    fields: newFields,
    isEditing: stillEditing,
  };
};

/** Cancel editing a field (discard changes) */
export const cancelField = (
  state: EditState,
  fieldName: string,
): EditState => {
  const newFields = { ...state.fields };
  delete newFields[fieldName];

  const stillEditing = Object.values(newFields).some(f => f?.editing);
  const stillDirty = Object.values(newFields).some(f => f?.dirty);

  return {
    fields: newFields,
    isEditing: stillEditing,
    isDirty: stillDirty,
  };
};

/** Get all dirty field values as a changes map */
export const getChanges = (state: EditState): Record<string, unknown> => {
  const changes: Record<string, unknown> = {};
  for (const [name, fieldState] of Object.entries(state.fields)) {
    if (fieldState.dirty) {
      changes[name] = fieldState.value;
    }
  }
  return changes;
};

/** Check if a specific field has validation errors */
export const hasFieldError = (state: EditState, fieldName: string): boolean => {
  return state.fields[fieldName]?.error !== null && state.fields[fieldName]?.error !== undefined;
};

/** Check if any field has validation errors */
export const hasErrors = (state: EditState): boolean => {
  return Object.values(state.fields).some(f => f.error !== null);
};

/** Get the CSS class for an editable field */
export const editFieldClass = (state: EditState, fieldName: string): string => {
  const classes = ['sk-editable'];
  const fieldState = state.fields[fieldName];

  if (fieldState?.editing) {
    classes.push('sk-editable--editing');
  }
  if (fieldState?.dirty) {
    classes.push('sk-editable--dirty');
  }
  if (fieldState?.error) {
    classes.push('sk-editable--error');
  }

  return classes.join(' ');
};

/** Discard all changes and reset state */
export const discardAll = (): EditState => createEditState();
