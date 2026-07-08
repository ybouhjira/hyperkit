---
sidebar_position: 6
---

# Custom Components

Build advanced custom renderers for Markdown elements.

## Custom Code Editor

Replace code blocks with an interactive editor:

````tsx
import { Markdown } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function EditableCodeBlock(props: { language?: string; code: string }) {
  const [code, setCode] = createSignal(props.code);

  return (
    <div class="code-editor">
      <div class="toolbar">
        <span>{props.language || 'text'}</span>
        <button onClick={() => runCode(code())}>Run</button>
      </div>
      <textarea value={code()} onInput={(e) => setCode(e.currentTarget.value)} class="code-input" />
    </div>
  );
}

function CodePlayground() {
  return (
    <Markdown
      content="```javascript\nconsole.log('Hello');\n```"
      components={{ codeBlock: EditableCodeBlock }}
    />
  );
}
````

## Lazy Loading Images

Optimize image loading with intersection observer:

```tsx
import { createSignal, onMount } from 'solid-js';

function LazyImage(props: { url: string; alt: string }) {
  const [isVisible, setIsVisible] = createSignal(false);
  let imgRef: HTMLImageElement | undefined;

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef) observer.observe(imgRef);
  });

  return (
    <img
      ref={imgRef}
      src={isVisible() ? props.url : undefined}
      alt={props.alt}
      class="lazy-image"
    />
  );
}

<Markdown content="![Large Image](large.jpg)" components={{ image: LazyImage }} />;
```

## Heading with Anchor Links

Add anchor links to headings for deep linking:

```tsx
function HeadingWithAnchor(props: { level: 1 | 2 | 3 | 4 | 5 | 6; children: any }) {
  const text = () => props.children.toString();
  const id = () =>
    text()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  const Tag = `h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag id={id()} class="heading-with-anchor">
      <a href={`#${id()}`} class="anchor-link">
        #
      </a>
      {props.children}
    </Tag>
  );
}

<Markdown content="# My Section\n\nContent here." components={{ heading: HeadingWithAnchor }} />;
```

## Table with Sorting

Create sortable tables from Markdown:

```tsx
import { createSignal, For } from 'solid-js';

function SortableTable(props: { header: any[][]; rows: any[][][] }) {
  const [sortColumn, setSortColumn] = createSignal<number | null>(null);
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');

  const sortedRows = () => {
    const col = sortColumn();
    if (col === null) return props.rows;

    return [...props.rows].sort((a, b) => {
      const aVal = a[col]?.toString() || '';
      const bVal = b[col]?.toString() || '';
      const compare = aVal.localeCompare(bVal);
      return sortDirection() === 'asc' ? compare : -compare;
    });
  };

  const toggleSort = (index: number) => {
    if (sortColumn() === index) {
      setSortDirection(sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(index);
      setSortDirection('asc');
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <For each={props.header[0]}>
            {(cell, index) => (
              <th onClick={() => toggleSort(index())}>
                {cell} {sortColumn() === index() && (sortDirection() === 'asc' ? '↑' : '↓')}
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={sortedRows()}>
          {(row) => (
            <tr>
              <For each={row}>{(cell) => <td>{cell}</td>}</For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
```

## Copy Button for Code Blocks

Add a copy-to-clipboard button to code blocks:

```tsx
import { createSignal } from 'solid-js';

function CodeBlockWithCopy(props: { language?: string; code: string }) {
  const [copied, setCopied] = createSignal(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(props.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="relative">
      <button
        onClick={copyCode}
        class="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white rounded"
      >
        {copied() ? 'Copied!' : 'Copy'}
      </button>
      <pre class={`language-${props.language || 'text'}`}>
        <code>{props.code}</code>
      </pre>
    </div>
  );
}
```

## Next Steps

- Browse the [Markdown component API](../components/display/Markdown.md) for all available props
- See [Streaming Markdown](./streaming-markdown) for real-time rendering patterns
