import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders children when no keys prop provided', () => {
    render(() => <Kbd>Ctrl</Kbd>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('applies base class to single key', () => {
    const { container } = render(() => <Kbd>Ctrl</Kbd>);
    const kbd = container.querySelector('.sk-kbd');
    expect(kbd).toBeInTheDocument();
    expect(kbd?.tagName).toBe('KBD');
  });

  it('renders multiple keys with keys prop', () => {
    render(() => <Kbd keys={['Ctrl', 'Shift', 'P']} />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('Shift')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('renders separators between keys', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'C']} />);
    const separator = container.querySelector('.sk-kbd-separator');
    expect(separator).toBeInTheDocument();
    expect(separator?.textContent).toBe('+');
  });

  it('does not render separator after last key', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'C']} />);
    const separators = container.querySelectorAll('.sk-kbd-separator');
    expect(separators.length).toBe(1); // Only one separator for two keys
  });

  it('renders correct number of separators for three keys', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'Shift', 'P']} />);
    const separators = container.querySelectorAll('.sk-kbd-separator');
    expect(separators.length).toBe(2); // Two separators for three keys
  });

  it('wraps multiple keys in kbd-group', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'C']} />);
    const group = container.querySelector('.sk-kbd-group');
    expect(group).toBeInTheDocument();
    expect(group?.tagName).toBe('SPAN');
  });

  it('applies custom class to single key', () => {
    const { container } = render(() => <Kbd class="custom-class">Ctrl</Kbd>);
    const kbd = container.querySelector('.sk-kbd');
    expect(kbd?.classList.contains('custom-class')).toBe(true);
  });

  it('applies custom class to key group', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'C']} class="custom-class" />);
    const group = container.querySelector('.sk-kbd-group');
    expect(group?.classList.contains('custom-class')).toBe(true);
  });

  it('renders each key with sk-kbd class', () => {
    const { container } = render(() => <Kbd keys={['Ctrl', 'Shift', 'P']} />);
    const kbds = container.querySelectorAll('.sk-kbd');
    expect(kbds.length).toBe(3);
    kbds.forEach((kbd) => {
      expect(kbd.tagName).toBe('KBD');
    });
  });

  it('renders empty keys array with fallback', () => {
    render(() => <Kbd keys={[]}>Fallback</Kbd>);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('prefers keys prop over children', () => {
    render(() => <Kbd keys={['Ctrl']}>Ignored</Kbd>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
  });

  it('handles single key in keys array', () => {
    const { container } = render(() => <Kbd keys={['Ctrl']} />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    const separators = container.querySelectorAll('.sk-kbd-separator');
    expect(separators.length).toBe(0); // No separator for single key
  });

  it('handles special characters in keys', () => {
    render(() => <Kbd keys={['⌘', '⇧', 'K']} />);
    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });
});
