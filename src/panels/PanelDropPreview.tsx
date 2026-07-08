import { Component, Show } from 'solid-js';

interface PanelDropPreviewProps {
  panelTitle?: string;
  panelIcon?: string;
  visible: boolean;
}

export const PanelDropPreview: Component<PanelDropPreviewProps> = (props) => {
  return (
    <Show when={props.visible}>
      <div
        classList={{
          'sk-drop-preview': true,
          'sk-drop-preview--visible': props.visible,
        }}
      >
        <div class="sk-drop-preview__fill" />
        <div class="sk-drop-preview__border" />
        <Show when={props.panelTitle}>
          <div class="sk-drop-preview__label">
            <Show when={props.panelIcon}>
              <span>{props.panelIcon}</span>
            </Show>
            <span>{props.panelTitle}</span>
          </div>
        </Show>
      </div>
    </Show>
  );
};
