import { describe, it, expect } from 'vitest';
import { render, waitFor, fireEvent } from '@solidjs/testing-library';
import { createSignal, type Component } from 'solid-js';
import { LiveExample } from './LiveExample.js';
import type { CsfModule } from './csf.js';

const Btn: Component<{ label?: string }> = (p) => <button>{p.label ?? 'Btn'}</button>;

describe('LiveExample', () => {
  it('renders the first story of a component live', async () => {
    const loaders = {
      Button: async (): Promise<CsfModule> => ({
        default: { component: Btn },
        Primary: { args: { label: 'Hello' } },
      }),
    };
    const { container, getByText } = render(() => (
      <LiveExample component="Button" loaders={loaders} />
    ));
    await waitFor(() => expect(getByText('Hello')).toBeInTheDocument());
    expect(container.querySelector('.sk-live')).not.toBeNull();
  });

  it('renders a specifically requested story', async () => {
    const loaders = {
      Button: async (): Promise<CsfModule> => ({
        default: { component: Btn },
        A: { args: { label: 'AA' } },
        B: { args: { label: 'BB' } },
      }),
    };
    const { getByText } = render(() => (
      <LiveExample component="Button" story="B" loaders={loaders} />
    ));
    await waitFor(() => expect(getByText('BB')).toBeInTheDocument());
  });

  it('shows the default fallback when the component has no loader', async () => {
    // No loaders prop → uses the real glob LOADERS; an unknown name → null.
    const { getByText } = render(() => <LiveExample component="NoSuchComponentXYZ" />);
    await waitFor(() => expect(getByText('No live preview.')).toBeInTheDocument());
  });

  it('shows a custom fallback when the module has no stories', async () => {
    const loaders = { Empty: async (): Promise<CsfModule> => ({ default: { component: Btn } }) };
    const { getByText } = render(() => (
      <LiveExample component="Empty" loaders={loaders} fallback={<i>nada</i>} />
    ));
    await waitFor(() => expect(getByText('nada')).toBeInTheDocument());
  });

  it('catches a throwing story via the error boundary (module with no default)', async () => {
    const loaders = {
      Boom: async (): Promise<CsfModule> => ({
        S: {
          render: () => {
            throw new Error('boom');
          },
        },
      }),
    };
    const { getByText } = render(() => (
      <LiveExample component="Boom" loaders={loaders} fallback={<i>err</i>} />
    ));
    await waitFor(() => expect(getByText('err')).toBeInTheDocument());
  });

  it('renders a render-fn story plainly even when it has args (non-controllable)', async () => {
    const loaders = {
      R: async (): Promise<CsfModule> => ({
        default: { component: () => null, args: { base: 1 } },
        S: { args: { x: 1 }, render: () => <div>RENDERED</div> },
      }),
    };
    const { getByText } = render(() => <LiveExample component="R" loaders={loaders} />);
    await waitFor(() => expect(getByText('RENDERED')).toBeInTheDocument());
  });

  it('renders args-based stories with controls and updates the preview live', async () => {
    const Label: Component<{ label?: string }> = (p) => <button>{p.label ?? ''}</button>;
    const loaders = {
      Button: async (): Promise<CsfModule> => ({
        default: { component: Label },
        Primary: { args: { label: 'Hello' } },
      }),
    };
    const { getByText, container } = render(() => (
      <LiveExample component="Button" loaders={loaders} />
    ));
    await waitFor(() => expect(getByText('Hello')).toBeInTheDocument());
    fireEvent.input(container.querySelector('.sk-controls input') as HTMLInputElement, {
      target: { value: 'Bye' },
    });
    await waitFor(() => expect(getByText('Bye')).toBeInTheDocument());
  });

  it('tolerates an args-based story with no component (renders nothing)', async () => {
    const loaders = {
      N: async (): Promise<CsfModule> => ({ default: {}, S: { args: { x: 'y' } } }),
    };
    const { container } = render(() => <LiveExample component="N" loaders={loaders} />);
    await waitFor(() => expect(container.querySelector('.sk-live')).not.toBeNull());
  });

  it('builds controls from meta args when the story has none', async () => {
    const Label: Component<{ label?: string }> = (p) => <button>{p.label ?? ''}</button>;
    const loaders = {
      M: async (): Promise<CsfModule> => ({
        default: {
          component: Label,
          args: { label: 'Meta' },
          argTypes: { label: { control: 'text' } },
        },
        S: {},
      }),
    };
    const { getByText } = render(() => <LiveExample component="M" loaders={loaders} />);
    await waitFor(() => expect(getByText('Meta')).toBeInTheDocument());
  });

  it('shows the loading state (NOT best-effort) while a story chunk is in flight', async () => {
    let resolve!: (m: CsfModule) => void;
    const Throwing: Component = () => {
      throw new Error('required props missing');
    };
    const loaders = { Slow: () => new Promise<CsfModule>((r) => (resolve = r)) };
    const { getByText, queryByText } = render(() => (
      // resolveComponent returns a THROWING component — the original bug
      // mounted it propless during loading and latched the boundary.
      <LiveExample component="Slow" loaders={loaders} resolveComponent={() => Throwing} />
    ));
    expect(getByText('Loading preview…')).toBeInTheDocument();
    expect(queryByText('No live preview.')).toBeNull();
    resolve({ default: { component: Btn }, S: { args: { label: 'Loaded' } } });
    await waitFor(() => expect(getByText('Loaded')).toBeInTheDocument());
  });

  it('a throwing best-effort render degrades to the fallback (own boundary)', async () => {
    const Throwing: Component = () => {
      throw new Error('boom');
    };
    const { getByText } = render(() => (
      <LiveExample component="NoStory" loaders={{}} resolveComponent={() => Throwing} />
    ));
    await waitFor(() => expect(getByText('No live preview.')).toBeInTheDocument());
  });

  it('does NOT latch: a broken component then a good one — the good one renders', async () => {
    const Throwing: Component = () => {
      throw new Error('boom');
    };
    const loaders = {
      Good: async (): Promise<CsfModule> => ({
        default: { component: Btn },
        S: { args: { label: 'Recovered' } },
      }),
    };
    const [name, setName] = createSignal('Broken');
    const { getByText } = render(() => (
      <LiveExample component={name()} loaders={loaders} resolveComponent={() => Throwing} />
    ));
    await waitFor(() => expect(getByText('No live preview.')).toBeInTheDocument());
    setName('Good'); // keyed boundary must reset — previously stayed latched
    await waitFor(() => expect(getByText('Recovered')).toBeInTheDocument());
  });

  it('best-effort renders the component by name when there is no story', async () => {
    const ByName: Component = () => <div>BYNAME</div>;
    const { getByText } = render(() => (
      <LiveExample
        component="Foo"
        loaders={{}}
        resolveComponent={(n) => (n === 'Foo' ? ByName : undefined)}
      />
    ));
    await waitFor(() => expect(getByText('BYNAME')).toBeInTheDocument());
  });

  it('falls back when by-name resolution finds no component', async () => {
    const { getByText } = render(() => (
      <LiveExample
        component="Nope"
        loaders={{}}
        resolveComponent={() => undefined}
        fallback={<i>none</i>}
      />
    ));
    await waitFor(() => expect(getByText('none')).toBeInTheDocument());
  });
});
