import { For } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

const durationTokens = [
  { name: '--sk-duration-instant', value: '50ms' },
  { name: '--sk-duration-fast', value: '100ms' },
  { name: '--sk-duration-normal', value: '200ms' },
  { name: '--sk-duration-slow', value: '300ms' },
  { name: '--sk-duration-slower', value: '500ms' },
];

const easingTokens = [
  { name: '--sk-ease-default', value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Default' },
  { name: '--sk-ease-in', value: 'cubic-bezier(0.4, 0, 1, 1)', label: 'Ease In' },
  { name: '--sk-ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Ease Out' },
  { name: '--sk-ease-in-out', value: 'cubic-bezier(0.4, 0, 0.6, 1)', label: 'Ease In Out' },
  { name: '--sk-ease-bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'Bounce' },
];

const lineHeightTokens = [
  { name: '--sk-leading-none', value: '1' },
  { name: '--sk-leading-tight', value: '1.25' },
  { name: '--sk-leading-snug', value: '1.375' },
  { name: '--sk-leading-normal', value: '1.5' },
  { name: '--sk-leading-relaxed', value: '1.75' },
  { name: '--sk-leading-loose', value: '2' },
];

function TransitionsShowcase() {
  return (
    <div
      style={{
        padding: '24px',
        'font-family': 'var(--sk-font-ui)',
        color: 'var(--sk-text-primary)',
      }}
    >
      <h2 style={{ 'margin-bottom': '16px', 'font-size': '20px' }}>Transition Durations</h2>
      <p
        style={{ 'margin-bottom': '24px', 'font-size': '13px', color: 'var(--sk-text-secondary)' }}
      >
        Hover over each box to see the transition speed.
      </p>
      <div style={{ display: 'flex', gap: '12px', 'margin-bottom': '48px', 'flex-wrap': 'wrap' }}>
        <For each={durationTokens}>
          {(token) => (
            <div
              class="sk-transition-demo"
              style={{
                width: '120px',
                height: '80px',
                background: 'var(--sk-bg-secondary)',
                border: '1px solid var(--sk-border)',
                'border-radius': 'var(--sk-radius-md)',
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: `all var(${token.name}) var(--sk-ease-default)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sk-accent)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--sk-bg-secondary)';
                e.currentTarget.style.color = 'var(--sk-text-primary)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ 'font-weight': 600, 'font-size': '13px' }}>{token.value}</span>
              <code
                style={{ 'font-size': '10px', opacity: 0.7, 'font-family': 'var(--sk-font-code)' }}
              >
                {token.name.replace('--sk-duration-', '')}
              </code>
            </div>
          )}
        </For>
      </div>

      <h2 style={{ 'margin-bottom': '16px', 'font-size': '20px' }}>Easing Functions</h2>
      <p
        style={{ 'margin-bottom': '24px', 'font-size': '13px', color: 'var(--sk-text-secondary)' }}
      >
        Hover to see each easing curve in action.
      </p>
      <div style={{ display: 'flex', gap: '12px', 'margin-bottom': '48px', 'flex-wrap': 'wrap' }}>
        <For each={easingTokens}>
          {(token) => (
            <div
              style={{
                width: '140px',
                height: '80px',
                background: 'var(--sk-bg-secondary)',
                border: '1px solid var(--sk-border)',
                'border-radius': 'var(--sk-radius-md)',
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: `all var(--sk-duration-slow) var(${token.name})`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sk-accent)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--sk-bg-secondary)';
                e.currentTarget.style.color = 'var(--sk-text-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ 'font-weight': 600, 'font-size': '13px' }}>{token.label}</span>
              <code
                style={{ 'font-size': '9px', opacity: 0.7, 'font-family': 'var(--sk-font-code)' }}
              >
                {token.name.replace('--sk-ease-', '')}
              </code>
            </div>
          )}
        </For>
      </div>

      <h2 style={{ 'margin-bottom': '24px', 'font-size': '20px' }}>Line Heights</h2>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
        <For each={lineHeightTokens}>
          {(token) => (
            <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '16px' }}>
              <code
                style={{
                  width: '200px',
                  'flex-shrink': 0,
                  'font-size': '12px',
                  color: 'var(--sk-text-secondary)',
                  'font-family': 'var(--sk-font-code)',
                  'padding-top': '2px',
                }}
              >
                {token.name} <span style={{ color: 'var(--sk-text-muted)' }}>({token.value})</span>
              </code>
              <p
                style={{
                  'line-height': `var(${token.name})`,
                  'font-size': '14px',
                  background: 'var(--sk-bg-secondary)',
                  padding: '8px 12px',
                  'border-radius': 'var(--sk-radius-sm)',
                  'max-width': '400px',
                }}
              >
                The quick brown fox jumps over the lazy dog. This sample text demonstrates the line
                height value.
              </p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundation/Transitions',
  component: TransitionsShowcase,
  tags: ['autodocs'],
};
export default meta;

export const Scale = {};
