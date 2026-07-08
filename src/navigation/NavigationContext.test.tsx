import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@solidjs/testing-library';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { registerContentType, clearContentTypes } from './ContentRegistry';

// Helper component that exposes navigation context
function TestConsumer(props: { onMount: (nav: ReturnType<typeof useNavigation>) => void }) {
  const nav = useNavigation();
  props.onMount(nav);
  return <div data-testid="consumer">ready</div>;
}

describe('NavigationContext', () => {
  beforeEach(() => {
    clearContentTypes();
    registerContentType({
      type: 'test-session',
      label: 'Test Session',
      defaultPanel: 'main-panel',
    });
  });

  it('provides navigation context to children', () => {
    let navContext: ReturnType<typeof useNavigation> | undefined;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(nav) => {
            navContext = nav;
          }}
        />
      </NavigationProvider>
    ));

    expect(navContext).toBeDefined();
    expect(navContext!.openContent).toBeTypeOf('function');
    expect(navContext!.getPanelContent).toBeTypeOf('function');
    expect(navContext!.setPanelContent).toBeTypeOf('function');
    expect(navContext!.getPanelTabs).toBeTypeOf('function');
    expect(navContext!.addTab).toBeTypeOf('function');
    expect(navContext!.removeTab).toBeTypeOf('function');
    expect(navContext!.getActiveTab).toBeTypeOf('function');
    expect(navContext!.setActiveTab).toBeTypeOf('function');
  });

  it('throws when used outside provider', () => {
    expect(() => {
      render(() => <TestConsumer onMount={() => {}} />);
    }).toThrow('useNavigation must be used within a NavigationProvider');
  });

  it('sets and gets panel content', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.getPanelContent('main-panel')).toBeNull();

    nav!.setPanelContent('main-panel', {
      type: 'test-session',
      id: 'session-1',
      label: 'My Session',
    });

    expect(nav!.getPanelContent('main-panel')).toEqual({
      type: 'test-session',
      id: 'session-1',
      label: 'My Session',
    });
  });

  it('openContent with same target sets panel content', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent({ type: 'test-session', id: 'sess-1' }, { where: 'same' });

    expect(nav!.getPanelContent('main-panel')).toEqual({
      type: 'test-session',
      id: 'sess-1',
    });
  });

  it('openContent with new-tab adds tab', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent({ type: 'test-session', id: 'sess-1', label: 'Tab 1' }, { where: 'new-tab' });
    nav!.openContent({ type: 'test-session', id: 'sess-2', label: 'Tab 2' }, { where: 'new-tab' });

    const tabs = nav!.getPanelTabs('main-panel');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].id).toBe('sess-1');
    expect(tabs[1].id).toBe('sess-2');
    // Active tab should be the last one added
    expect(nav!.getActiveTab('main-panel')?.id).toBe('sess-2');
  });

  it('removeTab removes tab and activates adjacent', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1', label: 'Tab 1' });
    nav!.addTab('main-panel', { type: 'test-session', id: 't2', label: 'Tab 2' });
    nav!.addTab('main-panel', { type: 'test-session', id: 't3', label: 'Tab 3' });

    // Active is t3 (last added)
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t3');

    // Remove active tab
    nav!.removeTab('main-panel', 't3');

    const tabs = nav!.getPanelTabs('main-panel');
    expect(tabs).toHaveLength(2);
    // Should activate the previous tab
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t2');
  });

  it('does not add duplicate tabs', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 'same-id' });
    nav!.addTab('main-panel', { type: 'test-session', id: 'same-id' });

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(1);
  });

  it('openContent defaults to same target when none provided', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent({ type: 'test-session', id: 'no-target' });
    expect(nav!.getPanelContent('main-panel')).toEqual({
      type: 'test-session',
      id: 'no-target',
    });
  });

  it('openContent with new-panel sets content and calls onOpenPanel', () => {
    const onOpenPanel = vi.fn();
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider onOpenPanel={onOpenPanel}>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent(
      { type: 'test-session', id: 'panel-content' },
      { where: 'new-panel', position: 'right' }
    );

    expect(onOpenPanel).toHaveBeenCalledWith('main-panel', 'right');
    expect(nav!.getPanelContent('main-panel')?.id).toBe('panel-content');
  });

  it('openContent with new-mode sets content', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent(
      { type: 'test-session', id: 'mode-content' },
      { where: 'new-mode', modeId: 'focus' }
    );

    expect(nav!.getPanelContent('main-panel')?.id).toBe('mode-content');
  });

  it('openContent with new-tab and explicit panelId', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent(
      { type: 'test-session', id: 'explicit-tab' },
      { where: 'new-tab', panelId: 'main-panel' }
    );

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(1);
    expect(nav!.getPanelTabs('main-panel')[0].id).toBe('explicit-tab');
  });

  it('openContent does nothing for unregistered content type', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent({ type: 'unknown-type', id: 'no-panel' }, { where: 'same' });

    // No panel should have content since the type isn't registered
    expect(nav!.getPanelContent('main-panel')).toBeNull();
  });

  it('openContent new-tab does nothing for unregistered type without panelId', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent({ type: 'unknown-type', id: 'no-panel' }, { where: 'new-tab' });

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(0);
  });

  it('openContent new-panel does nothing for unregistered type', () => {
    const onOpenPanel = vi.fn();
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider onOpenPanel={onOpenPanel}>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.openContent(
      { type: 'unknown-type', id: 'no-panel' },
      { where: 'new-panel', position: 'left' }
    );

    expect(onOpenPanel).not.toHaveBeenCalled();
  });

  it('removeTab for non-existent panel does nothing', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    // Should not throw
    nav!.removeTab('non-existent-panel', 'any-id');
    expect(nav!.getPanelTabs('non-existent-panel')).toHaveLength(0);
  });

  it('removeTab for non-existent tab id does nothing', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1' });
    nav!.removeTab('main-panel', 'non-existent');

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(1);
  });

  it('removeTab of non-active tab does not change active tab', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1', label: 'Tab 1' });
    nav!.addTab('main-panel', { type: 'test-session', id: 't2', label: 'Tab 2' });
    nav!.addTab('main-panel', { type: 'test-session', id: 't3', label: 'Tab 3' });

    // Active is t3
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t3');

    // Remove non-active tab t1
    nav!.removeTab('main-panel', 't1');

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(2);
    // Active should still be t3
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t3');
  });

  it('removeTab removes last tab and clears panel', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1' });
    nav!.removeTab('main-panel', 't1');

    expect(nav!.getPanelTabs('main-panel')).toHaveLength(0);
    expect(nav!.getActiveTab('main-panel')).toBeNull();
    expect(nav!.getPanelContent('main-panel')).toBeNull();
  });

  it('setActiveTab activates existing tab', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1', label: 'Tab 1' });
    nav!.addTab('main-panel', { type: 'test-session', id: 't2', label: 'Tab 2' });

    // Active is t2 (last added)
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t2');

    nav!.setActiveTab('main-panel', 't1');
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t1');
    expect(nav!.getPanelContent('main-panel')?.id).toBe('t1');
  });

  it('setActiveTab does nothing for non-existent tab', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.addTab('main-panel', { type: 'test-session', id: 't1' });
    nav!.setActiveTab('main-panel', 'non-existent');

    // Should still be t1
    expect(nav!.getActiveTab('main-panel')?.id).toBe('t1');
  });

  it('getActiveTab returns null for panel with no tabs', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.getActiveTab('main-panel')).toBeNull();
  });

  it('getActiveTab returns null for unknown panel', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.getActiveTab('unknown-panel')).toBeNull();
  });

  it('getPanelContent returns null for unknown panel', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.getPanelContent('unknown-panel')).toBeNull();
  });

  it('getPanelTabs returns empty array for unknown panel', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    expect(nav!.getPanelTabs('unknown-panel')).toEqual([]);
  });

  it('setPanelContent with null clears content', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.setPanelContent('main-panel', { type: 'test-session', id: 's1' });
    expect(nav!.getPanelContent('main-panel')).not.toBeNull();

    nav!.setPanelContent('main-panel', null);
    expect(nav!.getPanelContent('main-panel')).toBeNull();
  });

  it('setActiveTab for empty panel does nothing', () => {
    let nav: ReturnType<typeof useNavigation>;

    render(() => (
      <NavigationProvider>
        <TestConsumer
          onMount={(n) => {
            nav = n;
          }}
        />
      </NavigationProvider>
    ));

    nav!.setActiveTab('main-panel', 'any-id');
    expect(nav!.getActiveTab('main-panel')).toBeNull();
  });
});
