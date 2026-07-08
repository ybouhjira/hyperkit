import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import {
  Check,
  X,
  Circle,
  MessageSquare,
  ChevronDown,
  Play,
  Settings,
  Zap,
  Wrench,
  Gauge,
  Home,
  Plus,
  Trash,
  Info,
  File,
} from './named';

describe('named icon components', () => {
  it('renders Check icon', () => {
    const { container } = render(() => <Check />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains('sk-icon')).toBe(true);
  });

  it('renders X icon (mapped to close)', () => {
    const { container } = render(() => <X />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts IconSize string prop', () => {
    const { container } = render(() => <Circle size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--lg')).toBe(true);
  });

  it('maps numeric size 16 to sm token', () => {
    const { container } = render(() => <MessageSquare size={16} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--sm')).toBe(true);
  });

  it('maps numeric size 24 to md token', () => {
    const { container } = render(() => <ChevronDown size={24} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--md')).toBe(true);
  });

  it('maps numeric size 12 to xs token', () => {
    const { container } = render(() => <Play size={12} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--xs')).toBe(true);
  });

  it('maps numeric size 32 to lg token', () => {
    const { container } = render(() => <Settings size={32} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--lg')).toBe(true);
  });

  it('maps numeric size 48 to xl token', () => {
    const { container } = render(() => <Zap size={48} />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--xl')).toBe(true);
  });

  it('passes custom class prop through', () => {
    const { container } = render(() => <Wrench class="custom" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('custom')).toBe(true);
  });

  it('passes color prop through', () => {
    const { container } = render(() => <Gauge color="red" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('stroke')).toBe('red');
  });

  it('defaults to md size when no size provided', () => {
    const { container } = render(() => <Check />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--md')).toBe(true);
  });

  it('renders navigation icons', () => {
    const { container } = render(() => <Home />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders action icons', () => {
    const { container } = render(() => <Plus />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders status icons', () => {
    const { container } = render(() => <Info />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders content icons', () => {
    const { container } = render(() => <File />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts size xs', () => {
    const { container } = render(() => <Trash size="xs" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--xs')).toBe(true);
  });

  it('accepts size sm', () => {
    const { container } = render(() => <Trash size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--sm')).toBe(true);
  });

  it('accepts size md', () => {
    const { container } = render(() => <Trash size="md" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--md')).toBe(true);
  });

  it('accepts size xl', () => {
    const { container } = render(() => <Trash size="xl" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('sk-icon--xl')).toBe(true);
  });
});
