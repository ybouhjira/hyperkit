import { For } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

const spacingTokens = [
  { name: '--sk-space-0', value: '0px' },
  { name: '--sk-space-px', value: '1px' },
  { name: '--sk-space-2xs', value: '2px' },
  { name: '--sk-space-xs', value: '4px' },
  { name: '--sk-space-sm', value: '8px' },
  { name: '--sk-space-md', value: '16px' },
  { name: '--sk-space-lg', value: '24px' },
  { name: '--sk-space-xl', value: '32px' },
  { name: '--sk-space-2xl', value: '48px' },
  { name: '--sk-space-3xl', value: '64px' },
  { name: '--sk-space-4xl', value: '96px' },
];

function SpacingShowcase() {
  return (
    <div
      style={{
        padding: '24px',
        'font-family': 'var(--sk-font-ui)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <h2 style={{ 'margin-bottom': '24px', 'font-size': '20px' }}>Spacing Scale</h2>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
        <For each={spacingTokens}>
          {(token) => (
            <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
              <code
                style={{
                  width: '180px',
                  'font-size': '12px',
                  color: 'var(--sk-text-secondary)',
                  'font-family': 'var(--sk-font-code)',
                }}
              >
                {token.name}
              </code>
              <span
                style={{
                  width: '50px',
                  'font-size': '12px',
                  color: 'var(--sk-text-muted)',
                  'text-align': 'right',
                }}
              >
                {token.value}
              </span>
              <div
                style={{
                  width: `var(${token.name})`,
                  height: '16px',
                  background: 'var(--sk-accent)',
                  'border-radius': '2px',
                  'min-width': token.value === '0px' ? '2px' : undefined,
                  opacity: token.value === '0px' ? 0.3 : 1,
                }}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundation/Spacing',
  component: SpacingShowcase,
  tags: ['autodocs'],
};
export default meta;

export const Scale = {};
