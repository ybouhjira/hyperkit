import { describe, it, expect } from 'vitest';
import { extractProps } from './props.js';

const SRC = `
export interface OtherProps { x: string; }
export interface FooProps {
  /** The label. */
  label: string;
  /** Optional size.
   * @default 'md' */
  size?: 'sm' | 'md';
  untyped;
  method(): void;
  /** @default */
  bare?: string;
}
`;

describe('extractProps', () => {
  it('returns [] when the interface is not found', () => {
    expect(extractProps(SRC, 'NopeProps')).toEqual([]);
  });

  it('extracts props with type, required, description and @default', () => {
    const props = extractProps(SRC, 'FooProps');
    const by = Object.fromEntries(props.map((p) => [p.name, p]));

    expect(by['label']).toEqual({
      name: 'label',
      type: 'string',
      required: true,
      description: 'The label.',
    });
    expect(by['size']).toMatchObject({
      type: "'sm' | 'md'",
      required: false,
      description: 'Optional size.',
      defaultValue: "'md'",
    });
  });

  it('marks a member with no type annotation as unknown', () => {
    const by = Object.fromEntries(extractProps(SRC, 'FooProps').map((p) => [p.name, p]));
    expect(by['untyped']).toMatchObject({ type: 'unknown', description: '' });
  });

  it('skips non-property members (methods)', () => {
    expect(extractProps(SRC, 'FooProps').some((p) => p.name === 'method')).toBe(false);
  });

  it('omits defaultValue when @default has no value', () => {
    const by = Object.fromEntries(extractProps(SRC, 'FooProps').map((p) => [p.name, p]));
    expect(by['bare']).toMatchObject({ required: false, description: '' });
    expect(by['bare']?.defaultValue).toBeUndefined();
  });
});
