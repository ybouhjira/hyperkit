import { type Component } from 'solid-js';
import { Text } from '@ybouhjira/hyperkit';
import type { SupportedComponent } from '../types';

export interface PaletteItemProps {
  component: SupportedComponent;
}

export const PaletteItem: Component<PaletteItemProps> = (props) => {
  const handleDragStart = (e: DragEvent): void => {
    e.dataTransfer?.setData('application/x-palette-component', props.component);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: 'var(--sk-space-xs) var(--sk-space-sm)',
        background: 'var(--sk-bg-secondary)',
        border: '1px solid var(--sk-border)',
        'border-radius': 'var(--sk-radius-sm)',
        cursor: 'grab',
        'user-select': 'none',
        transition: 'background var(--sk-duration-fast)',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--sk-bg-tertiary)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--sk-bg-secondary)';
      }}
    >
      <Text size="sm" weight="medium">
        {props.component}
      </Text>
    </div>
  );
};
