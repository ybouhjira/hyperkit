import { For } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

const heightTokens = [
  { name: '--sk-height-xs', value: '24px', label: 'XS', desc: 'Small badges, status dots' },
  { name: '--sk-height-sm', value: '28px', label: 'SM', desc: 'Compact buttons, tab bars' },
  { name: '--sk-height-md', value: '32px', label: 'MD', desc: 'Default buttons, inputs' },
  { name: '--sk-height-lg', value: '40px', label: 'LG', desc: 'Large buttons, search bars' },
  { name: '--sk-height-xl', value: '48px', label: 'XL', desc: 'Hero inputs, large actions' },
];

const zIndexTokens = [
  { name: '--sk-z-base', value: '0', label: 'Base' },
  { name: '--sk-z-dropdown', value: '100', label: 'Dropdown' },
  { name: '--sk-z-sticky', value: '200', label: 'Sticky' },
  { name: '--sk-z-overlay', value: '300', label: 'Overlay' },
  { name: '--sk-z-modal', value: '400', label: 'Modal' },
  { name: '--sk-z-popover', value: '500', label: 'Popover' },
  { name: '--sk-z-tooltip', value: '600', label: 'Tooltip' },
  { name: '--sk-z-toast', value: '700', label: 'Toast' },
];

function SizingShowcase() {
  return (
    <div
      style={{
        padding: '24px',
        'font-family': 'var(--sk-font-ui)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <h2 style={{ 'margin-bottom': '24px', 'font-size': '20px' }}>Component Heights</h2>
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: '12px',
          'margin-bottom': '48px',
        }}
      >
        <For each={heightTokens}>
          {(token) => (
            <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
              <code
                style={{
                  width: '160px',
                  'font-size': '12px',
                  color: 'var(--sk-text-secondary)',
                  'font-family': 'var(--sk-font-code)',
                }}
              >
                {token.name}
              </code>
              <div
                style={{
                  width: '200px',
                  height: `var(${token.name})`,
                  background: 'var(--sk-accent-muted)',
                  border: '1px solid var(--sk-accent)',
                  'border-radius': 'var(--sk-radius-sm)',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '11px',
                  color: 'var(--sk-accent)',
                  'font-weight': 600,
                }}
              >
                {token.label} — {token.value}
              </div>
              <span style={{ 'font-size': '12px', color: 'var(--sk-text-muted)' }}>
                {token.desc}
              </span>
            </div>
          )}
        </For>
      </div>

      <h2 style={{ 'margin-bottom': '24px', 'font-size': '20px' }}>Z-Index Scale</h2>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
        {zIndexTokens.map((token, i) => (
          <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
            <code
              style={{
                width: '160px',
                'font-size': '12px',
                color: 'var(--sk-text-secondary)',
                'font-family': 'var(--sk-font-code)',
              }}
            >
              {token.name}
            </code>
            <div
              style={{
                width: `${40 + i * 30}px`,
                height: '28px',
                background: 'var(--sk-accent)',
                opacity: 0.15 + i * 0.1,
                'border-radius': 'var(--sk-radius-sm)',
                display: 'flex',
                'align-items': 'center',
                'padding-left': '8px',
                'font-size': '11px',
                color: 'var(--sk-text-primary)',
                'font-weight': 500,
              }}
            >
              {token.label} ({token.value})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundation/Sizing',
  component: SizingShowcase,
  tags: ['autodocs'],
};
export default meta;

export const Scale = {};
