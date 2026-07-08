import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code as text', () => {
    const { container } = render(() => <CodeBlock code="const x = 1;" />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toContain('const x = 1;');
  });

  it('applies language highlighting', () => {
    const { container } = render(() => <CodeBlock code="const x = 1;" language="javascript" />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code?.innerHTML).toContain('hljs');
  });

  it('renders label when provided', () => {
    const { container } = render(() => <CodeBlock code="const x = 1;" label="JavaScript" />);
    const label = container.querySelector('.sk-code-block__label');
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe('JavaScript');
  });

  it('hides label when not provided', () => {
    const { container } = render(() => <CodeBlock code="const x = 1;" />);
    const label = container.querySelector('.sk-code-block__label');
    expect(label).not.toBeInTheDocument();
  });

  it('renders line numbers when showLineNumbers is true', () => {
    const code = 'line1\nline2\nline3';
    const { container } = render(() => <CodeBlock code={code} showLineNumbers />);
    const gutter = container.querySelector('.sk-code-block__gutter');
    expect(gutter).toBeInTheDocument();
  });

  it('hides line numbers by default', () => {
    const { container } = render(() => <CodeBlock code="line1\nline2\nline3" />);
    const gutter = container.querySelector('.sk-code-block__gutter');
    expect(gutter).not.toBeInTheDocument();
  });

  it('correct line number count matches code lines', () => {
    const code = 'line1\nline2\nline3\nline4\nline5';
    const { container } = render(() => <CodeBlock code={code} showLineNumbers />);
    const lineNumbers = container.querySelectorAll('.sk-code-block__line-number');
    expect(lineNumbers).toHaveLength(5);
    expect(lineNumbers[0].textContent).toBe('1');
    expect(lineNumbers[4].textContent).toBe('5');
  });

  it('applies custom class', () => {
    const { container } = render(() => <CodeBlock code="const x = 1;" class="custom-class" />);
    const codeBlock = container.querySelector('.sk-code-block');
    expect(codeBlock?.classList.contains('custom-class')).toBe(true);
  });

  it('handles unknown language gracefully', () => {
    const { container } = render(() => (
      <CodeBlock code="some code" language="nonexistent-language" />
    ));
    const code = container.querySelector('.sk-code-block__code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toContain('some code');
  });

  it('renders empty code', () => {
    const { container } = render(() => <CodeBlock code="" />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code).toBeInTheDocument();
  });

  it('applies base class', () => {
    const { container } = render(() => <CodeBlock code="test" />);
    const codeBlock = container.querySelector('.sk-code-block');
    expect(codeBlock).toBeInTheDocument();
  });

  it('renders header when label is provided', () => {
    const { container } = render(() => <CodeBlock code="test" label="TypeScript" />);
    const header = container.querySelector('.sk-code-block__header');
    expect(header).toBeInTheDocument();
  });

  it('hides header when label is not provided', () => {
    const { container } = render(() => <CodeBlock code="test" />);
    const header = container.querySelector('.sk-code-block__header');
    expect(header).not.toBeInTheDocument();
  });

  it('renders pre element', () => {
    const { container } = render(() => <CodeBlock code="test" />);
    const pre = container.querySelector('.sk-code-block__pre');
    expect(pre).toBeInTheDocument();
  });

  it('renders body container', () => {
    const { container } = render(() => <CodeBlock code="test" />);
    const body = container.querySelector('.sk-code-block__body');
    expect(body).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(() => <CodeBlock code="test" style={{ width: '500px' }} />);
    const codeBlock = container.querySelector('.sk-code-block') as HTMLElement;
    expect(codeBlock.style.width).toBe('500px');
  });

  it('handles single line code', () => {
    const { container } = render(() => <CodeBlock code="single line" showLineNumbers />);
    const lineNumbers = container.querySelectorAll('.sk-code-block__line-number');
    expect(lineNumbers).toHaveLength(1);
    expect(lineNumbers[0].textContent).toBe('1');
  });

  it('combines label and line numbers', () => {
    const { container } = render(() => (
      <CodeBlock code="line1\nline2" label="TypeScript" showLineNumbers />
    ));
    const label = container.querySelector('.sk-code-block__label');
    const gutter = container.querySelector('.sk-code-block__gutter');
    expect(label).toBeInTheDocument();
    expect(gutter).toBeInTheDocument();
  });

  it('highlights TypeScript syntax', () => {
    const tsCode = 'const x: number = 42;';
    const { container } = render(() => <CodeBlock code={tsCode} language="typescript" />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code?.innerHTML).toContain('hljs');
  });

  it('highlights JSON syntax', () => {
    const jsonCode = '{"key": "value"}';
    const { container } = render(() => <CodeBlock code={jsonCode} language="json" />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code?.innerHTML).toContain('hljs');
  });

  it('auto-detects language when not specified', () => {
    const jsCode = 'function test() { return true; }';
    const { container } = render(() => <CodeBlock code={jsCode} />);
    const code = container.querySelector('.sk-code-block__code');
    expect(code?.innerHTML).toContain('hljs');
  });
});
