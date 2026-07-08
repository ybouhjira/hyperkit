import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { useFileNavigation } from './useFileNavigation';

describe('useFileNavigation', () => {
  it('initializes with the provided path', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/home/user');
      expect(nav.current()).toBe('/home/user');
      expect(nav.canGoBack()).toBe(false);
      expect(nav.canGoForward()).toBe(false);
      dispose();
    });
  });

  it('navigateTo pushes path and clears forward stack', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.navigateTo('/home');
      expect(nav.current()).toBe('/home');
      expect(nav.canGoBack()).toBe(true);
      expect(nav.canGoForward()).toBe(false);
      dispose();
    });
  });

  it('back restores previous path', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.navigateTo('/home');
      nav.navigateTo('/home/user');
      nav.back();
      expect(nav.current()).toBe('/home');
      expect(nav.canGoBack()).toBe(true);
      expect(nav.canGoForward()).toBe(true);
      dispose();
    });
  });

  it('forward restores next path after back', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.navigateTo('/home');
      nav.navigateTo('/home/user');
      nav.back();
      nav.forward();
      expect(nav.current()).toBe('/home/user');
      expect(nav.canGoForward()).toBe(false);
      dispose();
    });
  });

  it('navigateTo clears forward stack', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.navigateTo('/home');
      nav.back();
      nav.navigateTo('/etc');
      expect(nav.canGoForward()).toBe(false);
      expect(nav.current()).toBe('/etc');
      dispose();
    });
  });

  it('back does nothing when already at start', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.back();
      expect(nav.current()).toBe('/');
      dispose();
    });
  });

  it('forward does nothing when no forward stack', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.forward();
      expect(nav.current()).toBe('/');
      dispose();
    });
  });

  it('history includes all back paths plus current', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/');
      nav.navigateTo('/a');
      nav.navigateTo('/a/b');
      const h = nav.history();
      expect(h).toEqual(['/', '/a', '/a/b']);
      dispose();
    });
  });

  it('multiple back/forward navigations work correctly', () => {
    createRoot((dispose) => {
      const nav = useFileNavigation('/root');
      nav.navigateTo('/a');
      nav.navigateTo('/b');
      nav.navigateTo('/c');
      nav.back();
      nav.back();
      expect(nav.current()).toBe('/a');
      nav.forward();
      expect(nav.current()).toBe('/b');
      dispose();
    });
  });
});
