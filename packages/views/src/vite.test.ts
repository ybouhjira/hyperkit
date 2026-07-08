import { describe, it, expect } from 'vitest';
import { hyperkitViews } from './vite';

describe('hyperkitViews', () => {
  it('returns a Vite plugin with the correct name', () => {
    const plugin = hyperkitViews({
      blueprints: 'src/blueprints/**/*.ts',
      output: 'src/generated/',
      viewKit: './viewkit.ts',
    });

    expect(plugin.name).toBe('hyperkit-views');
  });

  it('has buildStart hook', () => {
    const plugin = hyperkitViews({
      blueprints: 'src/blueprints/**/*.ts',
      output: 'src/generated/',
      viewKit: './viewkit.ts',
    });

    expect(typeof plugin.buildStart).toBe('function');
  });

  it('has configureServer hook', () => {
    const plugin = hyperkitViews({
      blueprints: 'src/blueprints/**/*.ts',
      output: 'src/generated/',
      viewKit: './viewkit.ts',
    });

    expect(typeof plugin.configureServer).toBe('function');
  });
});
