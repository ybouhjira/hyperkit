import { Component, JSX, splitProps, Show } from 'solid-js';
import './Card.css';
import { LivePulse } from '../LivePulse';

export interface CardProps {
  /** Visual style variant. Affects border, shadow, and background.
   * @default 'default' */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding size for card content.
   * @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Click event handler. Makes card clickable with cursor pointer. */
  onClick?: () => void;
  /** Enable hover effect without click handler.
   * @default false */
  hoverable?: boolean;
  /** When true, the card visually breathes + carries an animated accent
   * border to signal "this represents a live, running thing" (per
   * premium-ui Law #11). Auto-wraps the rendered card in a `LivePulse`.
   * @default false */
  live?: boolean;
  /** Accent border colour for the card. Accepts any CSS color value —
   * ideally an `--sk-*` token reference (e.g. `var(--sk-error)`) or a
   * data-driven status colour. Threads into the `--sk-card-border`
   * custom property read by Card.css (two-tier token pattern), so the
   * component never inline-styles the border itself. Applies to every
   * variant — including `elevated`, which is otherwise borderless — and
   * holds through hover so status colours never flicker to the theme
   * accent. When unset, the variant's themed border applies. */
  borderColor?: string;
  /** Card content. */
  children: JSX.Element;
  /** Remove all default styles, only apply classNames.
   * @default false */
  unstyled?: boolean;
  /** Custom class names for card root. */
  classNames?: {
    /** Class for root card element. */
    root?: string;
  };
  /** Additional CSS class for root element. */
  class?: string;
  /** Inline styles for root element. */
  style?: JSX.CSSProperties;
}

export interface CardHeaderProps {
  /** Header content. */
  children: JSX.Element;
  /** Remove default header styles.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

export interface CardTitleProps {
  /** Title content. */
  children: JSX.Element;
  /** Remove default title styles.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

export interface CardDescriptionProps {
  /** Description content. */
  children: JSX.Element;
  /** Remove default description styles.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

export interface CardContentProps {
  /** Content area children. */
  children: JSX.Element;
  /** Remove default content styles.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

export interface CardFooterProps {
  /** Footer content. */
  children: JSX.Element;
  /** Remove default footer styles.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** Inline styles. */
  style?: JSX.CSSProperties;
}

/**
 * Container component with multiple visual variants, optional padding, and hover/click states.
 * Composed of Header, Title, Description, Content, and Footer sub-components.
 *
 * @example
 * ```tsx
 * import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Text } from "@ybouhjira/hyperkit";
 *
 * // Full structured card with all sub-components
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Project Alpha</CardTitle>
 *     <CardDescription>Last updated 2 hours ago</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Text color="secondary">4 open tasks remaining in this sprint.</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button variant="ghost" size="sm">View Details</Button>
 *   </CardFooter>
 * </Card>
 *
 * // Clickable card with hover state
 * <Card variant="outlined" hoverable onClick={() => navigate(`/projects/${id}`)}>
 *   <CardContent>
 *     <Text weight="semibold">{project.name}</Text>
 *   </CardContent>
 * </Card>
 *
 * // Minimal card with no padding for custom content
 * <Card padding="none">
 *   <img src={thumbnail} style={{ width: "100%", "border-radius": "inherit" }} />
 * </Card>
 * ```
 *
 * @see Grid - for card grid layouts
 * @see Stack - for content inside cards
 */
export const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'padding',
    'onClick',
    'hoverable',
    'live',
    'borderColor',
    'children',
    'unstyled',
    'classNames',
    'class',
    'style',
  ]);

  const variant = () => local.variant || 'default';
  const padding = () => local.padding || 'md';
  const isInteractive = () => local.hoverable || !!local.onClick;

  const rootClasses = () => {
    if (local.unstyled) {
      return `${local.classNames?.root ?? ''} ${local.class ?? ''}`.trim();
    }

    const classes = ['sk-card', `sk-card--${variant()}`, `sk-card--padding-${padding()}`];

    if (isInteractive()) {
      classes.push(local.onClick ? 'sk-card--clickable' : 'sk-card--hoverable');
    }

    if (local.borderColor) {
      classes.push('sk-card--accent');
    }

    if (local.classNames?.root) {
      classes.push(local.classNames.root);
    }

    if (local.class) {
      classes.push(local.class);
    }

    return classes.join(' ');
  };

  // The borderColor prop threads into the `--sk-card-border` custom property
  // that Card.css reads — the component itself never sets `border` inline, so
  // theming stays token-driven. An explicit consumer `style` still wins.
  const rootStyle = (): JSX.CSSProperties | undefined =>
    local.borderColor ? { '--sk-card-border': local.borderColor, ...local.style } : local.style;

  const cardEl = (): JSX.Element => (
    <div class={rootClasses()} style={rootStyle()} onClick={() => local.onClick?.()} {...others}>
      {local.children}
    </div>
  );

  return (
    <Show when={local.live} fallback={cardEl()}>
      <LivePulse active={true}>{cardEl()}</LivePulse>
    </Show>
  );
};

export const CardHeader: Component<CardHeaderProps> = (props) => {
  const headerClass = () => {
    if (props.unstyled) {
      return (props.class ?? '').trim();
    }
    return `sk-card__header ${props.class ?? ''}`.trim();
  };

  return (
    <div class={headerClass()} style={props.style}>
      {props.children}
    </div>
  );
};

export const CardTitle: Component<CardTitleProps> = (props) => {
  const titleClass = () => {
    if (props.unstyled) {
      return (props.class ?? '').trim();
    }
    return `sk-card__title ${props.class ?? ''}`.trim();
  };

  return (
    <h3 class={titleClass()} style={props.style}>
      {props.children}
    </h3>
  );
};

export const CardDescription: Component<CardDescriptionProps> = (props) => {
  const descriptionClass = () => {
    if (props.unstyled) {
      return (props.class ?? '').trim();
    }
    return `sk-card__description ${props.class ?? ''}`.trim();
  };

  return (
    <p class={descriptionClass()} style={props.style}>
      {props.children}
    </p>
  );
};

export const CardContent: Component<CardContentProps> = (props) => {
  const contentClass = () => {
    if (props.unstyled) {
      return (props.class ?? '').trim();
    }
    return `sk-card__content ${props.class ?? ''}`.trim();
  };

  return (
    <div class={contentClass()} style={props.style}>
      {props.children}
    </div>
  );
};

export const CardFooter: Component<CardFooterProps> = (props) => {
  const footerClass = () => {
    if (props.unstyled) {
      return (props.class ?? '').trim();
    }
    return `sk-card__footer ${props.class ?? ''}`.trim();
  };

  return (
    <div class={footerClass()} style={props.style}>
      {props.children}
    </div>
  );
};
