import { Component, createSignal, For } from 'solid-js';
import { useTheme } from './useTheme';
import './FontSelect.css';

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
    <div class="sk-font-select">
      <button class="sk-font-select__trigger" onClick={() => setIsOpen(!isOpen())}>
        {/* font-family is theme data (the selected font itself), not chrome */}
        <span style={{ 'font-family': currentFont() }}>{getCurrentFontName()}</span>
        <span class="sk-font-select__arrow">{isOpen() ? '▲' : '▼'}</span>
      </button>

      {isOpen() && (
        <div class="sk-font-select__dropdown">
          <For each={FONT_OPTIONS}>
            {(font) => {
              const isSelected = () => currentFont() === font.family;

              return (
                <button
                  classList={{
                    'sk-font-select__option': true,
                    'sk-font-select__option--selected': isSelected(),
                  }}
                  onClick={() => handleSelect(font)}
                  // font-family is option data (each row previews its own font), not chrome
                  style={{ 'font-family': font.family }}
                >
                  <span>{font.name}</span>
                  {isSelected() && <span class="sk-font-select__check">✓</span>}
                </button>
              );
            }}
          </For>
        </div>
      )}
    </div>
  );
};
