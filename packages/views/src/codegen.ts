/**
 * Code generation engine for hyperkit-views.
 * Generates SolidJS component source code from Effect Schema blueprints.
 */

import type { Kind, Shape } from './types';
import type { BlueprintField } from './annotation';
import { extractBlueprint } from './annotation';
import { resolveSlot } from './slot-map';
import type { SlotMap, SlotResolution, Slot } from './slot-map';
import { DEFAULT_SLOT_MAP } from './slot-map';
import { Schema as S } from 'effect';

/** Configuration for code generation */
export interface CodegenConfig {
  /** Name of the blueprint (e.g., 'Issue') — used for component names */
  readonly name: string;
  /** Shapes to generate views for */
  readonly shapes: readonly Shape[];
  /** Slot map to use for resolution */
  readonly slotMap?: SlotMap;
}

/** Result of generating a view */
export interface GeneratedView {
  /** Component name (e.g., 'IssueCard') */
  readonly componentName: string;
  /** Shape this view represents */
  readonly shape: Shape;
  /** Fields visible in this view (after slot resolution, excluding hidden) */
  readonly visibleFields: ReadonlyArray<{
    readonly name: string;
    readonly kind: Kind;
    readonly slot: Slot;
    readonly priority: number;
  }>;
  /** Generated TypeScript source code */
  readonly source: string;
}

/** Result of generating all views for a blueprint */
export interface CodegenResult {
  /** All generated views */
  readonly views: ReadonlyArray<GeneratedView>;
  /** The full file source (all views + types in one file) */
  readonly fileSource: string;
}

/**
 * Resolve which fields are visible in a given shape.
 * Returns fields with their resolved slots, excluding hidden fields.
 */
export const resolveVisibleFields = (
  fields: ReadonlyArray<BlueprintField>,
  shape: Shape,
  slotMap: SlotMap = DEFAULT_SLOT_MAP,
): ReadonlyArray<{ name: string; kind: Kind; slot: Slot; priority: number }> => {
  const result: Array<{ name: string; kind: Kind; slot: Slot; priority: number }> = [];

  for (const field of fields) {
    const resolution = resolveSlot(field.annotation.kind, shape, slotMap);
    if (resolution !== 'hidden') {
      result.push({
        name: field.name,
        kind: field.annotation.kind,
        slot: resolution,
        priority: field.annotation.priority,
      });
    }
  }

  return result;
};

/**
 * Generate the TypeScript overrides interface for a view component.
 */
const generateOverridesInterface = (
  componentName: string,
  visibleFields: ReadonlyArray<{ name: string; kind: Kind; slot: Slot }>,
): string => {
  const lines = [`export interface ${componentName}Overrides {`];
  for (const field of visibleFields) {
    lines.push(`  readonly ${field.name}?: false | 'disabled' | 'readonly' | ((value: unknown) => unknown);`);
  }
  lines.push('}');
  return lines.join('\n');
};

/**
 * Generate a single view component.
 */
const generateViewComponent = (
  componentName: string,
  dataTypeName: string,
  shape: Shape,
  visibleFields: ReadonlyArray<{ name: string; kind: Kind; slot: Slot; priority: number }>,
): string => {
  const lines: string[] = [];

  // Component function
  lines.push(`export const ${componentName} = (props: {`);
  lines.push(`  readonly data: ${dataTypeName};`);
  lines.push(`  readonly overrides?: ${componentName}Overrides;`);
  lines.push(`}) => {`);
  lines.push(`  return (`);
  lines.push(`    <div class="sk-view-${shape}" data-view="${componentName}">`);

  for (const field of visibleFields) {
    lines.push(`      {/* ${field.name}: ${field.kind} → ${field.slot} */}`);
    lines.push(`      <div class="sk-slot-${field.slot}" data-slot="${field.slot}" data-field="${field.name}">`);
    lines.push(`        {props.data.${field.name}}`);
    lines.push(`      </div>`);
  }

  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`};`);

  return lines.join('\n');
};

/**
 * Generate a skeleton component for loading states.
 */
const generateSkeletonComponent = (
  componentName: string,
  shape: Shape,
  visibleFields: ReadonlyArray<{ name: string; slot: Slot }>,
): string => {
  const skeletonName = `${componentName}Skeleton`;
  const lines: string[] = [];

  lines.push(`export const ${skeletonName} = () => {`);
  lines.push(`  return (`);
  lines.push(`    <div class="sk-view-${shape} sk-view-skeleton" data-view="${skeletonName}">`);

  for (const field of visibleFields) {
    lines.push(`      <div class="sk-slot-${field.slot} sk-skeleton-slot" data-slot="${field.slot}"></div>`);
  }

  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`};`);

  return lines.join('\n');
};

/**
 * Convert shape to PascalCase for component names.
 */
const shapeToPascal = (shape: Shape): string => {
  return shape.split('-').map(capitalize).join('');
};

/**
 * Capitalize first letter of a string.
 */
const capitalize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Main code generation function.
 * Generates all view components for a blueprint schema.
 */
export const generateViews = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config: CodegenConfig,
): CodegenResult => {
  const fields = extractBlueprint(schema);
  const slotMap = config.slotMap ?? DEFAULT_SLOT_MAP;
  const views: GeneratedView[] = [];

  for (const shape of config.shapes) {
    const visibleFields = resolveVisibleFields(fields, shape, slotMap);
    const componentName = `${config.name}${capitalize(shapeToPascal(shape))}`;

    const overridesSource = generateOverridesInterface(componentName, visibleFields);
    const componentSource = generateViewComponent(componentName, config.name, shape, visibleFields);
    const skeletonSource = generateSkeletonComponent(componentName, shape, visibleFields);

    const source = [overridesSource, '', componentSource, '', skeletonSource].join('\n');

    views.push({
      componentName,
      shape,
      visibleFields,
      source,
    });
  }

  // Generate complete file
  const header = `// Auto-generated by @ybouhjira/hyperkit-views — DO NOT EDIT\n`;
  const fileSource = [header, ...views.map(v => v.source)].join('\n\n');

  return { views, fileSource };
};
