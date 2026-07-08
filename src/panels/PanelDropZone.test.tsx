import { render } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { PanelDropZone } from './PanelDropZone';

describe('PanelDropZone', () => {
  it('calls onRegister with position and element on mount', () => {
    const onRegister = vi.fn();
    const onUnregister = vi.fn();

    render(() => (
      <PanelDropZone
        position="left"
        active={false}
        visible={true}
        onRegister={onRegister}
        onUnregister={onUnregister}
      />
    ));

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(onRegister).toHaveBeenCalledWith('left', expect.any(HTMLElement));
  });

  it('calls onUnregister on cleanup', () => {
    const onRegister = vi.fn();
    const onUnregister = vi.fn();

    const { unmount } = render(() => (
      <PanelDropZone
        position="right"
        active={false}
        visible={true}
        onRegister={onRegister}
        onUnregister={onUnregister}
      />
    ));

    unmount();

    expect(onUnregister).toHaveBeenCalledTimes(1);
    expect(onUnregister).toHaveBeenCalledWith('right');
  });

  it('shows active styling when active is true', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="left"
        active={true}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--active')).toBe(true);
    expect(dropZone.classList.contains('sk-drop-zone--inactive')).toBe(false);
  });

  it('shows inactive styling when active is false', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="left"
        active={false}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--inactive')).toBe(true);
    expect(dropZone.classList.contains('sk-drop-zone--active')).toBe(false);
  });

  it('hidden when visible is false', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="left"
        active={false}
        visible={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--hidden')).toBe(true);
  });

  it('positioned correctly for left position', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="left"
        active={false}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--left')).toBe(true);
  });

  it('positioned correctly for right position', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="right"
        active={false}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--right')).toBe(true);
  });

  it('positioned correctly for bottom position', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="bottom"
        active={false}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--bottom')).toBe(true);
  });

  it('positioned correctly for center position', () => {
    const { container } = render(() => (
      <PanelDropZone
        position="center"
        active={false}
        visible={true}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />
    ));

    const dropZone = container.firstChild as HTMLElement;
    expect(dropZone.classList.contains('sk-drop-zone--center')).toBe(true);
  });
});
