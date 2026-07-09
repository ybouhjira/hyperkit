/**
 * Live component playground for the docs.
 *
 * SSR-safe wrapper: at build time (and before hydration) it renders the
 * snippet as a static code block, then swaps in the interactive editor +
 * live preview in the browser.
 */
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

export interface LivePlaygroundProps {
  /** Complete, runnable TSX module source (imports + `export default`). */
  code: string;
}

export default function LivePlayground({ code }: LivePlaygroundProps): React.ReactElement {
  const fallback = <CodeBlock language="tsx">{code}</CodeBlock>;
  return (
    <BrowserOnly fallback={fallback}>
      {() => {
        // Required pattern: keep the client-only impl out of the SSR bundle.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Impl = require('./PlaygroundImpl').default as React.ComponentType<{ code: string }>;
        return <Impl code={code} />;
      }}
    </BrowserOnly>
  );
}
