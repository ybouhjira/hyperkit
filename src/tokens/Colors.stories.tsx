import { createSignal, onMount, For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';

const TokenShowcase = () => <div />;

const meta: Meta<typeof TokenShowcase> = {
  title: 'Foundation/Colors',
  component: TokenShowcase,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TokenShowcase>;

interface ColorToken {
  name: string;
  token: string;
  category: string;
}

const colorTokens: ColorToken[] = [
  // Background
  { name: 'Background', token: '--sk-bg', category: 'Background' },
  { name: 'Background Hover', token: '--sk-bg-hover', category: 'Background' },
  { name: 'Background Active', token: '--sk-bg-active', category: 'Background' },
  { name: 'Background Secondary', token: '--sk-bg-secondary', category: 'Background' },

  // Text
  { name: 'Text', token: '--sk-text', category: 'Text' },
  { name: 'Text Muted', token: '--sk-text-muted', category: 'Text' },
  { name: 'Text Inverse', token: '--sk-text-inverse', category: 'Text' },

  // Accent
  { name: 'Accent', token: '--sk-accent', category: 'Accent' },
  { name: 'Accent Hover', token: '--sk-accent-hover', category: 'Accent' },
  { name: 'Accent Muted', token: '--sk-accent-muted', category: 'Accent' },

  // Border
  { name: 'Border', token: '--sk-border', category: 'Border' },
  { name: 'Border Strong', token: '--sk-border-strong', category: 'Border' },

  // Semantic
  { name: 'Success', token: '--sk-success', category: 'Semantic' },
  { name: 'Warning', token: '--sk-warning', category: 'Semantic' },
  { name: 'Danger', token: '--sk-danger', category: 'Semantic' },
  { name: 'Info', token: '--sk-info', category: 'Semantic' },

  // Code
  { name: 'Code Background', token: '--sk-code-bg', category: 'Code' },
];

const ColorSwatch = (props: { token: ColorToken }) => {
  const [value, setValue] = createSignal('');

  onMount(() => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(props.token.token)
      .trim();
    setValue(computedValue);
  });

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
        'align-items': 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          'border-radius': '8px',
          background: `var(${props.token.token})`,
          border: '1px solid var(--sk-border)',
          'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      />
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '2px',
        }}
      >
        <div
          style={{
            'font-size': '12px',
            'font-weight': '500',
            color: 'var(--sk-text)',
            'text-align': 'center',
          }}
        >
          {props.token.name}
        </div>
        <div
          style={{
            'font-size': '11px',
            'font-family': 'var(--sk-font-code)',
            color: 'var(--sk-text-muted)',
          }}
        >
          {props.token.token}
        </div>
        <div
          style={{
            'font-size': '10px',
            'font-family': 'var(--sk-font-code)',
            color: 'var(--sk-accent-muted)',
          }}
        >
          {value()}
        </div>
      </div>
    </div>
  );
};

export const AllColors: Story = {
  render: () => {
    const categories = ['Background', 'Text', 'Accent', 'Border', 'Semantic', 'Code'];

    return (
      <div style={{ padding: '32px', background: 'var(--sk-bg)' }}>
        <div style={{ 'max-width': '1200px', margin: '0 auto' }}>
          <h1
            style={{
              'font-size': '32px',
              'font-weight': '700',
              color: 'var(--sk-text)',
              'margin-bottom': '8px',
            }}
          >
            Color Tokens
          </h1>
          <p
            style={{
              'font-size': '16px',
              color: 'var(--sk-text-muted)',
              'margin-bottom': '48px',
            }}
          >
            All color tokens adapt to the current theme. Switch themes to see the values change.
          </p>

          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '48px' }}>
            <For each={categories}>
              {(category) => {
                const tokens = colorTokens.filter((t) => t.category === category);
                return (
                  <div>
                    <h2
                      style={{
                        'font-size': '20px',
                        'font-weight': '600',
                        color: 'var(--sk-text)',
                        'margin-bottom': '24px',
                      }}
                    >
                      {category}
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        'grid-template-columns': 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '24px',
                      }}
                    >
                      <For each={tokens}>{(token) => <ColorSwatch token={token} />}</For>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    );
  },
};

export const Semantic: Story = {
  render: () => {
    const semanticTokens = colorTokens.filter((t) => t.category === 'Semantic');

    return (
      <div style={{ padding: '32px', background: 'var(--sk-bg)' }}>
        <div style={{ 'max-width': '800px', margin: '0 auto' }}>
          <h1
            style={{
              'font-size': '32px',
              'font-weight': '700',
              color: 'var(--sk-text)',
              'margin-bottom': '8px',
            }}
          >
            Semantic Colors
          </h1>
          <p
            style={{
              'font-size': '16px',
              color: 'var(--sk-text-muted)',
              'margin-bottom': '48px',
            }}
          >
            Semantic colors communicate status and intent.
          </p>

          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '32px' }}>
            {/* Color swatches */}
            <div
              style={{
                display: 'grid',
                'grid-template-columns': 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '24px',
              }}
            >
              <For each={semanticTokens}>{(token) => <ColorSwatch token={token} />}</For>
            </div>

            {/* Example usage */}
            <div>
              <h3
                style={{
                  'font-size': '18px',
                  'font-weight': '600',
                  color: 'var(--sk-text)',
                  'margin-bottom': '16px',
                }}
              >
                Example Usage
              </h3>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    'border-radius': '6px',
                    background: 'var(--sk-success)',
                    color: 'white',
                    'font-size': '14px',
                  }}
                >
                  Success: Changes saved successfully
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    'border-radius': '6px',
                    background: 'var(--sk-warning)',
                    color: 'white',
                    'font-size': '14px',
                  }}
                >
                  Warning: This action cannot be undone
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    'border-radius': '6px',
                    background: 'var(--sk-danger)',
                    color: 'white',
                    'font-size': '14px',
                  }}
                >
                  Danger: Failed to connect to server
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    'border-radius': '6px',
                    background: 'var(--sk-info)',
                    color: 'white',
                    'font-size': '14px',
                  }}
                >
                  Info: 5 new updates available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
