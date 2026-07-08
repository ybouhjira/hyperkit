import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElectronAdapter } from './ElectronAdapter';
import { DesktopCapability } from '../types';

describe('ElectronAdapter', () => {
  const mockElectronAPI = {
    minimizeWindow: vi.fn(),
    maximizeWindow: vi.fn(),
    closeWindow: vi.fn(),
    openFileDialog: vi.fn(),
    showNotification: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  it('should have empty capabilities when no API provided', () => {
    const adapter = new ElectronAdapter(undefined);
    expect(adapter.capabilities.size).toBe(0);
  });

  it('should detect NativeMenuBar capability', () => {
    const adapter = new ElectronAdapter({
      nativeMenuBar: true,
    });
    expect(adapter.capabilities.has(DesktopCapability.NativeMenuBar)).toBe(true);
  });

  it('should not detect NativeMenuBar when flag is false', () => {
    const adapter = new ElectronAdapter({
      nativeMenuBar: false,
    });
    expect(adapter.capabilities.has(DesktopCapability.NativeMenuBar)).toBe(false);
  });

  it('should detect NativeWindowControls capability', () => {
    const adapter = new ElectronAdapter({
      minimizeWindow: mockElectronAPI.minimizeWindow,
    });
    expect(adapter.capabilities.has(DesktopCapability.NativeWindowControls)).toBe(true);
  });

  it('should detect NativeFileDialog capability', () => {
    const adapter = new ElectronAdapter({
      openFileDialog: mockElectronAPI.openFileDialog,
    });
    expect(adapter.capabilities.has(DesktopCapability.NativeFileDialog)).toBe(true);
  });

  it('should detect NativeNotifications capability', () => {
    const adapter = new ElectronAdapter({
      showNotification: mockElectronAPI.showNotification,
    });
    expect(adapter.capabilities.has(DesktopCapability.NativeNotifications)).toBe(true);
  });

  it('should detect all capabilities when all methods present', () => {
    const adapter = new ElectronAdapter({ ...mockElectronAPI, nativeMenuBar: true });
    expect(adapter.capabilities.has(DesktopCapability.NativeMenuBar)).toBe(true);
    expect(adapter.capabilities.has(DesktopCapability.NativeWindowControls)).toBe(true);
    expect(adapter.capabilities.has(DesktopCapability.NativeFileDialog)).toBe(true);
    expect(adapter.capabilities.has(DesktopCapability.NativeNotifications)).toBe(true);
  });

  it('should delegate minimizeWindow call', () => {
    const adapter = new ElectronAdapter(mockElectronAPI);
    adapter.minimizeWindow();
    expect(mockElectronAPI.minimizeWindow).toHaveBeenCalledOnce();
  });

  it('should delegate maximizeWindow call', () => {
    const adapter = new ElectronAdapter(mockElectronAPI);
    adapter.maximizeWindow();
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledOnce();
  });

  it('should delegate closeWindow call', () => {
    const adapter = new ElectronAdapter(mockElectronAPI);
    adapter.closeWindow();
    expect(mockElectronAPI.closeWindow).toHaveBeenCalledOnce();
  });

  it('should delegate openFileDialog call with options', async () => {
    const options = {
      title: 'Select File',
      filters: [{ name: 'Images', extensions: ['png', 'jpg'] }],
    };
    mockElectronAPI.openFileDialog.mockResolvedValue(['/path/to/file.png']);

    const adapter = new ElectronAdapter(mockElectronAPI);
    const result = await adapter.openFileDialog(options);

    expect(mockElectronAPI.openFileDialog).toHaveBeenCalledWith(options);
    expect(result).toEqual(['/path/to/file.png']);
  });

  it('should delegate showNotification call', () => {
    const adapter = new ElectronAdapter(mockElectronAPI);
    adapter.showNotification('Test Title', 'Test Body');
    expect(mockElectronAPI.showNotification).toHaveBeenCalledWith('Test Title', 'Test Body');
  });

  it('should handle missing methods gracefully', () => {
    const partialAPI = {
      minimizeWindow: mockElectronAPI.minimizeWindow,
    };
    const adapter = new ElectronAdapter(partialAPI);

    expect(() => adapter.minimizeWindow()).not.toThrow();
    expect(() => adapter.closeWindow()).not.toThrow();
    expect(() => adapter.showNotification('Test', 'Body')).not.toThrow();
  });

  it('should return null when openFileDialog not available', async () => {
    const adapter = new ElectronAdapter({});
    const result = await adapter.openFileDialog();
    expect(result).toBeNull();
  });

  it('should use window.electronAPI by default', () => {
    (window as { electronAPI?: unknown }).electronAPI = mockElectronAPI;
    const adapter = new ElectronAdapter();
    expect(adapter.capabilities.size).toBeGreaterThan(0);
  });

  it('should detect window controls from any window method', () => {
    const adapterWithMinimize = new ElectronAdapter({
      minimizeWindow: mockElectronAPI.minimizeWindow,
    });
    expect(adapterWithMinimize.capabilities.has(DesktopCapability.NativeWindowControls)).toBe(true);

    const adapterWithMaximize = new ElectronAdapter({
      maximizeWindow: mockElectronAPI.maximizeWindow,
    });
    expect(adapterWithMaximize.capabilities.has(DesktopCapability.NativeWindowControls)).toBe(true);

    const adapterWithClose = new ElectronAdapter({
      closeWindow: mockElectronAPI.closeWindow,
    });
    expect(adapterWithClose.capabilities.has(DesktopCapability.NativeWindowControls)).toBe(true);
  });
});
