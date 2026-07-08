import { Show, For, createMemo } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { auditThemeCompliance, summarizeThemeAudit } from '../engine/ThemeAuditEngine';
import { resolveAllTokens } from '../engine/CssVariableTracer';
import type { ThemeAuditRow, ThemeAuditStatus } from '../engine/ThemeAuditEngine';

const STATUS_ICON: Record<ThemeAuditStatus, string> = {
  'on-theme': '✓',
  'off-theme': '✗',
  'tiny-text': '⚠',
  default: '·',
};

function isColorValue(value: string): boolean {
  return /^(#|rgb|hsl)/.test(value);
}

export function ThemeAuditTab() {
  const { state } = useDevTools();

  const rows = createMemo<ThemeAuditRow[] | null>(() => {
    const el = state.inspectedElement;
    if (!el) return null;
    return auditThemeCompliance(el, resolveAllTokens());
  });

  const summary = createMemo(() => {
    const r = rows();
    return r ? summarizeThemeAudit(r) : null;
  });

  return (
    <div class="sk-devtools__theme-audit">
      <Show
        when={rows()}
        fallback={
          <div class="sk-devtools__empty">
            <div class="sk-devtools__empty-icon">&#127912;</div>
            <div class="sk-devtools__empty-text">
              Select an element to audit its theme compliance
            </div>
          </div>
        }
      >
        {(auditRows) => (
          <>
            <div class="sk-devtools__ta-summary">
              <span class="sk-devtools__ta-stat sk-devtools__ta-stat--on">
                {summary()!.onTheme} on-theme
              </span>
              <span class="sk-devtools__ta-dot">&#183;</span>
              <span class="sk-devtools__ta-stat sk-devtools__ta-stat--off">
                {summary()!.offTheme} off-theme
              </span>
              <span class="sk-devtools__ta-dot">&#183;</span>
              <span class="sk-devtools__ta-stat sk-devtools__ta-stat--tiny">
                {summary()!.tinyText} tiny-text
              </span>
              <span class="sk-devtools__ta-stat sk-devtools__ta-stat--default">
                ({summary()!.defaults} defaults skipped)
              </span>
            </div>

            <For each={auditRows()}>
              {(row) => (
                <div class={`sk-devtools__ta-row sk-devtools__ta-row--${row.status}`}>
                  <span class={`sk-devtools__ta-icon sk-devtools__ta-icon--${row.status}`}>
                    {STATUS_ICON[row.status]}
                  </span>
                  <span class="sk-devtools__ta-prop">{row.property}</span>
                  <span class="sk-devtools__ta-value">{row.computedValue || '—'}</span>
                  <Show when={isColorValue(row.computedValue)}>
                    <span
                      class="sk-devtools__swatch"
                      style={{ background: row.computedValue }}
                    />
                  </Show>
                  <Show when={row.token}>
                    <span class="sk-devtools__ta-token">{row.token}</span>
                  </Show>
                  <Show when={row.status === 'off-theme' && row.rawValue && row.rawValue !== row.computedValue}>
                    <span class="sk-devtools__ta-raw">declared: {row.rawValue}</span>
                  </Show>
                  <Show when={row.note}>
                    <span class={`sk-devtools__ta-note sk-devtools__ta-note--${row.status}`}>
                      {row.note}
                    </span>
                  </Show>
                </div>
              )}
            </For>
          </>
        )}
      </Show>
    </div>
  );
}
