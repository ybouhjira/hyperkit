import { createSignal, onMount, For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';

const TokenShowcase = () => <div />;

const meta: Meta<typeof TokenShowcase> = {
  title: 'Foundation/Typography',
  component: TokenShowcase,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TokenShowcase>;

const sampleText = 'The quick brown fox jumps over the lazy dog';
const sampleCode = 'const greeting = "Hello, World!";';

interface TypeSize {
  name: string;
  token: string;
  description: string;
}

const typeSizes: TypeSize[] = [
  { name: 'Extra Small', token: '--sk-font-xs', description: 'Captions, labels' },
  { name: 'Small', token: '--sk-font-sm', description: 'Secondary text' },
  { name: 'Medium', token: '--sk-font-md', description: 'Body text' },
  { name: 'Large', token: '--sk-font-lg', description: 'Headings' },
  { name: 'Extra Large', token: '--sk-font-xl', description: 'Hero text' },
];

const weights = [
  { name: 'Normal', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Semibold', value: '600' },
  { name: 'Bold', value: '700' },
];

const TypeSample = (props: { size: TypeSize }) => {
  const [value, setValue] = createSignal('');

  onMount(() => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(props.size.token)
      .trim();
    setValue(computedValue);
  });

  return (
    <div
      style={{
        padding: '24px',
        background: 'var(--sk-bg-secondary)',
        'border-radius': '8px',
        border: '1px solid var(--sk-border)',
      }}
    >
      <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '12px' }}>
        <div>
          <div style={{ 'font-size': '14px', 'font-weight': '600', color: 'var(--sk-text)' }}>
            {props.size.name}
          </div>
          <div
            style={{
              'font-size': '12px',
              'font-family': 'var(--sk-font-code)',
              color: 'var(--sk-text-muted)',
            }}
          >
            {props.size.token}
          </div>
        </div>
        <div
          style={{
            'font-size': '12px',
            'font-family': 'var(--sk-font-code)',
            color: 'var(--sk-accent-muted)',
          }}
        >
          {value()}
        </div>
      </div>
      <div
        style={{
          'font-size': `var(${props.size.token})`,
          color: 'var(--sk-text)',
          'line-height': '1.5',
        }}
      >
        {sampleText}
      </div>
      <div style={{ 'font-size': '12px', color: 'var(--sk-text-muted)', 'margin-top': '8px' }}>
        {props.size.description}
      </div>
    </div>
  );
};

export const TypeScale: Story = {
  render: () => (
    <div style={{ padding: '32px', background: 'var(--sk-bg)' }}>
      <div style={{ 'max-width': '900px', margin: '0 auto' }}>
        <h1
          style={{
            'font-size': '32px',
            'font-weight': '700',
            color: 'var(--sk-text)',
            'margin-bottom': '8px',
          }}
        >
          Type Scale
        </h1>
        <p
          style={{
            'font-size': '16px',
            color: 'var(--sk-text-muted)',
            'margin-bottom': '48px',
          }}
        >
          A harmonious type scale for consistent hierarchy and readability.
        </p>

        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
          <For each={typeSizes}>{(size) => <TypeSample size={size} />}</For>
        </div>
      </div>
    </div>
  ),
};

