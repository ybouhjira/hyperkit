import { Component, splitProps, Show } from 'solid-js';
import { Icon } from '../../icons';
import '@ybouhjira/hyperkit-styles/primitives/ProjectCard/ProjectCard.css';

/** Props for the ProjectCard component. */
export interface ProjectCardProps {
  /** Project name (required). */
  name: string;
  /** Icon name to display. If omitted, shows initials. */
  icon?: string;
  /** Background color for the icon area.
   * @default 'var(--sk-accent)' */
  color?: string;
  /** Subtitle text below the name. */
  subtitle?: string;
  /** Description text below the subtitle. */
  description?: string;
  /** Whether the project is pinned.
   * @default false */
  pinned?: boolean;
  /** Callback when pin button is clicked. */
  onTogglePin?: () => void;
  /** Callback when card is clicked. */
  onClick?: () => void;
  /** Additional CSS classes. */
  class?: string;
}

/** Project card with icon/initials, name, subtitle, description, and pin button. */
export const ProjectCard: Component<ProjectCardProps> = (props) => {
  const [local, others] = splitProps(props, [
    'name',
    'icon',
    'color',
    'subtitle',
    'description',
    'pinned',
    'onTogglePin',
    'onClick',
    'class',
  ]);

  const getInitials = () => {
    return local.name.slice(0, 2).toUpperCase();
  };

  const handlePinClick = (e: MouseEvent) => {
    e.stopPropagation();
    local.onTogglePin?.();
  };

  return (
    <div
      class={`sk-project-card ${local.class || ''}`}
      onClick={() => local.onClick?.()}
      role={local.onClick ? 'button' : undefined}
      tabIndex={local.onClick ? 0 : undefined}
      {...others}
    >
      <div
        class="sk-project-card__icon"
        style={{ 'background-color': local.color || 'var(--sk-accent)' }}
      >
        {local.icon ? <Icon name={local.icon} size="lg" /> : <span>{getInitials()}</span>}
      </div>

      <div class="sk-project-card__info">
        <div class="sk-project-card__header">
          <h3 class="sk-project-card__name">{local.name}</h3>
          <Show when={local.onTogglePin}>
            <button
              class="sk-project-card__pin"
              onClick={handlePinClick}
              type="button"
              aria-label={local.pinned ? 'Unpin' : 'Pin'}
            >
              <Icon name="star" size="sm" />
            </button>
          </Show>
        </div>

        <Show when={local.subtitle}>
          <div class="sk-project-card__subtitle">{local.subtitle}</div>
        </Show>

        <Show when={local.description}>
          <div class="sk-project-card__description">{local.description}</div>
        </Show>
      </div>
    </div>
  );
};
