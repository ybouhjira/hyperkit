import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Spacer } from './Spacer';

describe('Spacer', () => {
  it('renders with flex:1 by default', () => {
    const { container } = render(() => <Spacer />);
    const element = container.querySelector('div');
    expect(element?.style.flex).toContain('1');
  });

  it('renders fixed horizontal size with SpaceToken', () => {
    const { container } = render(() => <Spacer size="md" />);
    const element = container.querySelector('div');
    expect(element?.style.width).toContain('var(--sk-space-md)');
    expect(element?.style.flexShrink).toBe('0');
  });

  it('renders fixed vertical size', () => {
    const { container } = render(() => <Spacer size="lg" axis="vertical" />);
    const element = container.querySelector('div');
    expect(element?.style.height).toContain('var(--sk-space-lg)');
    expect(element?.style.flexShrink).toBe('0');
  });

  it('renders fixed size with number', () => {
    const { container } = render(() => <Spacer size={24} />);
    const element = container.querySelector('div');
    expect(element?.style.width).toBe('24px');
  });

  it('renders fixed size with string', () => {
    const { container } = render(() => <Spacer size="2rem" />);
    const element = container.querySelector('div');
    expect(element?.style.width).toBe('2rem');
  });

  it('defaults axis to horizontal', () => {
    const { container } = render(() => <Spacer size="sm" />);
    const element = container.querySelector('div');
    expect(element?.style.width).toContain('var(--sk-space-sm)');
    expect(element?.style.height).toBeFalsy();
  });

  it('merges custom style', () => {
    const { container } = render(() => <Spacer style={{ background: 'red' }} />);
    const element = container.querySelector('div');
    expect(element?.style.flex).toContain('1');
    expect(element?.style.background).toBe('red');
  });

  it('inherits Box props', () => {
    const { container } = render(() => <Spacer p="md" bg="secondary" />);
    const element = container.querySelector('div');
    expect(element?.style.padding).toContain('var(--sk-space-md)');
    expect(element?.style.background).toContain('var(--sk-bg-secondary)');
  });
});