export const FontFamilies: Story = {
  render: () => {
    const [uiFontValue, setUiFontValue] = createSignal('');
    const [codeFontValue, setCodeFontValue] = createSignal('');

    onMount(() => {
      const uiFont = getComputedStyle(document.documentElement)
        .getPropertyValue('--sk-font-ui')
        .trim();
      const codeFont = getComputedStyle(document.documentElement)
        .getPropertyValue('--sk-font-code')
        .trim();
      setUiFontValue(uiFont);
      setCodeFontValue(codeFont);
    });

    return (
      <div style={{ padding: '32px', background: 'var(--sk-bg)' }}>
        <div style={{ 'max-width': '900px', margin: '0 auto' }}>
          <h1
            style={{
              'font-size': '32px',
              'font-weight': '700',
              color: 'var(--sk-text)',
              'margin-bottom': '8px',
            }}
          >
            Font Families
          </h1>
          <p
            style={{
              'font-size': '16px',
              color: 'var(--sk-text-muted)',
              'margin-bottom': '48px',
            }}
          >
            Two font families: UI for interface elements, Code for technical content.
          </p>

          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '24px' }}>
            {/* UI Font */}
            <div
              style={{
                padding: '32px',
                background: 'var(--sk-bg-secondary)',
                'border-radius': '8px',
                border: '1px solid var(--sk-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'margin-bottom': '16px',
                }}
              >
                <div>
                  <div
                    style={{ 'font-size': '18px', 'font-weight': '600', color: 'var(--sk-text)' }}
                  >
                    UI Font
                  </div>
                  <div
                    style={{
                      'font-size': '12px',
                      'font-family': 'var(--sk-font-code)',
                      color: 'var(--sk-text-muted)',
                    }}
                  >
                    --sk-font-ui
                  </div>
                </div>
                <div
                  style={{
                    'font-size': '12px',
                    'font-family': 'var(--sk-font-code)',
                    color: 'var(--sk-accent-muted)',
                  }}
                >
                  {uiFontValue()}
                </div>
              </div>
              <div
                style={{
                  'font-family': 'var(--sk-font-ui)',
                  'font-size': '24px',
                  color: 'var(--sk-text)',
                  'line-height': '1.5',
                }}
              >
                {sampleText}
              </div>
              <div
                style={{
                  'font-family': 'var(--sk-font-ui)',
                  'font-size': '16px',
                  color: 'var(--sk-text-muted)',
                  'margin-top': '16px',
                }}
              >
                Used for all interface elements: buttons, labels, headings, body text.
              </div>
            </div>

            {/* Code Font */}
            <div
              style={{
                padding: '32px',
                background: 'var(--sk-bg-secondary)',
                'border-radius': '8px',
                border: '1px solid var(--sk-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  'justify-content': 'space-between',
                  'margin-bottom': '16px',
                }}
              >
                <div>
                  <div
                    style={{ 'font-size': '18px', 'font-weight': '600', color: 'var(--sk-text)' }}
                  >
                    Code Font
                  </div>
                  <div
                    style={{
                      'font-size': '12px',
                      'font-family': 'var(--sk-font-code)',
                      color: 'var(--sk-text-muted)',
                    }}
                  >
                    --sk-font-code
                  </div>
                </div>
                <div
                  style={{
                    'font-size': '12px',
                    'font-family': 'var(--sk-font-code)',
                    color: 'var(--sk-accent-muted)',
                  }}
                >
                  {codeFontValue()}
                </div>
              </div>
              <div
                style={{
                  'font-family': 'var(--sk-font-code)',
                  'font-size': '18px',
                  color: 'var(--sk-text)',
                  'line-height': '1.5',
                }}
              >
                {sampleCode}
              </div>
              <div
                style={{
                  'font-family': 'var(--sk-font-ui)',
                  'font-size': '16px',
                  color: 'var(--sk-text-muted)',
                  'margin-top': '16px',
                }}
              >
                Used for code blocks, inline code, and technical content.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const Weights: Story = {
  render: () => (
    <div style={{ padding: '32px', background: 'var(--sk-bg)' }}>
      <div style={{ 'max-width': '900px', margin: '0 auto' }}>
        <h1
          style={{
            'font-size': '32px',
            'font-weight': '700',
            color: 'var(--sk-text)',
            'margin-bottom': '8px',
          }}
        >
          Font Weights
        </h1>
        <p
          style={{
            'font-size': '16px',
            color: 'var(--sk-text-muted)',
            'margin-bottom': '48px',
          }}
        >
          Font weight variants for establishing visual hierarchy.
        </p>

        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
          <For each={weights}>
            {(weight) => (
              <div
                style={{
                  padding: '24px',
                  background: 'var(--sk-bg-secondary)',
                  'border-radius': '8px',
                  border: '1px solid var(--sk-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'margin-bottom': '12px',
                  }}
                >
                  <div
                    style={{ 'font-size': '14px', 'font-weight': '600', color: 'var(--sk-text)' }}
                  >
                    {weight.name}
                  </div>
                  <div
                    style={{
                      'font-size': '12px',
                      'font-family': 'var(--sk-font-code)',
                      color: 'var(--sk-accent-muted)',
                    }}
                  >
                    {weight.value}
                  </div>
                </div>
                <div
                  style={{
                    'font-size': 'var(--sk-font-md)',
                    'font-weight': weight.value,
                    color: 'var(--sk-text)',
                    'line-height': '1.5',
                  }}
                >
                  {sampleText}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  ),
};
