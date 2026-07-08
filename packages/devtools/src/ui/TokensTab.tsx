import { For, createSignal, createMemo } from 'solid-js';
import { SearchInput, Accordion } from '@ybouhjira/hyperkit';
import { getAllTokenGroups, getThemeKey } from '../engine/TokenRegistry';

export function TokensTab() {
  const [search, setSearch] = createSignal('');
  const groups = getAllTokenGroups();

  const filteredGroups = createMemo(() => {
    const query = search().toLowerCase();
    if (!query) return groups;

    const filtered: Record<string, readonly string[]> = {};
    for (const [group, vars] of Object.entries(groups)) {
      const matching = vars.filter(
        (v) => v.toLowerCase().includes(query) || group.toLowerCase().includes(query),
      );
      if (matching.length > 0) filtered[group] = matching;
    }
    return filtered;
  });

  const accordionItems = createMemo(() =>
    Object.entries(filteredGroups()).map(([group, vars]) => ({
      value: group,
      title: `${group} (${vars.length})`,
      content: (
        <For each={vars as unknown as string[]}>
          {(varName) => <TokenRow varName={varName} />}
        </For>
      ),
    }))
  );

  return (
    <div>
      <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
        <SearchInput
          value={search()}
          placeholder="Filter tokens... (e.g. accent, spacing, radius)"
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
      </div>

      <Accordion
        items={accordionItems()}
        type="multiple"
        defaultValue={['Colors']}
      />
    </div>
  );
}

function TokenRow(props: { varName: string }) {
  const value = createMemo(() => {
    return getComputedStyle(document.documentElement).getPropertyValue(props.varName).trim();
  });

  const themeKey = createMemo(() => getThemeKey(props.varName));

  const isColor = createMemo(() => {
    const v = value();
    return v ? /^(#|rgb|hsl)/.test(v) : false;
  });

  return (
    <div class="sk-devtools__token-row">
      {isColor() ? (
        <span
          class="sk-devtools__swatch sk-devtools__swatch--lg"
          style={{ background: value(), 'flex-shrink': '0' }}
        />
      ) : (
        <span style={{ width: '20px', 'flex-shrink': '0' }} />
      )}
      <span class="sk-devtools__token-name">{props.varName}</span>
      <span class="sk-devtools__token-value">{value() || '(not set)'}</span>
      {themeKey() && (
        <span class="sk-devtools__token-key">{themeKey()}</span>
      )}
    </div>
  );
}
