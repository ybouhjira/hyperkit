import { Component, For, JSX, Show, createMemo, createSignal } from 'solid-js';
import './FileExplorer.css';

export interface PathBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  /** When true the user can click-to-edit the raw path string */
  editable?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * Clickable breadcrumb trail showing the current filesystem path.
 *
 * Each segment is clickable and navigates to that prefix path.
 * When `editable` is true, clicking the entire breadcrumb enters an input
 * where the user can type a path directly. Esc cancels, Enter commits.
 *
 * @example
 * <PathBreadcrumb
 *   path="/home/user/projects"
 *   onNavigate={(p) => setCurrentPath(p)}
 *   editable
 * />
 */
export const PathBreadcrumb: Component<PathBreadcrumbProps> = (props) => {
  const [editMode, setEditMode] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');

  const segments = createMemo(() => {
    const parts = props.path.split('/').filter(Boolean);
    return parts.map((part, idx) => ({
      name: part,
      path: '/' + parts.slice(0, idx + 1).join('/'),
    }));
  });

  const enterEdit = () => {
    if (!props.editable) return;
    setEditValue(props.path);
    setEditMode(true);
  };

  const commitEdit = () => {
    const val = editValue().trim();
    if (val) props.onNavigate(val);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    else if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div
      class={`sk-fe-breadcrumb${props.editable ? ' sk-fe-breadcrumb--editable' : ''}${props.class ? ` ${props.class}` : ''}`}
      style={props.style}
      data-testid="path-breadcrumb"
    >
      <Show
        when={editMode()}
        fallback={
          <>
            {/* Root segment */}
            <button
              class="sk-fe-breadcrumb__segment sk-fe-breadcrumb__segment--root"
              onClick={() => props.onNavigate('/')}
              aria-label="Go to root"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>

            <For each={segments()}>
              {(segment, idx) => (
                <>
                  <span class="sk-fe-breadcrumb__separator" aria-hidden="true">
                    /
                  </span>
                  <button
                    class={`sk-fe-breadcrumb__segment${
                      idx() === segments().length - 1 ? ' sk-fe-breadcrumb__segment--current' : ''
                    }`}
                    onClick={() => {
                      if (idx() === segments().length - 1 && props.editable) {
                        enterEdit();
                      } else {
                        props.onNavigate(segment.path);
                      }
                    }}
                    aria-current={idx() === segments().length - 1 ? 'page' : undefined}
                  >
                    {segment.name}
                  </button>
                </>
              )}
            </For>

            {/* If editable and no segments (root "/"), allow editing root */}
            <Show when={props.editable && segments().length === 0}>
              <button
                class="sk-fe-breadcrumb__segment sk-fe-breadcrumb__segment--edit-hint"
                onClick={enterEdit}
                title="Edit path"
              >
                /
              </button>
            </Show>
          </>
        }
      >
        {/* Edit mode: inline path input */}
        <input
          type="text"
          class="sk-fe-breadcrumb__edit-input"
          value={editValue()}
          onInput={(e) => setEditValue(e.currentTarget.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={commitEdit}
          ref={(el) =>
            setTimeout(() => {
              el?.select();
            }, 0)
          }
          aria-label="Edit path"
          data-testid="breadcrumb-edit-input"
        />
      </Show>
    </div>
  );
};
