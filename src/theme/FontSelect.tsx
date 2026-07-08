import { Component, createSignal, For } from 'solid-js';
import { useTheme } from './useTheme';

interface FontOption {
  name: string;
  family: string;
}

const FONT_OPTIONS: FontOption[] = [
  { name: 'Fira Code', family: '"Fira Code", monospace' },
  { name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { name: 'Cascadia Code', family: '"Cascadia Code", monospace' },
  { name: 'Source Code Pro', family: '"Source Code Pro", monospace' },
  { name: 'IBM Plex Mono', family: '"IBM Plex Mono", monospace' },
  { name: 'Monaspace Neon', family: '"Monaspace Neon", monospace' },
  { name: 'Geist Mono', family: '"Geist Mono", monospace' },
];

interface FontSelectProps {
  value?: string;
  onChange?: (font: string) => void;
}

export const FontSelect: Component<FontSelectProps> = (props) => {
  const { theme, customizeTheme } = useTheme();
  const [isOpen, setIsOpen] = createSignal(false);

  const currentFont = () => props.value || theme().fonts.code;

  const handleSelect = (font: FontOption) => {
    customizeTheme({
      fonts: {
        ...theme().fonts,
        code: font.family,
      },
    });
    props.onChange?.(font.family);
    setIsOpen(false);
  };

  const getCurrentFontName = () => {
    const current = currentFont();
    const option = FONT_OPTIONS.find((f) => f.family === current);
    return option?.name || 'Select Font';
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setIsOpen(!isOpen())}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'var(--sk-bg-secondary)',
          border: '1px solid var(--sk-border)',
          'border-radius': 'var(--sk-radius-md)',
          color: 'var(--sk-text-primary)',
          'font-family': 'var(--sk-font-ui)',
          'font-size': 'var(--sk-font-size-base)',
          cursor: 'pointer',
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--sk-accent-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--sk-border)';
        }}
      >
        <span style={{ 'font-family': currentFont() }}>{getCurrentFontName()}</span>
        <span style={{ 'margin-left': '0.5rem' }}>{isOpen() ? '▲' : '▼'}</span>
      </button>

      {isOpen() && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: '0',
            right: '0',
            background: 'var(--sk-bg-elevated)',
            border: '1px solid var(--sk-border)',
            'border-radius': 'var(--sk-radius-md)',
            'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
            'max-height': '300px',
            'overflow-y': 'auto',
            'z-index': '1000',
          }}
        >
          <For each={FONT_OPTIONS}>
            {(font) => {
              const isSelected = () => currentFont() === font.family;

              return (
                <button
                  onClick={() => handleSelect(font)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: isSelected() ? 'var(--sk-accent-muted)' : 'transparent',
                    border: 'none',
                    color: 'var(--sk-text-primary)',
                    'font-family': font.family,
                    'font-size': 'var(--sk-font-size-base)',
                    cursor: 'pointer',
                    'text-align': 'left',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected()) {
                      e.currentTarget.style.background = 'var(--sk-bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected()) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{font.name}</span>
                  {isSelected() && <span style={{ color: 'var(--sk-accent)' }}>✓</span>}
                </button>
              );
            }}
          </For>
        </div>
      )}
    </div>
  );
};
