import { describe, it, expect } from 'vitest';
import { WebAdapter } from './WebAdapter';

describe('WebAdapter', () => {
  it('should have empty capabilities set', () => {
    const adapter = new WebAdapter();
    expect(adapter.capabilities.size).toBe(0);
  });

  it('should not have optional methods defined', () => {
    const adapter = new WebAdapter();
    expect(adapter.minimizeWindow).toBeUndefined();
    expect(adapter.maximizeWindow).toBeUndefined();
    expect(adapter.closeWindow).toBeUndefined();
    expect(adapter.openFileDialog).toBeUndefined();
    expect(adapter.showNotification).toBeUndefined();
  });

  it('should be a valid DesktopAdapter', () => {
    const adapter = new WebAdapter();
    expect(adapter.capabilities).toBeInstanceOf(Set);
  });
});
