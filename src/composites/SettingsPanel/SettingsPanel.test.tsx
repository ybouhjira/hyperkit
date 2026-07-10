/** @jsxImportSource solid-js */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@solidjs/testing-library';
import { SettingsPanel } from './SettingsPanel';
import { AppearancePanel } from './AppearancePanel';
import { AnimationPanel } from './AnimationPanel';
import { LayoutPanel } from './LayoutPanel';
import { createSettingsStore } from './SettingsPanel';
import type { SettingsConfig } from './types';

const mockSettings: SettingsConfig = {
  appearance: { themeId: 'light', fontSize: 16 },
  animation: { enabled: true, speed: 'normal' },
  layout: { sidebarOpen: true, density: 'normal' },
};

beforeEach(() => {
  localStorage.clear();
});

describe('composites/SettingsPanel', () => {
  it('should render SettingsPanel', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} />
    ));
    expect(container.innerHTML).toBeTruthy();
  });

  it('should render AppearancePanel', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <AppearancePanel settings={mockSettings.appearance} onChange={onChange} />
    ));
    expect(container.innerHTML).toBeTruthy();
  });

  it('should render AnimationPanel', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <AnimationPanel settings={mockSettings.animation} onChange={onChange} />
    ));
    expect(container.innerHTML).toBeTruthy();
  });

  it('should render LayoutPanel', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <LayoutPanel settings={mockSettings.layout} onChange={onChange} />
    ));
    expect(container.innerHTML).toBeTruthy();
  });

  it('should create settings store with defaults', () => {
    const { defaultSettings, loadSettings, saveSettings } = createSettingsStore();

    expect(typeof loadSettings).toBe('function');
    expect(typeof saveSettings).toBe('function');
    expect(defaultSettings).toEqual({
      appearance: { themeId: 'light', fontSize: 16 },
      animation: { enabled: true, speed: 'normal' },
      layout: { sidebarOpen: true, density: 'normal' },
    });
  });

  // ── CSS class contract ──────────────────────────────────────────────────────

  it('renders tokenized sk- root and tab classes', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} />
    ));
    expect(container.querySelector('.sk-settings')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-settings__tab')).toHaveLength(3);
    expect(container.querySelector('.sk-settings__tab--active')).toHaveTextContent('Appearance');
    expect(container.querySelector('.sk-settings__body')).toBeInTheDocument();
  });

  it('marks the clicked tab as active', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} />
    ));
    fireEvent.click(screen.getByText('Layout'));
    expect(container.querySelector('.sk-settings__tab--active')).toHaveTextContent('Layout');
  });

  it('marks the selected theme option', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} />
    ));
    const selected = container.querySelector('.sk-settings__option--selected');
    expect(selected).toHaveTextContent('Light');
  });

  it('passes through class and style to the root element', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel
        settings={mockSettings}
        onChange={onChange}
        class="custom-class"
        style={{ 'margin-top': '5px' }}
      />
    ));
    const root = container.querySelector('.sk-settings') as HTMLElement;
    expect(root).toHaveClass('custom-class');
    expect(root.style.marginTop).toBe('5px');
  });

  // ── Tab switching ───────────────────────────────────────────────────────────

  it('shows all three tab labels', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Animation')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('shows appearance panel by default', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    // Appearance panel shows "Theme" label
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('switches to Animation tab on click', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Animation'));
    expect(screen.getByText('Enable Animations')).toBeInTheDocument();
  });

  it('switches to Layout tab on click', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Layout'));
    expect(screen.getByText('Sidebar Open by Default')).toBeInTheDocument();
    expect(screen.getByText('Layout Density')).toBeInTheDocument();
  });

  it('switches back from Layout to Appearance', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Layout'));
    fireEvent.click(screen.getByText('Appearance'));
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  // ── Appearance settings ─────────────────────────────────────────────────────

  it('calls onChange when theme is switched', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Dark'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: expect.objectContaining({ themeId: 'dark' }),
      })
    );
  });

  it('calls onChange when font size slider changes', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} />
    ));
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    fireEvent.input(slider, { target: { value: '18' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: expect.objectContaining({ fontSize: 18 }),
      })
    );
  });

  it('renders custom available themes', () => {
    const onChange = vi.fn();
    const themes = [
      { id: 'ocean', name: 'Ocean' },
      { id: 'forest', name: 'Forest' },
    ];
    render(() => (
      <SettingsPanel settings={mockSettings} onChange={onChange} availableThemes={themes} />
    ));
    expect(screen.getByText('Ocean')).toBeInTheDocument();
    expect(screen.getByText('Forest')).toBeInTheDocument();
  });

  // ── Animation settings ──────────────────────────────────────────────────────

  it('calls onChange when animation is toggled off', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Animation'));
    const control = document.querySelector('.sk-switch__control') as HTMLElement;
    expect(control).toBeInTheDocument();
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        animation: expect.objectContaining({ enabled: false }),
      })
    );
  });

  it('calls onChange when animation speed is changed', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Animation'));
    fireEvent.click(screen.getByText('fast'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        animation: expect.objectContaining({ speed: 'fast' }),
      })
    );
  });

  it('preview button is disabled when animations are disabled', () => {
    const onChange = vi.fn();
    const disabledAnimation: SettingsConfig = {
      ...mockSettings,
      animation: { enabled: false, speed: 'normal' },
    };
    render(() => <SettingsPanel settings={disabledAnimation} onChange={onChange} />);
    fireEvent.click(screen.getByText('Animation'));
    const previewBtn = screen.getByText('Play Animation') as HTMLButtonElement;
    expect(previewBtn.disabled).toBe(true);
  });

  // ── Layout settings ─────────────────────────────────────────────────────────

  it('calls onChange when sidebar toggle is changed', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Layout'));
    const control = document.querySelector('.sk-switch__control') as HTMLElement;
    expect(control).toBeInTheDocument();
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({ sidebarOpen: false }),
      })
    );
  });

  it('calls onChange when density is changed to compact', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Layout'));
    fireEvent.click(screen.getByText('compact'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({ density: 'compact' }),
      })
    );
  });

  it('calls onChange when density is changed to comfortable', () => {
    const onChange = vi.fn();
    render(() => <SettingsPanel settings={mockSettings} onChange={onChange} />);
    fireEvent.click(screen.getByText('Layout'));
    fireEvent.click(screen.getByText('comfortable'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({ density: 'comfortable' }),
      })
    );
  });

  // ── createSettingsStore ─────────────────────────────────────────────────────

  it('loadSettings returns defaults when localStorage is empty', () => {
    const { loadSettings, defaultSettings } = createSettingsStore();
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it('loadSettings returns stored settings', () => {
    const custom: SettingsConfig = {
      appearance: { themeId: 'dark', fontSize: 18 },
      animation: { enabled: false, speed: 'fast' },
      layout: { sidebarOpen: false, density: 'compact' },
    };
    localStorage.setItem('hyperkit-settings', JSON.stringify(custom));
    const { loadSettings } = createSettingsStore();
    expect(loadSettings()).toEqual(custom);
  });

  it('saveSettings persists to localStorage', () => {
    const { saveSettings } = createSettingsStore();
    const custom: SettingsConfig = {
      appearance: { themeId: 'dark', fontSize: 20 },
      animation: { enabled: false, speed: 'slow' },
      layout: { sidebarOpen: false, density: 'comfortable' },
    };
    saveSettings(custom);
    const stored = JSON.parse(localStorage.getItem('hyperkit-settings')!);
    expect(stored).toEqual(custom);
  });

  it('createSettingsStore uses custom key', () => {
    const { saveSettings, loadSettings, defaultSettings } = createSettingsStore('custom-key');
    expect(loadSettings()).toEqual(defaultSettings);
    saveSettings({ ...defaultSettings, appearance: { themeId: 'custom', fontSize: 14 } });
    const result = loadSettings();
    expect(result.appearance.themeId).toBe('custom');
  });

  it('loadSettings returns defaults when localStorage has invalid JSON', () => {
    localStorage.setItem('hyperkit-settings', '{invalid json}');
    const { loadSettings, defaultSettings } = createSettingsStore();
    expect(loadSettings()).toEqual(defaultSettings);
  });
});
