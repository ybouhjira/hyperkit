import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatShortcut } from './formatShortcut';

// Helper to mock navigator.platform
function mockPlatform(platform: string) {
  return vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
}

describe('formatShortcut', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Mac platform', () => {
    it('uses ⌘ for mod on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'k', mod: true })).toBe('⌘ K');
    });

    it('uses ⌃ for ctrl on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'c', ctrl: true })).toBe('⌃ C');
    });

    it('uses ⌘ for meta on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'l', meta: true })).toBe('⌘ L');
    });

    it('uses ⇧ for shift on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'z', shift: true })).toBe('⇧ Z');
    });

    it('uses ⌥ for alt on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'a', alt: true })).toBe('⌥ A');
    });

    it('joins parts with space on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'f', mod: true, shift: true })).toBe('⌘ ⇧ F');
    });

    it('handles all modifiers combined on Mac', () => {
      mockPlatform('MacIntel');
      const result = formatShortcut({
        key: 'x',
        mod: true,
        ctrl: true,
        meta: true,
        shift: true,
        alt: true,
      });
      expect(result).toBe('⌘ ⌃ ⌘ ⇧ ⌥ X');
    });

    it('detects iPhone as Mac platform', () => {
      mockPlatform('iPhone');
      expect(formatShortcut({ key: 'k', mod: true })).toBe('⌘ K');
    });

    it('detects iPad as Mac platform', () => {
      mockPlatform('iPad');
      expect(formatShortcut({ key: 'k', mod: true })).toBe('⌘ K');
    });
  });

  describe('Windows/Linux platform', () => {
    it('uses Ctrl for mod on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'k', mod: true })).toBe('Ctrl+K');
    });

    it('uses Ctrl for ctrl on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'c', ctrl: true })).toBe('Ctrl+C');
    });

    it('uses Win for meta on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'l', meta: true })).toBe('Win+L');
    });

    it('uses Shift for shift on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'z', shift: true })).toBe('Shift+Z');
    });

    it('uses Alt for alt on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'a', alt: true })).toBe('Alt+A');
    });

    it('joins parts with + on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'f', mod: true, shift: true })).toBe('Ctrl+Shift+F');
    });

    it('uses Ctrl for mod on Linux', () => {
      mockPlatform('Linux x86_64');
      expect(formatShortcut({ key: 'k', mod: true })).toBe('Ctrl+K');
    });
  });

  describe('key symbol mapping', () => {
    it('maps Enter to ↵', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Enter' })).toBe('↵');
    });

    it('maps Escape to Esc', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Escape' })).toBe('Esc');
    });

    it('maps ArrowUp to ↑', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'ArrowUp' })).toBe('↑');
    });

    it('maps ArrowDown to ↓', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'ArrowDown' })).toBe('↓');
    });

    it('maps ArrowLeft to ←', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'ArrowLeft' })).toBe('←');
    });

    it('maps ArrowRight to →', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'ArrowRight' })).toBe('→');
    });

    it('maps Backspace to ⌫', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Backspace' })).toBe('⌫');
    });

    it('maps Delete to ⌦', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Delete' })).toBe('⌦');
    });

    it('maps Tab to ⇥', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Tab' })).toBe('⇥');
    });

    it('maps space to Space', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: ' ' })).toBe('Space');
    });

    it('uppercases unmapped keys', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'a' })).toBe('A');
    });

    it('uppercases multi-char keys', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'f1' })).toBe('F1');
    });
  });

  describe('no modifiers', () => {
    it('returns just the key when no modifiers set', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'k' })).toBe('K');
    });

    it('returns just the key with false modifiers', () => {
      mockPlatform('Win32');
      expect(
        formatShortcut({ key: 'k', mod: false, ctrl: false, shift: false, alt: false, meta: false })
      ).toBe('K');
    });
  });

  describe('combined modifier + symbol key', () => {
    it('formats Ctrl+Enter on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Enter', mod: true })).toBe('Ctrl+↵');
    });

    it('formats ⌘ Enter on Mac', () => {
      mockPlatform('MacIntel');
      expect(formatShortcut({ key: 'Enter', mod: true })).toBe('⌘ ↵');
    });

    it('formats Ctrl+Shift+Escape on Windows', () => {
      mockPlatform('Win32');
      expect(formatShortcut({ key: 'Escape', ctrl: true, shift: true })).toBe('Ctrl+Shift+Esc');
    });
  });
});
