import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ThemeBuilder } from './ThemeBuilder';

describe('ThemeBuilder', () => {
  it('renders without crashing', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Theme Builder')).toBeInTheDocument();
  });

  it('shows color controls', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('shows preview panel', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <ThemeBuilder class="custom-class" />);
    const builder = container.querySelector('.sk-theme-builder');
    expect(builder).toHaveClass('custom-class');
  });

  it('export button exists', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Copy Theme Config')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(() => <ThemeBuilder />);
    const builder = container.querySelector('.sk-theme-builder');
    expect(builder).toBeInTheDocument();

    const controls = container.querySelector('.sk-theme-builder__controls');
    expect(controls).toBeInTheDocument();

    const preview = container.querySelector('.sk-theme-builder__preview');
    expect(preview).toBeInTheDocument();

    const actions = container.querySelector('.sk-theme-builder__actions');
    expect(actions).toBeInTheDocument();
  });

  it('shows radius controls', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Border Radius')).toBeInTheDocument();
  });

  it('shows typography controls', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Typography')).toBeInTheDocument();
  });

  it('shows import button', () => {
    render(() => <ThemeBuilder />);
    expect(screen.getByText('Import JSON')).toBeInTheDocument();
  });
});
