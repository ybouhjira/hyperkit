import { describe, it, expect } from 'vitest';
import {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleFade,
  enterAnimation,
  animationClass,
} from './presets';

describe('animation/presets', () => {
  describe('preset exports', () => {
    it('should export fadeIn preset', () => {
      expect(fadeIn).toEqual({
        from: { opacity: 0 },
        to: { opacity: 1 },
      });
    });

    it('should export slideUp preset', () => {
      expect(slideUp).toEqual({
        from: { opacity: 0, transform: 'translateY(8px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      });
    });

    it('should export slideDown preset', () => {
      expect(slideDown).toEqual({
        from: { opacity: 0, transform: 'translateY(-8px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      });
    });

    it('should export slideLeft preset', () => {
      expect(slideLeft).toEqual({
        from: { opacity: 0, transform: 'translateX(8px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      });
    });

    it('should export slideRight preset', () => {
      expect(slideRight).toEqual({
        from: { opacity: 0, transform: 'translateX(-8px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      });
    });

    it('should export scaleIn preset', () => {
      expect(scaleIn).toEqual({
        from: { opacity: 0, transform: 'scale(0.95)' },
        to: { opacity: 1, transform: 'scale(1)' },
      });
    });

    it('should export scaleFade preset', () => {
      expect(scaleFade).toEqual({
        from: { opacity: 0, transform: 'scale(0.97)' },
        to: { opacity: 1, transform: 'scale(1)' },
      });
    });
  });

  describe('enterAnimation()', () => {
    it('should return styles for fade preset', () => {
      const styles = enterAnimation('fade', 200);
      expect(styles).toHaveProperty('opacity', 1);
      expect(styles).toHaveProperty('transition');
      expect(styles.transition).toContain('200ms');
    });

    it('should return styles for slide-up preset', () => {
      const styles = enterAnimation('slide-up', 300);
      expect(styles).toHaveProperty('opacity', 1);
      expect(styles).toHaveProperty('transform', 'translateY(0)');
      expect(styles.transition).toContain('300ms');
    });

    it('should return styles for scale preset', () => {
      const styles = enterAnimation('scale', 150);
      expect(styles).toHaveProperty('opacity', 1);
      expect(styles).toHaveProperty('transform', 'scale(1)');
      expect(styles.transition).toContain('150ms');
    });

    it('should return empty object for none preset', () => {
      const styles = enterAnimation('none', 200);
      expect(styles).toEqual({});
    });

    it('should use default duration of 200ms', () => {
      const styles = enterAnimation('fade');
      expect(styles.transition).toContain('200ms');
    });

    it('should include cubic-bezier easing', () => {
      const styles = enterAnimation('fade', 200);
      expect(styles.transition).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });

  describe('animationClass()', () => {
    it('should return class name for fade', () => {
      expect(animationClass('fade')).toBe('sk-animation-fade');
    });

    it('should return class name for slide-up', () => {
      expect(animationClass('slide-up')).toBe('sk-animation-slide-up');
    });

    it('should return class name for scale-fade', () => {
      expect(animationClass('scale-fade')).toBe('sk-animation-scale-fade');
    });

    it('should return class name for none', () => {
      expect(animationClass('none')).toBe('sk-animation-none');
    });
  });
});
