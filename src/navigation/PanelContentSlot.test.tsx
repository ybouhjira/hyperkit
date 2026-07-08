import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { PanelContentSlot } from './PanelContentSlot';
import { registerContentType, clearContentTypes } from './ContentRegistry';
import type { ContentRef } from './types';

// Helper to set content inside the provider
function ContentSetter(props: { panelId: string; content: ContentRef }) {
  const nav = useNavigation();
  nav.setPanelContent(props.panelId, props.content);
  return null;
}

describe('PanelContentSlot', () => {
  beforeEach(() => {
    clearContentTypes();
  });

  it('renders fallback when no content assigned', () => {
    render(() => (
      <NavigationProvider>
        <PanelContentSlot
          panelId="test-panel"
          renderers={{}}
          fallback={<div data-testid="custom-fallback">Nothing here</div>}
        />
      </NavigationProvider>
    ));

    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.getByTestId('custom-fallback').textContent).toBe('Nothing here');
  });

  it('renders default fallback when no custom fallback', () => {
    render(() => (
      <NavigationProvider>
        <PanelContentSlot panelId="test-panel" renderers={{}} />
      </NavigationProvider>
    ));

    expect(screen.getByText('No content selected')).toBeDefined();
  });

  it('renders content using correct renderer', () => {
    registerContentType({
      type: 'session',
      label: 'Session',
      defaultPanel: 'test-panel',
    });

    render(() => (
      <NavigationProvider>
        <ContentSetter
          panelId="test-panel"
          content={{ type: 'session', id: 'sess-1', label: 'My Session' }}
        />
        <PanelContentSlot
          panelId="test-panel"
          renderers={{
            session: (ref) => <div data-testid="session-view">Session: {ref.id}</div>,
          }}
        />
      </NavigationProvider>
    ));

    expect(screen.getByTestId('session-view')).toBeDefined();
    expect(screen.getByTestId('session-view').textContent).toBe('Session: sess-1');
  });

  it('shows error when no renderer for content type', () => {
    registerContentType({
      type: 'unknown-type',
      label: 'Unknown',
      defaultPanel: 'test-panel',
    });

    render(() => (
      <NavigationProvider>
        <ContentSetter panelId="test-panel" content={{ type: 'unknown-type', id: 'x' }} />
        <PanelContentSlot panelId="test-panel" renderers={{}} />
      </NavigationProvider>
    ));

    expect(screen.getByText(/No renderer for content type/)).toBeDefined();
  });
});
