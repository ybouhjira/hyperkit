import { describe, it, expect } from 'vitest';
import { introspectSchema } from './introspect';
import { ButtonEditorSchema } from '../primitives/Button/Button.editor';
import { CardEditorSchema } from '../primitives/Card/Card.editor';
import { FlexEditorSchema } from '../primitives/Flex/Flex.editor';
import { InputEditorSchema } from '../primitives/Input/Input.editor';
import { BadgeEditorSchema } from '../primitives/Badge/Badge.editor';

describe('introspectSchema', () => {
  describe('ButtonEditorSchema', () => {
    it('should extract all props correctly', () => {
      const descriptors = introspectSchema(ButtonEditorSchema);

      expect(descriptors).toHaveLength(6);

      const variantProp = descriptors.find((d) => d.name === 'variant');
      expect(variantProp).toEqual({
        name: 'variant',
        type: 'enum',
        required: false,
        default: 'primary',
        description: 'Visual style variant. Affects background, border, and text color.',
        group: 'Appearance',
        options: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'link'],
      });

      const sizeProp = descriptors.find((d) => d.name === 'size');
      expect(sizeProp).toEqual({
        name: 'size',
        type: 'enum',
        required: false,
        default: 'md',
        description: 'Size variant. Controls padding and font size.',
        group: 'Appearance',
        options: ['sm', 'md', 'lg'],
      });

      const loadingProp = descriptors.find((d) => d.name === 'loading');
      expect(loadingProp).toEqual({
        name: 'loading',
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show loading spinner and disable interaction.',
        group: 'State',
      });
    });

    it('should sort props by group then name', () => {
      const descriptors = introspectSchema(ButtonEditorSchema);
      const groups = descriptors.map((d) => d.group);

      // Should be grouped: Appearance, Layout, State
      expect(groups[0]).toBe('Appearance');
      expect(groups[groups.length - 1]).toBe('State');
    });
  });

  describe('CardEditorSchema', () => {
    it('should extract all props correctly', () => {
      const descriptors = introspectSchema(CardEditorSchema);

      expect(descriptors).toHaveLength(4);

      const variantProp = descriptors.find((d) => d.name === 'variant');
      expect(variantProp?.type).toBe('enum');
      expect(variantProp?.options).toEqual(['default', 'outlined', 'elevated']);

      const borderColorProp = descriptors.find((d) => d.name === 'borderColor');
      expect(borderColorProp?.type).toBe('string');

      const paddingProp = descriptors.find((d) => d.name === 'padding');
      expect(paddingProp?.type).toBe('enum');
      expect(paddingProp?.options).toEqual(['none', 'sm', 'md', 'lg']);

      const hoverableProp = descriptors.find((d) => d.name === 'hoverable');
      expect(hoverableProp?.type).toBe('boolean');
    });
  });

  describe('FlexEditorSchema', () => {
    it('should extract all props correctly', () => {
      const descriptors = introspectSchema(FlexEditorSchema);

      expect(descriptors).toHaveLength(6);

      const directionProp = descriptors.find((d) => d.name === 'direction');
      expect(directionProp?.type).toBe('enum');
      expect(directionProp?.options).toEqual(['row', 'column', 'row-reverse', 'column-reverse']);

      const gapProp = descriptors.find((d) => d.name === 'gap');
      expect(gapProp?.type).toBe('enum');
      expect(gapProp?.options).toEqual([
        '0',
        'px',
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
      ]);
    });
  });

  describe('InputEditorSchema', () => {
    it('should extract all props correctly', () => {
      const descriptors = introspectSchema(InputEditorSchema);

      expect(descriptors).toHaveLength(4);

      const typeProp = descriptors.find((d) => d.name === 'type');
      expect(typeProp?.type).toBe('enum');
      expect(typeProp?.options).toEqual(['text', 'email', 'password', 'search', 'url']);

      const placeholderProp = descriptors.find((d) => d.name === 'placeholder');
      expect(placeholderProp?.type).toBe('string');
      expect(placeholderProp?.control).toBe('text');
      expect(placeholderProp?.group).toBe('Content');

      const errorProp = descriptors.find((d) => d.name === 'error');
      expect(errorProp?.type).toBe('string');
      expect(errorProp?.control).toBe('text');
    });
  });

  describe('BadgeEditorSchema', () => {
    it('should extract all props correctly', () => {
      const descriptors = introspectSchema(BadgeEditorSchema);

      expect(descriptors).toHaveLength(4);

      const variantProp = descriptors.find((d) => d.name === 'variant');
      expect(variantProp?.type).toBe('enum');
      expect(variantProp?.options).toEqual(['default', 'success', 'warning', 'danger', 'info']);

      const typeProp = descriptors.find((d) => d.name === 'type');
      expect(typeProp?.type).toBe('enum');
      expect(typeProp?.options).toEqual(['label', 'dot', 'count']);

      const countProp = descriptors.find((d) => d.name === 'count');
      expect(countProp?.type).toBe('number');

      const maxCountProp = descriptors.find((d) => d.name === 'maxCount');
      expect(maxCountProp?.type).toBe('number');
      expect(maxCountProp?.default).toBe(99);
    });
  });
});
