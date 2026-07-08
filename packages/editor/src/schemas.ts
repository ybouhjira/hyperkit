/**
 * Hand-written prop schemas for each supported component.
 * Each entry is a JSON Schema object used by ActionForm / Inspector.
 */

import type { SupportedComponent, ComponentCategory } from './types';

export interface PropSchema {
  readonly type: 'string' | 'number' | 'boolean';
  readonly description: string;
  readonly enum?: readonly string[];
  readonly default?: string | number | boolean;
}

export type ComponentSchema = Readonly<Record<string, PropSchema>>;

export const COMPONENT_SCHEMAS: Readonly<Record<SupportedComponent, ComponentSchema>> = {
  Box: {
    children: { type: 'string', description: 'Text content', default: '' },
  },
  Flex: {
    direction: {
      type: 'string',
      description: 'Direction',
      enum: ['row', 'column', 'row-reverse', 'column-reverse'],
      default: 'row',
    },
    gap: {
      type: 'string',
      description: 'Gap',
      enum: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'sm',
    },
    align: {
      type: 'string',
      description: 'Align items',
      enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      default: 'start',
    },
    justify: {
      type: 'string',
      description: 'Justify content',
      enum: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      default: 'start',
    },
    wrap: { type: 'boolean', description: 'Wrap', default: false },
  },
  Stack: {
    gap: {
      type: 'string',
      description: 'Gap',
      enum: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'sm',
    },
    direction: {
      type: 'string',
      description: 'Direction',
      enum: ['vertical', 'horizontal'],
      default: 'vertical',
    },
    align: {
      type: 'string',
      description: 'Align items',
      enum: ['start', 'center', 'end', 'stretch'],
      default: 'start',
    },
  },
  Grid: {
    columns: { type: 'number', description: 'Number of columns', default: 2 },
    gap: {
      type: 'string',
      description: 'Gap',
      enum: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'sm',
    },
  },
  Text: {
    children: { type: 'string', description: 'Content', default: 'Text' },
    size: {
      type: 'string',
      description: 'Size',
      enum: ['xs', 'sm', 'base', 'lg', 'xl', '2xl'],
      default: 'base',
    },
    weight: {
      type: 'string',
      description: 'Font weight',
      enum: ['regular', 'medium', 'semibold', 'bold'],
      default: 'regular',
    },
    color: {
      type: 'string',
      description: 'Color',
      enum: ['primary', 'secondary', 'muted', 'accent', 'error', 'success', 'warning'],
      default: 'primary',
    },
  },
  Button: {
    children: { type: 'string', description: 'Label', default: 'Button' },
    variant: {
      type: 'string',
      description: 'Variant',
      enum: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'link'],
      default: 'primary',
    },
    size: {
      type: 'string',
      description: 'Size',
      enum: ['sm', 'md', 'lg'],
      default: 'md',
    },
    disabled: { type: 'boolean', description: 'Disabled', default: false },
    loading: { type: 'boolean', description: 'Loading', default: false },
    fullWidth: { type: 'boolean', description: 'Full width', default: false },
  },
  Input: {
    placeholder: { type: 'string', description: 'Placeholder', default: '' },
    label: { type: 'string', description: 'Label', default: '' },
    disabled: { type: 'boolean', description: 'Disabled', default: false },
    size: {
      type: 'string',
      description: 'Size',
      enum: ['sm', 'md', 'lg'],
      default: 'md',
    },
  },
  Card: {
    padding: {
      type: 'string',
      description: 'Padding',
      enum: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'md',
    },
    shadow: {
      type: 'string',
      description: 'Shadow',
      enum: ['none', 'sm', 'md', 'lg'],
      default: 'sm',
    },
  },
  Badge: {
    children: { type: 'string', description: 'Label', default: 'Badge' },
    variant: {
      type: 'string',
      description: 'Variant',
      enum: ['default', 'success', 'warning', 'error', 'info', 'outline'],
      default: 'default',
    },
    size: {
      type: 'string',
      description: 'Size',
      enum: ['sm', 'md', 'lg'],
      default: 'md',
    },
  },
  Select: {
    placeholder: { type: 'string', description: 'Placeholder', default: 'Select…' },
    disabled: { type: 'boolean', description: 'Disabled', default: false },
  },
  Checkbox: {
    children: { type: 'string', description: 'Label', default: 'Checkbox' },
    checked: { type: 'boolean', description: 'Checked', default: false },
    disabled: { type: 'boolean', description: 'Disabled', default: false },
  },
  Separator: {
    orientation: {
      type: 'string',
      description: 'Orientation',
      enum: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
  },
  Spacer: {
    size: {
      type: 'string',
      description: 'Size',
      enum: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      default: 'md',
    },
  },
  EmptyState: {
    title: { type: 'string', description: 'Title', default: 'Nothing here yet' },
    description: { type: 'string', description: 'Description', default: '' },
  },
  Center: {
    children: { type: 'string', description: 'Text content', default: '' },
  },
};

/** Which components can hold children */
export const CONTAINER_COMPONENTS = new Set<SupportedComponent>([
  'Box',
  'Flex',
  'Stack',
  'Grid',
  'Card',
  'Center',
]);

/** Categorisation for the palette */
export const COMPONENT_CATEGORIES: readonly PaletteEntry[] = [
  { group: 'Layout', component: 'Box' },
  { group: 'Layout', component: 'Flex' },
  { group: 'Layout', component: 'Stack' },
  { group: 'Layout', component: 'Grid' },
  { group: 'Layout', component: 'Center' },
  { group: 'Layout', component: 'Spacer' },
  { group: 'Layout', component: 'Separator' },
  { group: 'Input', component: 'Button' },
  { group: 'Input', component: 'Input' },
  { group: 'Input', component: 'Select' },
  { group: 'Input', component: 'Checkbox' },
  { group: 'Display', component: 'Text' },
  { group: 'Display', component: 'Badge' },
  { group: 'Display', component: 'Card' },
  { group: 'Display', component: 'EmptyState' },
];

export interface PaletteEntry {
  readonly group: string;
  readonly component: SupportedComponent;
}
