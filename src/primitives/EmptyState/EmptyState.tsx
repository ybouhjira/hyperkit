import { type JSX, type Component, splitProps, Show } from 'solid-js';
import { Icon } from '../../icons';
import './EmptyState.css';

/** Props for the EmptyState component. */
export interface EmptyStateProps {
  /** Icon name to display above the title. */
  icon?: string;
  /** Main heading text. */
  title: string;
  /** Optional description text below the title. */
  description?: string;
  /** Optional action button or element. */
  action?: JSX.Element;
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Empty state placeholder with icon, title, description, and optional action.
 *
 * @example
 * ```tsx
 * import { EmptyState, Button } from "@ybouhjira/hyperkit";
 *
 * // Empty search results state
 * <Show when={results().length === 0}>
 *   <EmptyState
 *     icon="search"
 *     title="No results found"
 *     description={`No items match "${query()}". Try adjusting your search.`}
 *     action={
 *       <Button variant="ghost" onClick={() => setQuery("")}>Clear search</Button>
 *     }
 *   />
 * </Show>
 *
 * // First-run onboarding state
 * <EmptyState
 *   icon="folder"
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={
 *     <Button onClick={() => setShowCreateDialog(true)}>Create Project</Button>
 *   }
 * />
 *
 * // Read-only empty state (no action)
 * <EmptyState icon="bell" title="No notifications" description="You're all caught up!" />
 * ```
 *
 * @see ProgressBar - for progress states (loading)
 * @see Skeleton - for loading placeholders
 */
export const EmptyState: Component<EmptyStateProps> = (props) => {
  const [local, others] = splitProps(props, [
    'icon',
    'title',
    'description',
    'action',
    'class',
    'unstyled',
  ]);

  return (
    <div
      role="status"
      class={local.unstyled ? (local.class ?? '') : `sk-empty-state ${local.class ?? ''}`}
      {...others}
    >
      <Show when={local.icon}>
        {local.icon && (
          <div class={local.unstyled ? '' : 'sk-empty-state__icon'}>
            <Icon name={local.icon} size="xl" />
          </div>
        )}
      </Show>
      <h3 class={local.unstyled ? '' : 'sk-empty-state__title'}>{local.title}</h3>
      <Show when={local.description}>
        <p class={local.unstyled ? '' : 'sk-empty-state__description'}>{local.description}</p>
      </Show>
      <Show when={local.action}>
        <div class={local.unstyled ? '' : 'sk-empty-state__action'}>{local.action}</div>
      </Show>
    </div>
  );
};
