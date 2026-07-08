import { render, screen } from '@solidjs/testing-library';
import { MarkdownComponentsContext } from '../context';
import { renderBlockNode } from '../renderer';
import type { Component } from 'solid-js';
import type { HeadingNode, CodeBlockNode, HeadingProps, CodeBlockProps } from '../core/types';

describe('Component Override System', () => {
  it('uses default heading component', () => {
    const node: HeadingNode = {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', content: 'Default Heading' }],
    };
    render(() => renderBlockNode(node));
    const h2 = screen.getByText('Default Heading');
    expect(h2.tagName).toBe('H2');
    expect(h2.className).toBe('sk-markdown-heading');
  });

  it('uses custom heading component', () => {
    const CustomHeading: Component<HeadingProps> = (props) => (
      <div class="custom-heading" data-level={props.level}>
        {props.children}
      </div>
    );

    const node: HeadingNode = {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', content: 'Custom Heading' }],
    };

    render(() => (
      <MarkdownComponentsContext.Provider value={{ heading: CustomHeading }}>
        {renderBlockNode(node)}
      </MarkdownComponentsContext.Provider>
    ));

    const heading = screen.getByText('Custom Heading');
    expect(heading.tagName).toBe('DIV');
    expect(heading.className).toBe('custom-heading');
    expect(heading.getAttribute('data-level')).toBe('2');
  });

  it('uses custom code block component', () => {
    const CustomCodeBlock: Component<CodeBlockProps> = (props) => (
      <div class="custom-code-block" data-lang={props.lang}>
        <code>{props.content}</code>
      </div>
    );

    const node: CodeBlockNode = {
      type: 'codeBlock',
      lang: 'typescript',
      content: 'const x: number = 42;',
    };

    render(() => (
      <MarkdownComponentsContext.Provider value={{ codeBlock: CustomCodeBlock }}>
        {renderBlockNode(node)}
      </MarkdownComponentsContext.Provider>
    ));

    const block = screen.getByText('const x: number = 42;').closest('div');
    expect(block?.className).toBe('custom-code-block');
    expect(block?.getAttribute('data-lang')).toBe('typescript');
  });

  it('partial override: custom codeBlock, default heading', () => {
    const CustomCodeBlock: Component<CodeBlockProps> = (props) => (
      <div class="my-code" data-lang={props.lang}>
        {props.content}
      </div>
    );

    const headingNode: HeadingNode = {
      type: 'heading',
      level: 1,
      children: [{ type: 'text', content: 'Default H1' }],
    };

    const codeNode: CodeBlockNode = {
      type: 'codeBlock',
      lang: 'rust',
      content: 'fn main() {}',
    };

    render(() => (
      <MarkdownComponentsContext.Provider value={{ codeBlock: CustomCodeBlock }}>
        <div>
          {renderBlockNode(headingNode)}
          {renderBlockNode(codeNode)}
        </div>
      </MarkdownComponentsContext.Provider>
    ));

    // Heading uses default
    const h1 = screen.getByText('Default H1');
    expect(h1.tagName).toBe('H1');
    expect(h1.className).toBe('sk-markdown-heading');

    // CodeBlock uses custom
    const code = screen.getByText('fn main() {}').closest('div');
    expect(code?.className).toBe('my-code');
    expect(code?.getAttribute('data-lang')).toBe('rust');
  });
});
