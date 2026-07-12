import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text/Text';
import { Card } from './Card/Card';
import { Flex } from './Flex/Flex';
import { Stack } from './Stack/Stack';

describe('Text', () => {
  it('renders sk-text with token-mapped styles', () => {
    render(
      <Text as="h2" size="xl" weight="semibold" color="secondary" data-testid="t">
        Title
      </Text>
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('H2');
    expect(el).toHaveClass('sk-text');
    expect(el.style.fontSize).toBe('var(--sk-font-size-xl)');
    expect(el.style.fontWeight).toBe('var(--sk-font-weight-semibold)');
    expect(el.style.color).toBe('var(--sk-text-secondary)');
  });

  it('modifier classes match the SolidJS contract', () => {
    render(
      <Text truncate italic font="mono" align="center" data-testid="t">
        x
      </Text>
    );
    expect(screen.getByTestId('t')).toHaveClass(
      'sk-text--truncate',
      'sk-text--italic',
      'sk-text--font-mono',
      'sk-text--align-center'
    );
  });
});

describe('Card', () => {
  it('renders the sk-card class contract', () => {
    render(
      <Card variant="elevated" padding="lg" data-testid="c">
        body
      </Card>
    );
    expect(screen.getByTestId('c')).toHaveClass(
      'sk-card',
      'sk-card--elevated',
      'sk-card--padding-lg'
    );
  });
});

describe('Flex / Stack', () => {
  it('Flex maps layout props to inline styles with tokens', () => {
    render(
      <Flex justify="between" align="center" gap="sm" data-testid="f">
        <span>a</span>
      </Flex>
    );
    const el = screen.getByTestId('f');
    expect(el.style.display).toBe('flex');
    expect(el.style.justifyContent).toBe('space-between');
    expect(el.style.alignItems).toBe('center');
    expect(el.style.gap).toBe('var(--sk-space-sm)');
  });

  it('Stack defaults to a vertical md-gap flex column', () => {
    render(
      <Stack data-testid="s">
        <span>a</span>
      </Stack>
    );
    const el = screen.getByTestId('s');
    expect(el.style.flexDirection).toBe('column');
    expect(el.style.gap).toBe('var(--sk-space-md)');
  });
});
