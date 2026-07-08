import { createSignal, For, Show, createMemo } from 'solid-js';
import type { Component } from 'solid-js';
import { Dialog } from '../primitives/Dialog';
import { useKeyboard } from './useKeyboard';
import { formatShortcut } from './formatShortcut';
import type { ShortcutsHelpProps, ShortcutRegistration } from './types';
import './ShortcutsHelp.css';

export const ShortcutsHelp: Component<ShortcutsHelpProps> = (props) => {
  const { shortcuts } = useKeyboard();
  const [search, setSearch] = createSignal('');

  const grouped = createMemo(() => {
    const query = search().toLowerCase();
    const filtered = shortcuts().filter(
      (s) =>
        !query ||
        s.description.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query) ||
        (s.category ?? 'General').toLowerCase().includes(query)
    );

    const map = new Map<string, ShortcutRegistration[]>();
    for (const s of filtered) {
      const cat = s.category ?? 'General';
      const list = map.get(cat) ?? [];
      list.push(s);
      map.set(cat, list);
    }
    return Array.from(map.entries());
  });

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      title="Keyboard Shortcuts"
      class={`sk-shortcuts-help ${props.class ?? ''}`}
    >
      <div class="sk-shortcuts-help__search">
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="sk-shortcuts-help__search-input"
        />
      </div>
      <div class="sk-shortcuts-help__list">
        <For each={grouped()}>
          {([category, items]) => (
            <div class="sk-shortcuts-help__group">
              <h3 class="sk-shortcuts-help__category">{category}</h3>
              <div class="sk-shortcuts-help__items">
                <For each={items}>
                  {(item) => (
                    <div class="sk-shortcuts-help__item">
                      <span class="sk-shortcuts-help__description">{item.description}</span>
                      <kbd class="sk-shortcuts-help__kbd">{formatShortcut(item)}</kbd>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
        <Show when={grouped().length === 0}>
          <div class="sk-shortcuts-help__empty">No shortcuts found</div>
        </Show>
      </div>
    </Dialog>
  );
};
