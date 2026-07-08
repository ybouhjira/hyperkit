import { type Component } from 'solid-js';
import type { IconProps } from './types';
import { CATEGORY_PALETTES } from './palettes';
import { resolveSize } from './sizes';
import { useIconStyle } from './IconProvider';
import { getStyleRenderer } from './styles';

export const Icon: Component<IconProps> = (props) => {
  const contextStyle = useIconStyle();
  const style = () => props.style ?? contextStyle;
  const size = () => resolveSize(props.size);
  const palette = () => CATEGORY_PALETTES[props.def.category];
  const renderer = () => getStyleRenderer(style());

  return (
    <span
      class={props.class}
      style={{ display: 'inline-flex', 'vertical-align': 'middle' }}
      aria-hidden="true"
    >
      {renderer()(props.def.layers, palette(), size())}
    </span>
  );
};
