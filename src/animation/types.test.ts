import { describe, it, expect } from 'vitest';
import type { AnimationConfig, TransitionPreset, TransitionConfig } from './types';

describe('animation/types', () => {
  it('should export AnimationConfig interface', () => {
    const config: AnimationConfig = {
      enabled: true,
      speedMultiplier: 1,
      respectReducedMotion: true,
    };
    expect(config).toBeDefined();
    expect(config.enabled).toBe(true);
    expect(config.speedMultiplier).toBe(1);
    expect(config.respectReducedMotion).toBe(true);
  });

  it('should export TransitionPreset type', () => {
    const presets: TransitionPreset[] = [
      'fade',
      'slide-up',
      'slide-down',
      'slide-left',
      'slide-right',
      'scale',
      'scale-fade',
      'none',
    ];
    expect(presets).toHaveLength(8);
  });

  it('should export TransitionConfig interface', () => {
    const config: TransitionConfig = {
      duration: 200,
      easing: 'ease-in-out',
      delay: 0,
      preset: 'fade',
    };
    expect(config).toBeDefined();
    expect(config.duration).toBe(200);
    expect(config.easing).toBe('ease-in-out');
    expect(config.delay).toBe(0);
    expect(config.preset).toBe('fade');
  });

  it('should allow partial TransitionConfig', () => {
    const config: TransitionConfig = {
      preset: 'slide-up',
    };
    expect(config.preset).toBe('slide-up');
    expect(config.duration).toBeUndefined();
    expect(config.easing).toBeUndefined();
    expect(config.delay).toBeUndefined();
  });
});
