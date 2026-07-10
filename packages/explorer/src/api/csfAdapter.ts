import type { StoryEntry, ComponentStoryDef, ControlDef } from './types';
import type { JSX } from 'solid-js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CSFArgType {
  readonly control?: string | { readonly type: string };
  readonly options?: readonly string[];
  readonly defaultValue?: {
    readonly summary?: string;
  };
  readonly table?: {
    readonly defaultValue?: {
      readonly summary?: string;
    };
  };
}

interface CSFMeta {
  readonly title: string;
  readonly component?: (props: Record<string, unknown>) => JSX.Element;
  readonly argTypes?: Record<string, CSFArgType>;
}

interface CSFStory {
  readonly args?: Record<string, unknown>;
  readonly render?: (args: Record<string, unknown>) => JSX.Element;
}

// ─── Detection ──────────────────────────────────────────────────────────────

/**
 * Detects if a module uses Storybook CSF format.
 * A CSF module has a `default` export with a `title` string property.
 */
export function isCSFModule(mod: Record<string, unknown>): boolean {
  const defaultExport = mod['default'];
  return (
    typeof defaultExport === 'object' &&
    defaultExport !== null &&
    'title' in defaultExport &&
    typeof (defaultExport as CSFMeta).title === 'string'
  );
}

// ─── Conversion ─────────────────────────────────────────────────────────────

/**
 * Converts a Storybook CSF module into Explorer StoryEntry objects.
 * Each named export becomes a separate story variant.
 */
export function convertCSFModule(
  mod: Record<string, unknown>,
  path: string
): readonly StoryEntry[] {
  const meta = mod['default'] as CSFMeta;
  const { category, title } = parseTitle(meta.title);

  const entries: StoryEntry[] = [];

  for (const [exportName, story] of Object.entries(mod)) {
    // Skip default export and internal Storybook exports
    if (exportName === 'default' || exportName === '__namedExportsOrder') {
      continue;
    }

    // Only process story objects
    if (typeof story !== 'object' || story === null) {
      continue;
    }

    const csfStory = story as CSFStory;
    const storyTitle = formatStoryTitle(exportName);
    const fullTitle = `${title} - ${storyTitle}`;

    // Controls are per-story: defaults must reflect the story's own args,
    // otherwise the ControlsPanel seeds empty argType defaults (e.g. '' for
    // text controls) into controlValues, which then override args in the
    // render merge and blank the story out.
    const controls = convertArgTypes(meta.argTypes ?? {}, csfStory.args ?? {});

    const id = `${path}--${exportName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const def: ComponentStoryDef = {
      kind: 'component',
      title: fullTitle,
      category,
      render: createRenderFunction(csfStory, meta),
      controls,
    };

    entries.push({ id, title: fullTitle, category, def });
  }

  return entries;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Parses "Category/ComponentName" format into category and title.
 * Falls back to "Components" category if no slash present.
 */
function parseTitle(titleString: string): { category: string; title: string } {
  const slashIndex = titleString.lastIndexOf('/');
  if (slashIndex === -1) {
    return { category: 'Components', title: titleString };
  }
  return {
    category: titleString.slice(0, slashIndex),
    title: titleString.slice(slashIndex + 1),
  };
}

/**
 * Converts PascalCase/camelCase export name to readable title.
 * Examples: "AllSizes" → "All Sizes", "Primary" → "Primary"
 */
function formatStoryTitle(exportName: string): string {
  return exportName.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Converts Storybook argTypes to Explorer controls.
 * A story's own `args` take precedence over argType-derived defaults so the
 * story renders as authored.
 */
function convertArgTypes(
  argTypes: Record<string, CSFArgType>,
  args: Record<string, unknown> = {}
): Record<string, ControlDef> {
  const controls: Record<string, ControlDef> = {};

  for (const [name, argType] of Object.entries(argTypes)) {
    const controlType = getControlType(argType);
    const argValue = args[name];
    const defaultValue = argValue !== undefined ? argValue : getDefaultValue(argType, controlType);

    if (controlType === 'select') {
      controls[name] = {
        type: 'select',
        options: argType.options ?? [],
        ...(defaultValue !== undefined && { defaultValue: defaultValue as string }),
      };
    } else if (controlType === 'boolean') {
      controls[name] = {
        type: 'boolean',
        ...(defaultValue !== undefined && { defaultValue: defaultValue as boolean }),
      };
    } else if (controlType === 'number') {
      controls[name] = {
        type: 'number',
        ...(defaultValue !== undefined && { defaultValue: defaultValue as number }),
      };
    } else if (controlType === 'text') {
      controls[name] = {
        type: 'text',
        ...(defaultValue !== undefined && { defaultValue: defaultValue as string }),
      };
    }
  }

  return controls;
}

/**
 * Extracts the control type from a Storybook argType.
 * Supports both string form ("select") and object form ({ type: "select" }).
 */
function getControlType(argType: CSFArgType): string {
  if (typeof argType.control === 'string') {
    return argType.control;
  }
  if (typeof argType.control === 'object' && argType.control !== null) {
    return argType.control.type;
  }
  return 'text'; // default fallback
}

/**
 * Extracts the default value for a control.
 * Checks argType.defaultValue.summary, then argType.table.defaultValue.summary.
 * When neither is declared, returns undefined — the prop stays unset so the
 * component's own default applies. Fabricating values here (0, '', first
 * option) silently overrides story args and component defaults, blanking
 * stories out (e.g. maxVisible: 0 hiding every image).
 */
function getDefaultValue(argType: CSFArgType, controlType: string): unknown {
  // Try to get from argType.defaultValue.summary
  const summaryValue = argType.defaultValue?.summary;
  if (summaryValue !== undefined) {
    return parseDefaultValue(summaryValue, controlType);
  }

  // Try to get from argType.table.defaultValue.summary
  const tableSummary = argType.table?.defaultValue?.summary;
  if (tableSummary !== undefined) {
    return parseDefaultValue(tableSummary, controlType);
  }

  return undefined;
}

/**
 * Parses a default value string into the appropriate type.
 */
function parseDefaultValue(value: string, controlType: string): unknown {
  if (controlType === 'boolean') {
    return value === 'true';
  }
  if (controlType === 'number') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  // Remove quotes if present (some summaries include them)
  return value.replace(/^["']|["']$/g, '');
}

/**
 * Creates a render function for the Explorer from a CSF story.
 * Handles both args-based stories and custom render functions.
 */
function createRenderFunction(
  story: CSFStory,
  meta: CSFMeta
): (props: Record<string, unknown>) => JSX.Element {
  // If the story has a custom render function, use it
  if (story.render) {
    return (controlValues: Record<string, unknown>) => {
      const mergedArgs = { ...story.args, ...controlValues };
      return story.render!(mergedArgs);
    };
  }

  // If the story only has args, create a render function using the meta component
  if (story.args && meta.component) {
    return (controlValues: Record<string, unknown>) => {
      const mergedProps = { ...story.args, ...controlValues };
      return meta.component!(mergedProps);
    };
  }

  // Fallback: just use the meta component with control values
  if (meta.component) {
    return (controlValues: Record<string, unknown>) => {
      return meta.component!(controlValues);
    };
  }

  // No component or render function - return a function that creates a text node
  return () => {
    const div = document.createElement('div');
    div.textContent = 'No render function available';
    return div as unknown as JSX.Element;
  };
}
