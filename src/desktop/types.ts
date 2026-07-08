export enum DesktopCapability {
  NativeMenuBar = 'native-menu-bar',
  NativeWindowControls = 'native-window-controls',
  NativeFileDialog = 'native-file-dialog',
  NativeNotifications = 'native-notifications',
}

export interface FileDialogOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  multiple?: boolean;
  directory?: boolean;
}

export interface DesktopAdapter {
  readonly capabilities: ReadonlySet<DesktopCapability>;
  minimizeWindow?(): void;
  maximizeWindow?(): void;
  closeWindow?(): void;
  openFileDialog?(options?: FileDialogOptions): Promise<string[] | null>;
  showNotification?(title: string, body: string): void;
}
