import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { extractControls, Controls, type ControlDef, type CsfMeta } from './controls.js';
import type { CsfStory } from './csf.js';

describe('extractControls', () => {
  it('derives controls from argTypes + merged args, skipping non-primitives', () => {
    const meta: CsfMeta = {
      component: () => null,
      args: { size: 'md', count: 3, label: 'hi', flag: true, obj: {}, fn: () => undefined },
      argTypes: {
        variant: { control: 'select', options: ['a', 'b'] },
        size: { control: { type: 'select' }, options: ['sm', 'md'] },
        toggle: { control: 'boolean' },
        unset: { control: 'select', options: ['x', 'y'] },
        emptySel: { control: 'select', options: [] },
      },
    };
    const story: CsfStory = { args: { variant: 'b' } };
    const by = Object.fromEntries(extractControls(meta, story).map((c) => [c.name, c]));

    expect(by['variant']).toEqual({
      name: 'variant',
      kind: 'select',
      options: ['a', 'b'],
      value: 'b',
    });
    expect(by['size']).toMatchObject({ kind: 'select', value: 'md' }); // control as { type }
    expect(by['toggle']).toEqual({ name: 'toggle', kind: 'boolean', value: false }); // no arg → false
    expect(by['unset']).toMatchObject({ kind: 'select', value: 'x' }); // no arg → options[0]
    expect(by['emptySel']).toMatchObject({ kind: 'select', value: '' }); // empty options → ''
    expect(by['count']).toEqual({ name: 'count', kind: 'number', value: 3 });
    expect(by['label']).toEqual({ name: 'label', kind: 'text', value: 'hi' });
    expect(by['flag']).toEqual({ name: 'flag', kind: 'boolean', value: true });
    expect(by['obj']).toBeUndefined();
    expect(by['fn']).toBeUndefined();
  });

  it('returns [] for a story with no args or argTypes', () => {
    expect(extractControls({}, {})).toEqual([]);
  });
});

describe('Controls', () => {
  const controls: ControlDef[] = [
    { name: 'flag', kind: 'boolean', value: true },
    { name: 'variant', kind: 'select', options: ['a', 'b'], value: 'a' },
    { name: 'count', kind: 'number', value: 2 },
    { name: 'label', kind: 'text', value: 'hi' },
  ];

  it('renders a row + input per control', () => {
    const { container, getByText } = render(() => (
      <Controls
        controls={controls}
        values={{ flag: true, variant: 'a', count: 2, label: 'hi' }}
        onChange={vi.fn()}
      />
    ));
    expect(container.querySelectorAll('.sk-controls__row').length).toBe(4);
    expect(getByText('flag')).toBeInTheDocument();
    expect(getByText('label')).toBeInTheDocument();
  });

  it('fires onChange from the text input', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <Controls
        controls={[{ name: 'label', kind: 'text', value: 'hi' }]}
        values={{ label: 'hi' }}
        onChange={onChange}
      />
    ));
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'bye' } });
    expect(onChange).toHaveBeenCalledWith('label', 'bye');
  });

  it('fires onChange from the boolean switch', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <Controls
        controls={[{ name: 'flag', kind: 'boolean', value: false }]}
        values={{ flag: false }}
        onChange={onChange}
      />
    ));
    fireEvent.click(container.querySelector('input') as HTMLInputElement);
    expect(onChange).toHaveBeenCalledWith('flag', true);
  });

  it('falls back to defaults when values are missing and a select has no options', () => {
    const bare: ControlDef[] = [
      { name: 'flag', kind: 'boolean', value: false },
      { name: 'variant', kind: 'select', value: '' }, // no options
      { name: 'count', kind: 'number', value: 0 },
      { name: 'label', kind: 'text', value: '' },
    ];
    const { container } = render(() => <Controls controls={bare} values={{}} onChange={vi.fn()} />);
    expect(container.querySelectorAll('.sk-controls__row').length).toBe(4);
  });
});
