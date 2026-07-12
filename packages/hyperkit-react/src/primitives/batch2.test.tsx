import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Box } from './Box/Box';
import { Grid } from './Grid/Grid';
import { Badge } from './Badge/Badge';
import { Spinner } from './Spinner/Spinner';
import { Skeleton } from './Skeleton/Skeleton';
import { ProgressBar } from './ProgressBar/ProgressBar';
import { Separator } from './Separator/Separator';
import { Input } from './Input/Input';

describe('Box', () => {
  it('maps token props to var(--sk-*) inline styles', () => {
    render(
      <Box p="md" bg="secondary" radius="lg" w={200} data-testid="b">
        x
      </Box>
    );
    const el = screen.getByTestId('b');
    expect(el.style.padding).toBe('var(--sk-space-md)');
    expect(el.style.background).toBe('var(--sk-bg-secondary)');
    expect(el.style.borderRadius).toBe('var(--sk-radius-lg)');
    expect(el.style.width).toBe('200px');
  });

  it('is polymorphic via as', () => {
    render(
      <Box as="section" data-testid="b">
        x
      </Box>
    );
    expect(screen.getByTestId('b').tagName).toBe('SECTION');
  });
});

describe('Grid', () => {
  it('numeric columns become repeat(n, 1fr)', () => {
    render(
      <Grid columns={3} gap="sm" data-testid="g">
        <span>a</span>
      </Grid>
    );
    const el = screen.getByTestId('g');
    expect(el.style.display).toBe('grid');
    expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    expect(el.style.gap).toBe('var(--sk-space-sm)');
  });
});

describe('Badge', () => {
  it('renders the sk-badge class contract', () => {
    render(<Badge variant="success">ok</Badge>);
    const el = screen.getByText('ok');
    expect(el).toHaveClass('sk-badge', 'sk-badge--label', 'sk-badge--success', 'sk-badge--size-md');
  });

  it('count type caps at maxCount', () => {
    render(<Badge type="count" count={120} maxCount={99} />);
    expect(screen.getByText('99+')).toHaveClass('sk-badge--count');
  });
});

describe('Spinner / Skeleton / ProgressBar / Separator', () => {
  it('Spinner renders size and color modifiers', () => {
    render(<Spinner size="lg" color="muted" />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('sk-spinner', 'sk-spinner--lg', 'sk-spinner--muted');
  });

  it('Skeleton circle uses the size prop for both dimensions', () => {
    const { container } = render(<Skeleton variant="circle" size={48} />);
    const el = container.querySelector('.sk-skeleton--circle') as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('ProgressBar clamps value and exposes aria', () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    const fill = bar.querySelector('.sk-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('Separator renders orientation modifier', () => {
    render(<Separator orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveClass('sk-separator--vertical');
  });
});

describe('Input', () => {
  it('renders wrapper + error contract and wires onInput', () => {
    const onInput = vi.fn();
    render(<Input placeholder="Email" error="Required" onInput={onInput} />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveClass('sk-input', 'sk-input--error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    fireEvent.change(input, { target: { value: 'a@b.c' } });
    expect(onInput).toHaveBeenCalledWith('a@b.c');
  });
});
