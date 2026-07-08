import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Label type', () => {
    it('renders children text', () => {
      render(() => <Badge>Label text</Badge>);
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });

    it('defaults to label type', () => {
      render(() => <Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge.className).toContain('sk-badge--label');
    });

    it('defaults to default variant', () => {
      render(() => <Badge>Default variant</Badge>);
      const badge = screen.getByText('Default variant');
      expect(badge.className).toContain('sk-badge--default');
    });

    it('applies success variant class', () => {
      render(() => <Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge.className).toContain('sk-badge--success');
    });

    it('applies warning variant class', () => {
      render(() => <Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge.className).toContain('sk-badge--warning');
    });

    it('applies danger variant class', () => {
      render(() => <Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge.className).toContain('sk-badge--danger');
    });

    it('applies info variant class', () => {
      render(() => <Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge.className).toContain('sk-badge--info');
    });

    it('applies custom class', () => {
      render(() => <Badge class="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge.className).toContain('custom-class');
    });
  });

  describe('Dot type', () => {
    it('renders small circle for dot variant', () => {
      const { container } = render(() => <Badge type="dot" variant="success" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--dot');
    });

    it('applies default dot color', () => {
      const { container } = render(() => <Badge type="dot" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--default');
    });

    it('applies success dot color', () => {
      const { container } = render(() => <Badge type="dot" variant="success" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--success');
    });

    it('applies warning dot color', () => {
      const { container } = render(() => <Badge type="dot" variant="warning" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--warning');
    });

    it('applies danger dot color', () => {
      const { container } = render(() => <Badge type="dot" variant="danger" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--danger');
    });

    it('applies info dot color', () => {
      const { container } = render(() => <Badge type="dot" variant="info" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('sk-badge--info');
    });

    it('applies custom class to dot', () => {
      const { container } = render(() => <Badge type="dot" class="custom-dot" />);
      const dot = container.querySelector('span');
      expect(dot?.className).toContain('custom-dot');
    });
  });

  describe('Count type', () => {
    it('displays count number', () => {
      render(() => <Badge type="count" count={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays zero count', () => {
      render(() => <Badge type="count" count={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('applies count-specific styling', () => {
      render(() => <Badge type="count" count={5} />);
      const badge = screen.getByText('5');
      expect(badge.className).toContain('sk-badge--count');
    });

    it('shows maxCount overflow with default maxCount (99)', () => {
      render(() => <Badge type="count" count={150} />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('shows maxCount overflow with custom maxCount', () => {
      render(() => <Badge type="count" count={250} maxCount={199} />);
      expect(screen.getByText('199+')).toBeInTheDocument();
    });

    it('does not show overflow when count equals maxCount', () => {
      render(() => <Badge type="count" count={99} maxCount={99} />);
      expect(screen.getByText('99')).toBeInTheDocument();
      expect(screen.queryByText('99+')).not.toBeInTheDocument();
    });

    it('shows count when below maxCount', () => {
      render(() => <Badge type="count" count={50} maxCount={99} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('applies variant colors to count badge', () => {
      render(() => <Badge type="count" count={5} variant="danger" />);
      const badge = screen.getByText('5');
      expect(badge.className).toContain('sk-badge--danger');
    });

    it('applies custom class to count badge', () => {
      render(() => <Badge type="count" count={5} class="custom-count" />);
      const badge = screen.getByText('5');
      expect(badge.className).toContain('custom-count');
    });
  });

  describe('Variants (new)', () => {
    it('applies outline variant class', () => {
      render(() => <Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge.className).toContain('sk-badge--outline');
    });

    it('applies soft variant class', () => {
      render(() => <Badge variant="soft">Soft</Badge>);
      const badge = screen.getByText('Soft');
      expect(badge.className).toContain('sk-badge--soft');
    });
  });

  describe('Size prop', () => {
    it('defaults to md size', () => {
      render(() => <Badge>Default size</Badge>);
      const badge = screen.getByText('Default size');
      expect(badge.className).toContain('sk-badge--size-md');
    });

    it('applies xs size class', () => {
      render(() => <Badge size="xs">XS</Badge>);
      const badge = screen.getByText('XS');
      expect(badge.className).toContain('sk-badge--size-xs');
    });

    it('applies sm size class', () => {
      render(() => <Badge size="sm">SM</Badge>);
      const badge = screen.getByText('SM');
      expect(badge.className).toContain('sk-badge--size-sm');
    });

    it('applies md size class', () => {
      render(() => <Badge size="md">MD</Badge>);
      const badge = screen.getByText('MD');
      expect(badge.className).toContain('sk-badge--size-md');
    });

    it('applies lg size class', () => {
      render(() => <Badge size="lg">LG</Badge>);
      const badge = screen.getByText('LG');
      expect(badge.className).toContain('sk-badge--size-lg');
    });

    it('combines size with variant', () => {
      render(() => (
        <Badge size="lg" variant="soft">
          Combined
        </Badge>
      ));
      const badge = screen.getByText('Combined');
      expect(badge.className).toContain('sk-badge--size-lg');
      expect(badge.className).toContain('sk-badge--soft');
    });

    it('applies size class on count badge', () => {
      render(() => <Badge type="count" count={5} size="sm" />);
      const badge = screen.getByText('5');
      expect(badge.className).toContain('sk-badge--size-sm');
    });
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => (
      <Badge unstyled class="custom">
        Content
      </Badge>
    ));
    const badge = container.firstElementChild;
    expect(badge?.className).not.toContain('sk-');
    expect(badge?.className).toContain('custom');
  });
});
