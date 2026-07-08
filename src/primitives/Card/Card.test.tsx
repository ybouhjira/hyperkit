import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(() => <Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(() => <Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--default');
  });

  it('applies outlined variant styles', () => {
    const { container } = render(() => <Card variant="outlined">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--outlined');
  });

  it('applies elevated variant styles', () => {
    const { container } = render(() => <Card variant="elevated">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--elevated');
  });

  it('applies different padding sizes', () => {
    const { container: none } = render(() => <Card padding="none">Content</Card>);
    expect((none.firstChild as HTMLElement).className).toContain('sk-card--padding-none');

    const { container: sm } = render(() => <Card padding="sm">Content</Card>);
    expect((sm.firstChild as HTMLElement).className).toContain('sk-card--padding-sm');

    const { container: lg } = render(() => <Card padding="lg">Content</Card>);
    expect((lg.firstChild as HTMLElement).className).toContain('sk-card--padding-lg');
  });

  it('handles onClick callback', () => {
    const handleClick = vi.fn();
    const { container } = render(() => <Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild as HTMLElement;

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks when no onClick handler is provided', () => {
    const { container } = render(() => <Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('shows pointer cursor when hoverable', () => {
    const { container } = render(() => <Card hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--hoverable');
  });

  it('shows pointer cursor when onClick is provided', () => {
    const { container } = render(() => <Card onClick={() => {}}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--clickable');
  });

  it('applies custom class', () => {
    const { container } = render(() => <Card class="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    const { container } = render(() => <Card style={{ color: 'red' }}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.style.color).toBe('red');
  });

  it('handles mouse enter on outlined variant', () => {
    const { container } = render(() => (
      <Card variant="outlined" hoverable>
        Content
      </Card>
    ));
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--outlined');
    expect(card.className).toContain('sk-card--hoverable');
  });

  it('handles mouse leave on outlined variant', () => {
    const { container } = render(() => (
      <Card variant="outlined" hoverable>
        Content
      </Card>
    ));
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('sk-card--outlined');
    expect(card.className).toContain('sk-card--hoverable');
  });

  it('does not apply hover effects when not interactive', () => {
    const { container } = render(() => <Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('sk-card--hoverable');
    expect(card.className).not.toContain('sk-card--clickable');
  });

  it('unstyled removes sk-card classes', () => {
    const { container } = render(() => (
      <Card unstyled class="custom">
        Content
      </Card>
    ));
    const card = container.firstElementChild;
    expect(card?.className).not.toContain('sk-card');
    expect(card?.className).toContain('custom');
  });

  it('unstyled sub-components remove their classes', () => {
    const { container } = render(() => (
      <Card>
        <CardHeader unstyled class="my-header">
          Header
        </CardHeader>
      </Card>
    ));
    const header = container.querySelector('.my-header');
    expect(header).toBeInTheDocument();
    expect(header?.className).not.toContain('sk-card__header');
  });

  it('applies classNames.root', () => {
    const { container } = render(() => <Card classNames={{ root: 'root-class' }}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('root-class');
    expect(card.className).toContain('sk-card');
  });

  it('unstyled keeps classNames.root without class prop', () => {
    const { container } = render(() => (
      <Card unstyled classNames={{ root: 'bare-root' }}>
        Content
      </Card>
    ));
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toBe('bare-root');
  });

  describe('borderColor', () => {
    it('threads the value into the --sk-card-border custom property', () => {
      const { container } = render(() => <Card borderColor="var(--sk-error)">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.style.getPropertyValue('--sk-card-border')).toBe('var(--sk-error)');
    });

    it('adds the sk-card--accent class', () => {
      const { container } = render(() => <Card borderColor="var(--sk-success)">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('sk-card--accent');
    });

    it('does not add the accent class or custom property when unset', () => {
      const { container } = render(() => <Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('sk-card--accent');
      expect(card.style.getPropertyValue('--sk-card-border')).toBe('');
    });

    it('never sets an inline border — only the custom property', () => {
      const { container } = render(() => <Card borderColor="var(--sk-accent)">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.style.border).toBe('');
      expect(card.style.borderColor).toBe('');
    });

    it('merges with a consumer style, consumer style winning on conflict', () => {
      const { container } = render(() => (
        <Card borderColor="var(--sk-warning)" style={{ color: 'red' }}>
          Content
        </Card>
      ));
      const card = container.firstChild as HTMLElement;
      expect(card.style.color).toBe('red');
      expect(card.style.getPropertyValue('--sk-card-border')).toBe('var(--sk-warning)');
    });

    it('applies to every variant including elevated', () => {
      const { container } = render(() => (
        <Card variant="elevated" borderColor="var(--sk-accent)">
          Content
        </Card>
      ));
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('sk-card--elevated');
      expect(card.className).toContain('sk-card--accent');
    });

    it('still sets the custom property in unstyled mode (consumer CSS may read it)', () => {
      const { container } = render(() => (
        <Card unstyled class="bare" borderColor="var(--sk-info)">
          Content
        </Card>
      ));
      const card = container.firstElementChild as HTMLElement;
      expect(card.className).not.toContain('sk-card--accent');
      expect(card.style.getPropertyValue('--sk-card-border')).toBe('var(--sk-info)');
    });
  });

  describe('live', () => {
    it('wraps the card in a LivePulse when live', () => {
      const { container } = render(() => <Card live>Content</Card>);
      const pulse = container.querySelector('.sk-livepulse');
      expect(pulse).toBeInTheDocument();
      expect(pulse?.querySelector('.sk-card')).toBeInTheDocument();
    });

    it('does not wrap in LivePulse by default', () => {
      const { container } = render(() => <Card>Content</Card>);
      expect(container.querySelector('.sk-livepulse')).not.toBeInTheDocument();
      expect(container.querySelector('.sk-card')).toBeInTheDocument();
    });
  });

  describe('sub-components', () => {
    it('CardTitle renders styled and unstyled', () => {
      const { container } = render(() => (
        <>
          <CardTitle class="t1">Title</CardTitle>
          <CardTitle unstyled class="t2">
            Title
          </CardTitle>
          <CardTitle>Bare</CardTitle>
        </>
      ));
      expect(container.querySelector('.t1')?.className).toContain('sk-card__title');
      expect(container.querySelector('.t2')?.className).not.toContain('sk-card__title');
      expect(container.querySelectorAll('h3')).toHaveLength(3);
    });

    it('CardDescription renders styled and unstyled', () => {
      const { container } = render(() => (
        <>
          <CardDescription class="d1">Desc</CardDescription>
          <CardDescription unstyled class="d2">
            Desc
          </CardDescription>
          <CardDescription unstyled>Bare</CardDescription>
        </>
      ));
      expect(container.querySelector('.d1')?.className).toContain('sk-card__description');
      expect(container.querySelector('.d2')?.className).not.toContain('sk-card__description');
      expect(container.querySelectorAll('p')).toHaveLength(3);
    });

    it('CardContent renders styled and unstyled', () => {
      const { container } = render(() => (
        <>
          <CardContent class="c1">Body</CardContent>
          <CardContent unstyled class="c2">
            Body
          </CardContent>
          <CardContent>Bare</CardContent>
        </>
      ));
      expect(container.querySelector('.c1')?.className).toContain('sk-card__content');
      expect(container.querySelector('.c2')?.className).not.toContain('sk-card__content');
    });

    it('CardFooter renders styled and unstyled', () => {
      const { container } = render(() => (
        <>
          <CardFooter class="f1">Footer</CardFooter>
          <CardFooter unstyled class="f2">
            Footer
          </CardFooter>
          <CardFooter unstyled>Bare</CardFooter>
        </>
      ));
      expect(container.querySelector('.f1')?.className).toContain('sk-card__footer');
      expect(container.querySelector('.f2')?.className).not.toContain('sk-card__footer');
    });

    it('CardHeader renders styled with custom style', () => {
      const { container } = render(() => (
        <CardHeader class="h1" style={{ color: 'red' }}>
          Header
        </CardHeader>
      ));
      const header = container.querySelector('.h1') as HTMLElement;
      expect(header.className).toContain('sk-card__header');
      expect(header.style.color).toBe('red');
    });

    it('all sub-components handle a missing class prop in both modes', () => {
      const { container } = render(() => (
        <>
          <CardHeader>H</CardHeader>
          <CardHeader unstyled>H</CardHeader>
          <CardTitle unstyled>T</CardTitle>
          <CardDescription>D</CardDescription>
          <CardContent unstyled>C</CardContent>
          <CardFooter>F</CardFooter>
        </>
      ));
      expect(container.querySelector('.sk-card__header')?.className).toBe('sk-card__header');
      expect(container.querySelector('.sk-card__description')?.className).toBe(
        'sk-card__description'
      );
      expect(container.querySelector('.sk-card__footer')?.className).toBe('sk-card__footer');
      // Unstyled + no class → empty class attribute.
      const unstyledHeader = container.querySelectorAll('div')[1];
      expect(unstyledHeader?.className).toBe('');
      expect(container.querySelector('h3')?.className).toBe('');
    });
  });
});
