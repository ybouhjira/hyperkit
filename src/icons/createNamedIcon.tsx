import type { Component } from 'solid-js';
import { Icon } from './Icon';
import type { IconProps, IconSize } from './Icon';

type NamedIconProps = Omit<IconProps, 'name'> & {
  size?: IconSize | number;
};

// Helper to create named icon components that accept both IconSize tokens and numeric sizes
export const createNamedIcon =
  (name: string): Component<NamedIconProps> =>
  (props) => {
    const mappedSize = (): IconSize | undefined => {
      if (typeof props.size === 'number') {
        if (props.size <= 12) return 'xs';
        if (props.size <= 16) return 'sm';
        if (props.size <= 24) return 'md';
        if (props.size <= 32) return 'lg';
        return 'xl';
      }
      return props.size;
    };

    return <Icon name={name} {...props} size={mappedSize()} />;
  };
