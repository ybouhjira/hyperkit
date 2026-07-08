import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Markdown } from './Markdown';

describe('Markdown', () => {
  it('renders with data-testid', () => {
    const { getByTestId } = render(() => <Markdown content="Hello" />);
    expect(getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('renders plain text content', () => {
    const { getByTestId } = render(() => <Markdown content="Hello world" />);
    const element = getByTestId('markdown-renderer');
    expect(element.textContent).toContain('Hello world');
  });

  it('renders heading elements from markdown', () => {
    const { getByTestId } = render(() => <Markdown content="# Hello" />);
    const element = getByTestId('markdown-renderer');
    expect(element.textContent).toContain('Hello');
    expect(element.querySelector('h1')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    const { getByTestId } = render(() => <Markdown content="**bold**" />);
    const element = getByTestId('markdown-renderer');
    expect(element.querySelector('strong')).toBeInTheDocument();
  });

  it('applies sk-markdown class', () => {
    const { getByTestId } = render(() => <Markdown content="Hello" />);
    const element = getByTestId('markdown-renderer');
    expect(element.classList.contains('sk-markdown')).toBe(true);
  });

  it('applies custom class', () => {
    const { getByTestId } = render(() => <Markdown content="Hello" class="my-md" />);
    const element = getByTestId('markdown-renderer');
    expect(element.classList.contains('my-md')).toBe(true);
  });

  it('applies custom style', () => {
    const { getByTestId } = render(() => <Markdown content="Hello" style={{ color: 'red' }} />);
    const element = getByTestId('markdown-renderer');
    expect(element.style.color).toBe('red');
  });

  it('shows cursor when streaming', () => {
    const { getByTestId } = render(() => <Markdown content="Hello" streaming={true} />);
    expect(getByTestId('markdown-cursor')).toBeInTheDocument();
  });

  it('hides cursor when not streaming', () => {
    const { queryByTestId } = render(() => <Markdown content="Hello" streaming={false} />);
    expect(queryByTestId('markdown-cursor')).not.toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const { getByTestId } = render(() => <Markdown content="" />);
    expect(getByTestId('markdown-renderer')).toBeInTheDocument();
  });
});
