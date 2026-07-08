import { type Component } from 'solid-js';
import { Icon } from './Icon';
import type { IconDef, SimpleIconProps } from './types';

/**
 * Factory that creates a shorthand icon component bound to a specific IconDef.
 *
 * @example
 * export const MergeIcon = makeIcon(MergeIconDef);
 * // Usage: <MergeIcon size="lg" style="glossy" />
 */
export function makeIcon(def: IconDef): Component<SimpleIconProps> {
  const IconComponent: Component<SimpleIconProps> = (props) => {
    return <Icon def={def} size={props.size} style={props.style} class={props.class} />;
  };

  // Preserve the def name for debugging
  Object.defineProperty(IconComponent, 'name', { value: `${def.name}Icon` });

  return IconComponent;
}
