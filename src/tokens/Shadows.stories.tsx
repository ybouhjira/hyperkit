import { For } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

const shadowTokens = [
  { name: '--sk-shadow-sm', label: 'Small', desc: 'Cards, buttons' },
  { name: '--sk-shadow-md', label: 'Medium', desc: 'Dropdowns, popovers' },
  { name: '--sk-shadow-lg', label: 'Large', desc: 'Modals, dialogs' },
  { name: '--sk-shadow-xl', label: 'Extra Large', desc: 'Floating panels' },
  { name: '--sk-shadow-2xl', label: '2X Large', desc: 'Command palette' },
  { name: '--sk-shadow-inner', label: 'Inner', desc: 'Inset elements' },
];

function ShadowShowcase() {
  return (
    <div
      style={{
        padding: '24px',
        'font-family': 'var(--sk-font-ui)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <h2 style={{ 'margin-bottom': '24px', 'font-size': '20px' }}>Shadow Scale</h2>
      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '24px' }}>
        <For each={shadowTokens}>
          {(token) => (
            <div
              style={{
                padding: '24px',
                background: 'var(--sk-bg-secondary)',
                'border-radius': 'var(--sk-radius-lg)',
                'box-shadow': `var(${token.name})`,
                display: 'flex',
                'flex-direction': 'column',
                gap: '8px',
              }}
            >
              <span style={{ 'font-weight': 600, 'font-size': '14px' }}>{token.label}</span>
              <code
                style={{
                  'font-size': '11px',
                  color: 'var(--sk-text-secondary)',
                  'font-family': 'var(--sk-font-code)',
                }}
              >
                {token.name}
              </code>
              <span style={{ 'font-size': '12px', color: 'var(--sk-text-muted)' }}>
                {token.desc}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundation/Shadows',
  component: ShadowShowcase,
  tags: ['autodocs'],
};
export default meta;

export const Scale = {};
