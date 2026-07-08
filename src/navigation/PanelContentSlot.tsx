import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { PanelContentSlotProps, ContentRef } from './types';
import { useNavigation } from './NavigationContext';

/**
 * Renders content based on what's assigned to a panel.
 * Looks up the content type and delegates to the appropriate renderer.
 */
export const PanelContentSlot: Component<PanelContentSlotProps> = (props) => {
  const nav = useNavigation();

  const content = (): ContentRef | null => nav.getPanelContent(props.panelId);

  const defaultFallback = (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        height: '100%',
        color: 'var(--sk-text-muted)',
        gap: 'var(--sk-space-sm)',
        'font-family': 'var(--sk-font-ui)',
      }}
    >
      <span style={{ 'font-size': 'var(--sk-font-size-sm)', opacity: '0.5' }}>
        No content selected
      </span>
    </div>
  );

  return (
    <Show when={content()} fallback={props.fallback ?? defaultFallback}>
      {(ref) => {
        const renderer = props.renderers[ref().type];
        if (!renderer) {
          return (
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                height: '100%',
                color: 'var(--sk-text-muted)',
                'font-family': 'var(--sk-font-ui)',
                'font-size': 'var(--sk-font-size-sm)',
              }}
            >
              No renderer for content type: {ref().type}
            </div>
          );
        }
        return renderer(ref());
      }}
    </Show>
  );
};
