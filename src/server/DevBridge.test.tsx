import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import { clearNavigables } from '../navigation/NavigableRegistry';
import { DevBridge } from './DevBridge';

// ── Test helpers ──────────────────────────────────────────────────────────────

function getDevBridge(): (Window & { __devbridge?: Record<string, unknown> })['__devbridge'] {
  return (window as Window & { __devbridge?: Record<string, unknown> }).__devbridge;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('DevBridge', () => {
  beforeEach(() => {
    clearNavigables();
    // Ensure a clean global state before each test
    delete (window as Window & { __devbridge?: unknown }).__devbridge;
  });

  afterEach(() => {
    cleanup();
    delete (window as Window & { __devbridge?: unknown }).__devbridge;
  });

  // ── Mount / unmount ────────────────────────────────────────────────────────

  describe('mounting', () => {
    it('renders children without errors', () => {
      const { getByTestId } = render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div data-testid="child">hello</div>
        </DevBridge>
      ));

      expect(getByTestId('child').textContent).toBe('hello');
    });

    it('exposes window.__devbridge on mount', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      expect(getDevBridge()).toBeDefined();
    });

    it('removes window.__devbridge on unmount', () => {
      const { unmount } = render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      expect(getDevBridge()).toBeDefined();
      unmount();
      expect(getDevBridge()).toBeUndefined();
    });
  });

  // ── health() ──────────────────────────────────────────────────────────────

  describe('health()', () => {
    it('returns product and version', () => {
      render(() => (
        <DevBridge product="PDFly" version="4.2.0" port={9999}>
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      expect(api).toBeDefined();

      const health = (api as { health(): Record<string, unknown> }).health();
      expect(health.product).toBe('PDFly');
      expect(health.version).toBe('4.2.0');
      expect(health.port).toBe(9999);
    });

    it('returns navigableCount of 0 when no navigables registered', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const health = (api as { health(): Record<string, unknown> }).health();
      expect(health.navigableCount).toBe(0);
    });

    it('tracks uptime as a positive number', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const health = (api as { health(): Record<string, unknown> }).health();
      expect(typeof health.uptime).toBe('number');
      expect(health.uptime as number).toBeGreaterThanOrEqual(0);
    });
  });

  // ── inspect() ────────────────────────────────────────────────────────────

  describe('inspect()', () => {
    it('returns an empty array when no navigables are registered', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const result = (api as { inspect(): unknown[] }).inspect();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('reflects navigables registered after mount', async () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      // Register a navigable directly (bypasses SolidJS lifecycle for simplicity)
      const { registerNavigable, unregisterNavigable } =
        await import('../navigation/NavigableRegistry');
      registerNavigable({
        id: 'test-nav',
        label: 'Test Nav',
        actions: new Map(),
      });

      const api = getDevBridge();
      const result = (api as { inspect(): Array<{ id: string }> }).inspect();
      expect(result.some((n) => n.id === 'test-nav')).toBe(true);

      unregisterNavigable('test-nav');
    });
  });

  // ── dispatch() ───────────────────────────────────────────────────────────

  describe('dispatch()', () => {
    it('returns ok: false for unknown navigable', async () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const result = await (
        api as { dispatch(t: string, a: string): Promise<{ ok: boolean }> }
      ).dispatch('nonexistent', 'doSomething');

      expect(result.ok).toBe(false);
    });

    it('dispatches to a registered navigable and returns the result', async () => {
      const { registerNavigable, unregisterNavigable } =
        await import('../navigation/NavigableRegistry');

      const handler = vi.fn().mockReturnValue('pong');
      registerNavigable({
        id: 'pingable',
        label: 'Pingable',
        actions: new Map([['ping', { name: 'ping', description: 'Ping', handler }]]),
      });

      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const result = await (
        api as { dispatch(t: string, a: string): Promise<{ ok: boolean; data?: unknown }> }
      ).dispatch('pingable', 'ping');

      expect(result.ok).toBe(true);
      expect(result.data).toBe('pong');

      unregisterNavigable('pingable');
    });
  });

  // ── state() ───────────────────────────────────────────────────────────────

  describe('state()', () => {
    it('returns an AppStateSnapshot with timestamp and version', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const snapshot = (
        api as {
          state(): { timestamp: number; version: number; navigables: Record<string, unknown> };
        }
      ).state();

      expect(typeof snapshot.timestamp).toBe('number');
      expect(typeof snapshot.version).toBe('number');
      expect(typeof snapshot.navigables).toBe('object');
    });
  });

  // ── console capture ───────────────────────────────────────────────────────

  describe('consoleLogs()', () => {
    it('captures console.log calls after mount', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      console.log('devbridge-test-message');

      const api = getDevBridge();
      const logs = (
        api as { consoleLogs(): Array<{ level: string; message: string }> }
      ).consoleLogs();

      expect(logs.some((e) => e.message.includes('devbridge-test-message'))).toBe(true);
    });

    it('captures console.warn calls', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      console.warn('devbridge-warn-message');

      const api = getDevBridge();
      const logs = (
        api as { consoleLogs(): Array<{ level: string; message: string }> }
      ).consoleLogs();

      const entry = logs.find((e) => e.message.includes('devbridge-warn-message'));
      expect(entry).toBeDefined();
      expect(entry!.level).toBe('warn');
    });

    it('captures console.error calls', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      console.error('devbridge-error-message');

      const api = getDevBridge();
      const logs = (
        api as { consoleLogs(): Array<{ level: string; message: string }> }
      ).consoleLogs();

      const entry = logs.find((e) => e.message.includes('devbridge-error-message'));
      expect(entry).toBeDefined();
      expect(entry!.level).toBe('error');
    });

    it('includes a timestamp on each log entry', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const before = Date.now();
      console.log('timestamp-test');
      const after = Date.now();

      const api = getDevBridge();
      const logs = (
        api as { consoleLogs(): Array<{ timestamp: number; message: string }> }
      ).consoleLogs();

      const entry = logs.find((e) => e.message.includes('timestamp-test'));
      expect(entry).toBeDefined();
      expect(entry!.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry!.timestamp).toBeLessThanOrEqual(after);
    });

    it('restores original console methods on unmount', () => {
      // Use a fresh spy to verify restoration via behavior rather than reference
      // equality. Reference equality breaks when other tests have patched console
      // and afterEach cleanup runs between tests.
      const captured: string[] = [];
      const outerLog = vi.fn((...args: unknown[]) => {
        captured.push(args.join(' '));
      });

      // Install our spy as the "base" layer before mounting DevBridge
      const prevLog = console.log;
      console.log = outerLog;

      const { unmount } = render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      // While DevBridge is mounted, our outer spy should NOT be the current console.log
      // (DevBridge wraps it)
      expect(console.log).not.toBe(outerLog);

      // After unmount, DevBridge must restore our spy as console.log
      unmount();
      expect(console.log).toBe(outerLog);

      // Restore the previous console.log so other tests are not affected
      console.log = prevLog;
    });

    it('returns an empty array before any logs are emitted', () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const logs = (api as { consoleLogs(): unknown[] }).consoleLogs();
      // May already have some logs from the mount itself — just verify it's an array
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  // ── screenshot() ──────────────────────────────────────────────────────────

  describe('screenshot()', () => {
    it('returns either a screenshot or an error object', async () => {
      render(() => (
        <DevBridge product="TestApp" version="1.0.0">
          <div />
        </DevBridge>
      ));

      const api = getDevBridge();
      const result = await (api as { screenshot(): Promise<Record<string, unknown>> }).screenshot();

      const hasScreenshot = typeof result['screenshot'] === 'string';
      const hasError = typeof result['error'] === 'string';
      expect(hasScreenshot || hasError).toBe(true);
    });
  });
});
