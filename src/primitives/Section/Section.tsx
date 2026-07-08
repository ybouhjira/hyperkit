import { type Component, type JSX, splitProps, createMemo, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import './Section.css';

export interface SectionProps {
  /**
   * Background variant
   * @default 'default'
   */
  bg?: 'default' | 'muted' | 'accent' | 'gradient';

  /**
   * Vertical padding size
   * @default 'lg'
   */
  py?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Maximum width of inner content
   * @default '1200px'
   */
  maxWidth?: string;

  /**
   * Remove inner container constraint (full-width content)
   * @default false
   */
  fullBleed?: boolean;

  /**
   * Content to render inside the section
   */
  children: JSX.Element;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * Inline styles
   */
  style?: JSX.CSSProperties;

  /**
   * HTML element to render as
   * @default 'section'
   */
  as?: string;
}

/** Full-width section container with background variants and optional inner content constraint. */
export const Section: Component<SectionProps> = (props) => {
  const [local, others] = splitProps(props, [
    'bg',
    'py',
    'maxWidth',
    'fullBleed',
    'children',
    'class',
    'style',
    'as',
  ]);

  const bgClass = createMemo(() => {
    switch (local.bg ?? 'default') {
      case 'muted':
        return 'sk-section--muted';
      case 'accent':
        return 'sk-section--accent';
      case 'gradient':
        return 'sk-section--gradient';
      default:
        return '';
    }
  });

  const pyClass = createMemo(() => {
    const py = local.py ?? 'lg';
    return `sk-section--py-${py}`;
  });

  const classList = createMemo(() => {
    const classes = ['sk-section', bgClass(), pyClass()];
    if (local.class) {
      classes.push(local.class);
    }
    return classes.filter(Boolean).join(' ');
  });

  const sectionStyle = createMemo((): JSX.CSSProperties => {
    return {
      ...local.style,
    };
  });

  const innerStyle = createMemo((): JSX.CSSProperties => {
    if (local.maxWidth) {
      return {
        '--sk-section-max-width': local.maxWidth,
      } as JSX.CSSProperties;
    }
    return {};
  });

  return (
    <Dynamic
      component={local.as ?? 'section'}
      class={classList()}
      style={sectionStyle()}
      {...others}
    >
      <Show when={!local.fullBleed} fallback={local.children}>
        <div class="sk-section__inner" style={innerStyle()}>
          {local.children}
        </div>
      </Show>
    </Dynamic>
  );
};
