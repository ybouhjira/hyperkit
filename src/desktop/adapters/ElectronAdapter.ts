import type { DesktopAdapter, DesktopCapability, FileDialogOptions } from '../types';
import { DesktopCapability as Capability } from '../types';

interface ElectronAPI {
  nativeMenuBar?: boolean;
  minimizeWindow?(): void;
  maximizeWindow?(): void;
  closeWindow?(): void;
  openFileDialog?(options?: FileDialogOptions): Promise<string[] | null>;
  showNotification?(title: string, body: string): void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export class ElectronAdapter implements DesktopAdapter {
  readonly capabilities: ReadonlySet<DesktopCapability>;
  private readonly api: ElectronAPI | undefined;

  constructor(api: ElectronAPI | undefined = window.electronAPI) {
    this.api = api;
    this.capabilities = this.detectCapabilities();
  }

  private detectCapabilities(): ReadonlySet<DesktopCapability> {
    const caps = new Set<DesktopCapability>();

    if (!this.api) {
      return caps;
    }

    if (this.api.nativeMenuBar) {
      caps.add(Capability.NativeMenuBar);
    }

    if (this.api.minimizeWindow || this.api.maximizeWindow || this.api.closeWindow) {
      caps.add(Capability.NativeWindowControls);
    }

    if (this.api.openFileDialog) {
      caps.add(Capability.NativeFileDialog);
    }

    if (this.api.showNotification) {
      caps.add(Capability.NativeNotifications);
    }

    return caps;
  }

  minimizeWindow(): void {
    this.api?.minimizeWindow?.();
  }

  maximizeWindow(): void {
    this.api?.maximizeWindow?.();
  }

  closeWindow(): void {
    this.api?.closeWindow?.();
  }

  async openFileDialog(options?: FileDialogOptions): Promise<string[] | null> {
    if (!this.api?.openFileDialog) {
      return null;
    }
    return this.api.openFileDialog(options);
  }

  showNotification(title: string, body: string): void {
    this.api?.showNotification?.(title, body);
  }
}
