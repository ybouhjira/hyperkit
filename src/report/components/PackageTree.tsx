import { type JSX, type Component, splitProps, For, Show } from 'solid-js';

export interface PackageBox {
  name: string;
  note?: string;
  items?: string[];
  chips?: { label: string; detail?: string }[];
}

export interface PackageTreeProps {
  boxes: PackageBox[];
  class?: string;
  style?: JSX.CSSProperties;
}

export const PackageTree: Component<PackageTreeProps> = (props) => {
  const [local, rest] = splitProps(props, ['boxes', 'class', 'style']);

  return (
    <div class={`sk-report-pkg-grid ${local.class || ''}`} style={local.style} {...rest}>
      <For each={local.boxes}>
        {(box) => (
          <div class="sk-report-pkg-box">
            <div class="sk-report-pkg-box__name">{box.name}</div>
            <Show when={box.note}>
              <div class="sk-report-pkg-box__note">{box.note}</div>
            </Show>
            <Show when={box.items && box.items.length > 0}>
              <ul class="sk-report-pkg-tree">
                <For each={box.items}>
                  {(item) => <li class="sk-report-pkg-tree__item">{item}</li>}
                </For>
              </ul>
            </Show>
            <Show when={box.chips && box.chips.length > 0}>
              <div class="sk-report-pkg-box__chips">
                <For each={box.chips}>
                  {(chip) => (
                    <div class="sk-report-pkg-chip">
                      <span class="sk-report-pkg-chip__label">{chip.label}</span>
                      <Show when={chip.detail}>
                        <span class="sk-report-pkg-chip__detail">{chip.detail}</span>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
};
