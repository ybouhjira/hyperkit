import { Component, JSX, splitProps } from 'solid-js';
import { SpaceToken, mapSpace } from '../layout';

/**
 * Props for the Container component
 */
export interface ContainerProps {
  /** Maximum width of the container. Accepts preset sizes or custom CSS value.
   * @default 'xl' (1200px) */
  maxW?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  /** Horizontal padding using SpaceToken.
   * @default 'lg' */
  px?: SpaceToken;
  /** Vertical padding using SpaceToken */
  py?: SpaceToken;
  /** Whether to horizontally center the container with auto margins.
   * @default true */
  center?: boolean;
  /** Additional CSS classes */
  class?: string;
  /** Inline styles */
  style?: JSX.CSSProperties;
  /** Content to render inside the container */
  children?: JSX.Element;
}

const maxWidthMap: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  '2xl': '1400px',
};

/** Responsive container with max-width constraints and automatic centering. */
export const Container: Component<ContainerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'maxW',
    'px',
    'py',
    'center',
    'class',
    'style',
    'children',
  ]);

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };

    const maxWidth = local.maxW ? maxWidthMap[local.maxW] || local.maxW : '1200px';
    style['max-width'] = maxWidth;

    if (local.center !== false) {
      style['margin-left'] = 'auto';
      style['margin-right'] = 'auto';
    }

    if (local.px) {
      style['padding-left'] = mapSpace(local.px);
      style['padding-right'] = mapSpace(local.px);
    } else {
      style['padding-left'] = mapSpace('lg');
      style['padding-right'] = mapSpace('lg');
    }

    if (local.py) {
      style['padding-top'] = mapSpace(local.py);
      style['padding-bottom'] = mapSpace(local.py);
    }

    style.width = '100%';

    return style;
  };

  return (
    <div class={local.class} style={computedStyle()} {...others}>
      {local.children}
    </div>
  );
};
