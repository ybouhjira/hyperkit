---
sidebar_position: 5
---

# Streaming Markdown

Render Markdown content in real-time as it's generated, perfect for LLM outputs.

## Streaming Mode

Enable the `streaming` prop to optimize for incremental updates:

```tsx
import { Markdown } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function StreamingExample() {
  const [content, setContent] = createSignal('');

  return <Markdown content={content()} streaming={true} />;
}
```

## LLM Integration Example

Stream OpenAI API responses directly to the Markdown component:

```tsx
import { Markdown } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function LLMChat() {
  const [response, setResponse] = createSignal('');
  const [isStreaming, setIsStreaming] = createSignal(false);

  const streamLLMResponse = async (prompt: string) => {
    setIsStreaming(true);
    setResponse('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      setResponse((prev) => prev + chunk);
    }

    setIsStreaming(false);
  };

  return (
    <div>
      <button onClick={() => streamLLMResponse('Explain SolidJS')}>Ask AI</button>
      {isStreaming() && <div>Streaming...</div>}
      <Markdown content={response()} streaming={true} />
    </div>
  );
}
```

## Accumulating Chunks

For APIs that provide chunks rather than characters, accumulate them:

```tsx
import { createSignal } from 'solid-js';
import { Markdown } from '@ybouhjira/hyperkit';

function ChunkedStream() {
  const [chunks, setChunks] = createSignal<string[]>([]);

  // Simulate receiving chunks
  const receiveChunk = (chunk: string) => {
    setChunks([...chunks(), chunk]);
  };

  return <Markdown content={chunks().join('')} streaming={true} />;
}
```

## StreamingText Component

For simple streaming text without Markdown parsing, use the `StreamingText` component:

```tsx
import { StreamingText } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function PlainTextStream() {
  const [text, setText] = createSignal('');

  return <StreamingText content={text()} />;
}
```

## Performance Considerations

- Streaming mode re-parses the entire content on each update
- For very long documents (>5,000 lines), consider batching updates
- The parser is optimized for incremental updates but still has O(n) complexity

## Cursor Animation

Add a blinking cursor to indicate active streaming:

```tsx
import { Markdown } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

function StreamingWithCursor() {
  const [content, setContent] = createSignal('');
  const [isStreaming, setIsStreaming] = createSignal(true);

  return (
    <div class="relative">
      <Markdown content={content()} streaming={true} />
      {isStreaming() && <span class="inline-block w-2 h-5 ml-1 bg-black animate-pulse" />}
    </div>
  );
}
```

## Error Handling

Handle streaming errors gracefully:

```tsx
import { createSignal } from 'solid-js';
import { Markdown } from '@ybouhjira/hyperkit';

function RobustStream() {
  const [content, setContent] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const streamContent = async () => {
    try {
      // Streaming logic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream failed');
    }
  };

  return (
    <div>
      {error() ? (
        <div class="error">{error()}</div>
      ) : (
        <Markdown content={content()} streaming={true} />
      )}
    </div>
  );
}
```

## Next Steps

- Learn about [Custom Components](./custom-components)
- Browse the [Markdown component API](../components/display/Markdown.mdx)
