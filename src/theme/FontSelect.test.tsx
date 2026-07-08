import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { FontSelect } from './FontSelect';
import { ThemeProvider } from './ThemeProvider';

describe('theme/FontSelect', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('should render font selector button', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should display current font name on button', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    const text = button.textContent || '';

    // Should show either a font name or "Select Font"
    const hasFontName =
      text.length > 0 &&
      (text.includes('Code') || text.includes('Mono') || text.includes('Select'));
    expect(hasFontName).toBe(true);
  });

  it('should use controlled value prop', () => {
    const customFont = '"Custom Font", monospace';

    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect value={customFont} />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    // The button should be rendered
    expect(button.textContent).toBeTruthy();
  });

  it('should have onChange callback prop', () => {
    const onChange = vi.fn();

    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect onChange={onChange} />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    expect(button).toBeTruthy();
    // onChange prop is defined, component renders successfully
  });

  it('should display dropdown arrow indicator', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const text = container.textContent || '';
    // Should have dropdown arrow
    const hasArrow = text.includes('▼') || text.includes('▲');
    expect(hasArrow).toBe(true);
  });
});

describe('FontSelect dropdown toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('opens dropdown on button click', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    await fireEvent.click(button);

    // After clicking, there should be multiple buttons (main + font options)
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('shows up arrow when open', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    await fireEvent.click(button);

    expect(container.textContent).toContain('▲');
  });

  it('shows down arrow when closed', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    expect(container.textContent).toContain('▼');
  });

  it('closes dropdown on second click', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    await fireEvent.click(button); // open
    await fireEvent.click(button); // close

    // Should be back to just the main button
    expect(container.textContent).toContain('▼');
  });
});

describe('FontSelect font list', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('displays all font options when open', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    await fireEvent.click(button);

    const text = container.textContent || '';
    expect(text).toContain('Fira Code');
    expect(text).toContain('JetBrains Mono');
    expect(text).toContain('Cascadia Code');
    expect(text).toContain('Source Code Pro');
    expect(text).toContain('IBM Plex Mono');
    expect(text).toContain('Monaspace Neon');
    expect(text).toContain('Geist Mono');
  });

  it('renders 7 font option buttons when open', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    await fireEvent.click(button);

    // Main button + 7 font option buttons = 8 total
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(8);
  });
});

describe('FontSelect selection callback', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('calls onChange when font is selected', async () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect onChange={onChange} />
      </ThemeProvider>
    ));

    const mainButton = container.querySelector('button')!;
    await fireEvent.click(mainButton);

    // Click on a font option (e.g., the second button is the first font option)
    const buttons = container.querySelectorAll('button');
    // buttons[0] = main button, buttons[1] = Fira Code, buttons[2] = JetBrains Mono, etc.
    const jetbrainsButton = buttons[2]!;
    await fireEvent.click(jetbrainsButton);

    expect(onChange).toHaveBeenCalledWith('"JetBrains Mono", monospace');
  });

  it('closes dropdown after selection', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const mainButton = container.querySelector('button')!;
    await fireEvent.click(mainButton);

    const buttons = container.querySelectorAll('button');
    await fireEvent.click(buttons[1]!); // Select Fira Code

    // Dropdown should be closed — back to just 1 button
    const buttonsAfter = container.querySelectorAll('button');
    expect(buttonsAfter.length).toBe(1);
  });

  it('shows checkmark on selected font', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect value={'"Fira Code", monospace'} />
      </ThemeProvider>
    ));

    const mainButton = container.querySelector('button')!;
    await fireEvent.click(mainButton);

    // The selected font should have a checkmark
    const text = container.textContent || '';
    expect(text).toContain('✓');
  });

  it('updates displayed font name after selection', async () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect />
      </ThemeProvider>
    ));

    const mainButton = container.querySelector('button')!;
    await fireEvent.click(mainButton);

    const buttons = container.querySelectorAll('button');
    // Select JetBrains Mono (index 2)
    await fireEvent.click(buttons[2]!);

    // After selection, the main button text should show JetBrains Mono
    const newMainButton = container.querySelector('button')!;
    expect(newMainButton.textContent).toContain('JetBrains Mono');
  });
});

describe('FontSelect shows "Select Font" for unknown value', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('shows "Select Font" when value does not match any option', () => {
    const { container } = render(() => (
      <ThemeProvider>
        <FontSelect value="unknown-font" />
      </ThemeProvider>
    ));

    const button = container.querySelector('button')!;
    expect(button.textContent).toContain('Select Font');
  });
});
