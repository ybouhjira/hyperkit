import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { ColorInput } from './ColorInput';

describe('ColorInput', () => {
  it('renders with default color', () => {
    render(() => <ColorInput />);
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toBe('#000000');
  });

  it('shows color swatch', () => {
    render(() => <ColorInput defaultValue="#ff5500" />);
    const swatch = screen.getByLabelText('Choose color') as HTMLButtonElement;
    expect(swatch.style.background).toBe('rgb(255, 85, 0)');
  });

  it('shows hex value in text input', () => {
    render(() => <ColorInput defaultValue="#ff5500" />);
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toBe('#FF5500');
  });

  it('shows RGB format when specified', () => {
    render(() => <ColorInput defaultValue="#ff5500" format="rgb" />);
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toBe('rgb(255, 85, 0)');
  });

  it('shows HSL format when specified', () => {
    render(() => <ColorInput defaultValue="#ff5500" format="hsl" />);
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('calls onChange on color change', async () => {
    const handleChange = vi.fn();
    render(() => <ColorInput onChange={handleChange} />);

    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    textInput.value = '#ff0000';
    fireEvent.input(textInput);
    fireEvent.blur(textInput);

    expect(handleChange).toHaveBeenCalledWith('#ff0000');
  });

  it('preset swatches render and click works', () => {
    const handleChange = vi.fn();
    const presets = ['#ff0000', '#00ff00', '#0000ff'];
    render(() => <ColorInput presets={presets} onChange={handleChange} />);

    const presetButtons = screen.getAllByLabelText(/Preset color/);
    expect(presetButtons).toHaveLength(3);

    fireEvent.click(presetButtons[0]);
    expect(handleChange).toHaveBeenCalledWith('#ff0000');
  });

  it('handles disabled state', () => {
    render(() => <ColorInput disabled />);
    const swatch = screen.getByLabelText('Choose color') as HTMLButtonElement;
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;

    expect(swatch.disabled).toBe(true);
    expect(textInput.disabled).toBe(true);
  });

  it('applies custom class', () => {
    const { container } = render(() => <ColorInput class="custom-class" />);
    const colorInput = container.querySelector('.sk-color-input');
    expect(colorInput?.classList.contains('custom-class')).toBe(true);
  });

  it('renders label when provided', () => {
    render(() => <ColorInput label="Pick a color" />);
    expect(screen.getByText('Pick a color')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(() => <ColorInput size="sm" />);
    const colorInput = container.querySelector('.sk-color-input');
    expect(colorInput?.classList.contains('sk-color-input--sm')).toBe(true);
  });

  it('shows alpha slider when showAlpha is true', () => {
    render(() => <ColorInput showAlpha />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    const slider = document.querySelector('.sk-color-input__alpha-slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
  });

  it('updates text input when format changes', () => {
    const { unmount } = render(() => <ColorInput defaultValue="#ff5500" format="hex" />);
    let textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toBe('#FF5500');
    unmount();

    render(() => <ColorInput defaultValue="#ff5500" format="rgb" />);
    textInput = screen.getByLabelText('Color value') as HTMLInputElement;
    expect(textInput.value).toBe('rgb(255, 85, 0)');
  });

  it('validates hex input and resets on invalid value', () => {
    render(() => <ColorInput defaultValue="#ff5500" />);
    const textInput = screen.getByLabelText('Color value') as HTMLInputElement;

    textInput.value = 'invalid';
    fireEvent.input(textInput);
    fireEvent.blur(textInput);

    expect(textInput.value).toBe('#FF5500'); // Reset to previous valid value
  });
});
