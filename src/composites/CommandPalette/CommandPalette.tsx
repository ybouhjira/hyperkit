import {
  Component,
  createSignal,
  createMemo,
  For,
  Show,
  splitProps,
  createEffect,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import './CommandPalette.css';
import { useNavigableActions } from './useNavigableActions';

export interface CommandAction {
  id: string;
  label: string;
  /**
   * Visual marker shown before the label. Accepts:
   * - a string (emoji or single glyph), rendered as text
   * - a JSX element (e.g. an icon component, colored <ColorDot />, <Badge />)
   *   rendered directly
   */
  icon?: string | JSX.Element;
  category?: string; // e.g. "Navigation", "Panels", "Settings"
  shortcut?: string; // e.g. "⌘1", "⌘⇧F"
  handler: () => void;
  keywords?: string[]; // extra search terms
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Static action list.
   *
   * When `autoDiscover` is false (the default), this is the only source of
   * actions — preserving full backward compatibility.
   *
   * When `autoDiscover` is true, these are merged after discovered navigable
   * actions.  You may also pass them via the `extraCommands` alias.
   */
  actions: CommandAction[];
  /**
   * When true the palette auto-discovers all registered navigable actions via
   * {@link inspectNavigables} and merges them with `actions`/`extraCommands`.
   *
   * Defaults to `false` for backward compatibility.
   */
  autoDiscover?: boolean;
  /**
   * Additional static actions to include when `autoDiscover` is true.
   *
   * This is an alias for `actions` that communicates intent more clearly when
   * the primary source of commands is auto-discovery.  Both lists are merged.
   */
  extraCommands?: CommandAction[];
  placeholder?: string; // defaults to "Type a command..."
  emptyMessage?: string; // defaults to "No results found"
  class?: string;
}

interface GroupedActions {
  category: string;
  items: CommandAction[];
}

/**
 * ⌘K command palette with fuzzy search, keyboard navigation, grouped categories,
 * and optional auto-discovery of registered navigable actions.
 *
 * @example
 * ```tsx
 * import { CommandPalette, Button } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 * import { useKeyboard } from "@ybouhjira/hyperkit";
 *
 * // Basic palette with static actions
 * const [open, setOpen] = createSignal(false);
 * useKeyboard("cmd+k", () => setOpen(true));
 * <CommandPalette
 *   open={open()}
 *   onOpenChange={setOpen}
 *   actions={[
 *     { id: "new-project", label: "New Project", icon: "📁", category: "Projects", shortcut: "⌘N", handler: () => navigate("/projects/new") },
 *     { id: "settings", label: "Open Settings", icon: "⚙️", category: "App", shortcut: "⌘,", handler: () => navigate("/settings") },
 *     { id: "logout", label: "Sign Out", category: "Account", handler: () => signOut() },
 *   ]}
 *   placeholder="Search commands..."
 * />
 *
 * // Auto-discover all registered navigable actions
 * <CommandPalette
 *   open={open()}
 *   onOpenChange={setOpen}
 *   actions={[]}
 *   autoDiscover
 *   extraCommands={[
 *     { id: "help", label: "Open Help", icon: "❓", category: "Support", handler: () => openHelp() },
 *   ]}
 * />
 * ```
 *
 * @see SearchInput - for inline search within a page
 * @see MenuBar - for menu-based command access
 */
export const CommandPalette: Component<CommandPaletteProps> = (props) => {
  const [local] = splitProps(props, [
    'open',
    'onOpenChange',
    'actions',
    'autoDiscover',
    'extraCommands',
    'placeholder',
    'emptyMessage',
    'class',
  ]);

  const [discoveredActions, refreshDiscoveredActions] = useNavigableActions();

  const [query, setQuery] = createSignal('');
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  let inputRef: HTMLInputElement | undefined;

  /**
   * Merge all action sources based on props:
   *
   * - autoDiscover=false (default): `actions` prop only — identical to the
   *   previous behaviour.
   * - autoDiscover=true: discovered navigable actions + extraCommands +
   *   actions (deduped by id, first wins).
   */
  const allActions = createMemo((): CommandAction[] => {
    if (!local.autoDiscover) {
      return local.actions;
    }

    const seen = new Set<string>();
    const merged: CommandAction[] = [];

    const push = (action: CommandAction) => {
      if (!seen.has(action.id)) {
        seen.add(action.id);
        merged.push(action);
      }
    };

    for (const a of discoveredActions()) push(a);
    for (const a of local.extraCommands ?? []) push(a);
    for (const a of local.actions) push(a);

    return merged;
  });

  // Filter actions based on search query
  const filteredActions = createMemo(() => {
    const q = query().toLowerCase().trim();

    if (!q) {
      return allActions();
    }

    return allActions().filter((action) => {
      const searchText = [action.label, action.category || '', ...(action.keywords || [])]
        .join(' ')
        .toLowerCase();

      return searchText.includes(q);
    });
  });

  // Group actions by category
  const groupedResults = createMemo((): GroupedActions[] => {
    const actions = filteredActions();
    const groups = new Map<string, CommandAction[]>();

    actions.forEach((action) => {
      const category = action.category || 'Other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      const categoryGroup = groups.get(category);
      if (categoryGroup) {
        categoryGroup.push(action);
      }
    });

    // Sort categories alphabetically, with "Other" last
    const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });

    return sortedCategories.map((category) => ({
      category,
      items: groups.get(category) ?? [],
    }));
  });

  // Flatten results for keyboard navigation
  const flatResults = createMemo(() => {
    return groupedResults().flatMap((group) => group.items);
  });

  // Reset selectedIndex when query changes
  createEffect(() => {
    query();
    setSelectedIndex(0);
  });

  // Auto-focus input, reset state, and refresh discovered actions when opened
  createEffect(() => {
    if (local.open) {
      setQuery('');
      setSelectedIndex(0);
      if (local.autoDiscover) {
        refreshDiscoveredActions();
      }
      // Use setTimeout to ensure the input is rendered
      setTimeout(() => {
        inputRef?.focus();
      }, 0);
    }
  });

  // Scroll selected item into view
  createEffect(() => {
    const index = selectedIndex();
    const element = document.querySelector(`[data-item-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  });

  const executeItem = (item: CommandAction) => {
    item.handler();
    local.onOpenChange(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const results = flatResults();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIndex()];
      if (item) {
        executeItem(item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      local.onOpenChange(false);
    }
  };

  // Calculate flat index for each item (for mouse hover and selection)
  const getFlatIndex = (categoryIndex: number, itemIndex: number): number => {
    const groups = groupedResults();
    let flatIndex = 0;

    for (let i = 0; i < categoryIndex; i++) {
      const group = groups[i];
      if (group != null) {
        flatIndex += group.items.length;
      }
    }

    return flatIndex + itemIndex;
  };

  return (
    <Show when={local.open}>
      <Portal>
        <div class="sk-cmd-palette__overlay" onClick={() => local.onOpenChange(false)}>
          <div
            class="sk-cmd-palette"
            classList={{ [local.class || '']: !!local.class }}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="sk-cmd-palette__input-row">
              <span class="sk-cmd-palette__search-icon">⌘</span>
              <input
                ref={(el) => (inputRef = el)}
                class="sk-cmd-palette__input"
                type="text"
                role="combobox"
                aria-expanded={filteredActions().length > 0}
                aria-haspopup="listbox"
                aria-controls="cmd-palette-results"
                aria-autocomplete="list"
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                placeholder={local.placeholder ?? 'Type a command...'}
                autocomplete="off"
                spellcheck={false}
              />
            </div>
            <div class="sk-cmd-palette__results" id="cmd-palette-results" role="listbox">
              <Show when={filteredActions().length > 0}>
                <For each={groupedResults()}>
                  {(group, categoryIndex) => (
                    <>
                      <div class="sk-cmd-palette__category" role="presentation">
                        {group.category}
                      </div>
                      <For each={group.items}>
                        {(item, itemIndex) => {
                          const flatIndex = createMemo(() =>
                            getFlatIndex(categoryIndex(), itemIndex())
                          );
                          return (
                            <div
                              role="option"
                              aria-selected={selectedIndex() === flatIndex()}
                              class="sk-cmd-palette__item"
                              classList={{
                                'sk-cmd-palette__item--selected': selectedIndex() === flatIndex(),
                              }}
                              data-item-index={flatIndex()}
                              onMouseEnter={() => setSelectedIndex(flatIndex())}
                              onClick={() => executeItem(item)}
                            >
                              <Show when={item.icon}>
                                <span class="sk-cmd-palette__item-icon">{item.icon}</span>
                              </Show>
                              <span class="sk-cmd-palette__item-label">{item.label}</span>
                              <Show when={item.shortcut}>
                                <span class="sk-cmd-palette__item-shortcut">{item.shortcut}</span>
                              </Show>
                            </div>
                          );
                        }}
                      </For>
                    </>
                  )}
                </For>
              </Show>
              <Show when={filteredActions().length === 0}>
                <div class="sk-cmd-palette__empty">{local.emptyMessage ?? 'No results found'}</div>
              </Show>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
