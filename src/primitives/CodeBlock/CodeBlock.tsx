import { type JSX, type Component, splitProps, createMemo, Show, For } from 'solid-js';
import { highlightCode } from './hljs';
import './CodeBlock.css';

/** Props for the CodeBlock component. */
export interface CodeBlockProps {
  /** Code content to display. */
  code: string;
  /** Syntax highlighting language. If omitted, auto-detects language. */
  language?: string;
  /** Optional label shown in the header. */
  label?: string;
  /** Show line numbers in the gutter.
   * @default false */
  showLineNumbers?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

/** Syntax-highlighted code block with optional line numbers and language label. */
export const CodeBlock: Component<CodeBlockProps> = (props) => {
  const [local, others] = splitProps(props, [
    'code',
    'language',
    'label',
    'showLineNumbers',
    'class',
    'style',
  ]);

  const highlighted = createMemo(() => highlightCode(local.code, local.language));

  const lineCount = createMemo(() => local.code.split('\n').length);

  const lineNumbers = createMemo(() => {
    const count = lineCount();
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  return (
    <div class={`sk-code-block ${local.class ?? ''}`} style={local.style} {...others}>
      <Show when={local.label}>
        <div class="sk-code-block__header">
          <span class="sk-code-block__label">{local.label}</span>
        </div>
      </Show>
      <div class="sk-code-block__body">
        <Show when={local.showLineNumbers}>
          <div class="sk-code-block__gutter">
            <For each={lineNumbers()}>
              {(lineNum) => <div class="sk-code-block__line-number">{lineNum}</div>}
            </For>
          </div>
        </Show>
        <pre class="sk-code-block__pre">
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <code class="sk-code-block__code" innerHTML={highlighted()} />
        </pre>
      </div>
    </div>
  );
};
