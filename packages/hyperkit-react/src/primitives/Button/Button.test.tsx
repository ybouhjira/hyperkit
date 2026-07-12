import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders the sk-btn class contract (matches the SolidJS package)', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveClass('sk-btn', 'sk-btn--primary', 'sk-btn--md');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies variant and size modifier classes', () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    expect(screen.getByRole('button')).toHaveClass('sk-btn--danger', 'sk-btn--lg');
  });

  it('loading disables the button and shows the spinner', () => {
    render(<Button loading>Busy</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.sk-btn__spinner')).not.toBeNull();
  });

  it('fullWidth and rounded map to inline style', () => {
    render(
      <Button fullWidth rounded>
        Wide
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.style.width).toBe('100%');
    expect(btn.style.borderRadius).toBe('9999px');
  });

  it('unstyled drops sk-* classes but keeps custom ones', () => {
    render(
      <Button unstyled className="custom">
        Bare
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toBe('custom');
  });

  it('fires onClick and blocks it when disabled', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    );
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
