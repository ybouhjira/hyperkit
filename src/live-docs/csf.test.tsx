import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import type { Component } from 'solid-js';
import { storyNames, pickStoryName, renderCsf, buildLoaderMap, type CsfModule } from './csf.js';

const Comp: Component<{ label?: string }> = (p) => <button>{p.label ?? 'x'}</button>;

describe('storyNames', () => {
  it('returns object exports except default (skips non-objects + null)', () => {
    const mod: CsfModule = {
      default: { component: Comp },
      A: { args: {} },
      B: { render: () => null },
      notObj: 5,
      nul: null,
    };
    expect(storyNames(mod)).toEqual(['A', 'B']);
  });
});

describe('pickStoryName', () => {
  it('returns the requested story when present', () => {
    expect(pickStoryName({ A: {}, B: {} }, 'B')).toBe('B');
  });
  it('falls back to the first when the requested is absent', () => {
    expect(pickStoryName({ A: {}, B: {} }, 'Z')).toBe('A');
  });
  it('falls back to the first when none requested', () => {
    expect(pickStoryName({ A: {}, B: {} })).toBe('A');
  });
  it('returns null when there are no stories', () => {
    expect(pickStoryName({ default: { component: Comp } })).toBeNull();
  });
});

describe('renderCsf', () => {
  it('renders a render-fn story, story args overriding meta args', () => {
    const mod: CsfModule = {
      default: { args: { label: 'meta' } },
      S: {
        render: (a) => <b>{String((a as { label: string }).label)}</b>,
        args: { label: 'story' },
      },
    };
    const { container } = render(() => renderCsf(mod, 'S'));
    expect(container.textContent).toBe('story');
  });
  it('renders the component with args when there is no render fn', () => {
    const mod: CsfModule = { default: { component: Comp }, S: { args: { label: 'hi' } } };
    const { container } = render(() => renderCsf(mod, 'S'));
    expect(container.textContent).toBe('hi');
  });
  it('returns null when neither render nor component exist', () => {
    const mod: CsfModule = { default: {}, S: {} };
    const { container } = render(() => <>{renderCsf(mod, 'S')}</>);
    expect(container.textContent).toBe('');
  });

  it('tolerates a module with no default export', () => {
    const mod: CsfModule = { S: { render: () => <i>ok</i> } };
    const { container } = render(() => renderCsf(mod, 'S'));
    expect(container.textContent).toBe('ok');
  });
});

describe('buildLoaderMap', () => {
  it('maps the component dir name to its loader; skips non-matching paths', () => {
    const l1 = async (): Promise<CsfModule> => ({});
    const l2 = async (): Promise<CsfModule> => ({});
    const map = buildLoaderMap({
      '../primitives/Button/Button.stories.tsx': l1,
      '../composites/Card/Card.stories.tsx': l2,
      '/weird/path.txt': async () => ({}),
    });
    expect(Object.keys(map).sort()).toEqual(['Button', 'Card']);
    expect(map['Button']).toBe(l1);
  });
});
