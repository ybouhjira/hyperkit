import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useThemeContext } from './ThemeProvider';
import { useShortcut } from '../keyboard';
import {
  auditThemeVars,
  logAuditResults,
  type ThemeAuditResult,
  type AuditGroupResult,
} from './auditThemeVars';
import '@ybouhjira/hyperkit-styles/theme/ThemeAuditor.css';

interface ThemeAuditorProps {
  /** Show floating overlay panel. Default: false (console only) */
  overlay?: boolean;
  /** Log to console. Default: true */
  console?: boolean;
}

const AuditorOverlay: Component<{ result: ThemeAuditResult; onClose: () => void }> = (props) => {
  const [expanded, setExpanded] = createSignal<string | null>(null);

  return (
    <div class="sk-theme-auditor">
      {/* Header */}
      <div
        classList={{
          'sk-theme-auditor__header': true,
          'sk-theme-auditor__header--fail': props.result.totalFailed > 0,
          'sk-theme-auditor__header--pass': props.result.totalFailed === 0,
        }}
      >
        <span class="sk-theme-auditor__title">
          {props.result.totalFailed > 0 ? '⚠' : '✓'} Theme Audit
        </span>
        <span class="sk-theme-auditor__count">
          {props.result.totalPassed}/{props.result.totalVars}
        </span>
        <button class="sk-theme-auditor__close" onClick={() => props.onClose?.()}>
          ×
        </button>
      </div>

      {/* Groups */}
      <div class="sk-theme-auditor__groups">
        <For each={props.result.groups}>
          {(group: AuditGroupResult) => (
            <div>
              <button
                classList={{
                  'sk-theme-auditor__group-toggle': true,
                  'sk-theme-auditor__group-toggle--fail': group.failed > 0,
                  'sk-theme-auditor__group-toggle--pass': group.failed === 0,
                }}
                onClick={() => setExpanded((prev) => (prev === group.group ? null : group.group))}
              >
                <span>
                  {group.failed > 0 ? '✗' : '✓'} {group.group}
                </span>
                <span class="sk-theme-auditor__group-count">
                  {group.passed}/{group.vars.length}
                </span>
              </button>
              <Show when={expanded() === group.group}>
                <div class="sk-theme-auditor__group-vars">
                  <For each={group.vars}>
                    {(v) => (
                      <div
                        classList={{
                          'sk-theme-auditor__var': true,
                          'sk-theme-auditor__var--ok': v.status === 'ok',
                          'sk-theme-auditor__var--fail': v.status !== 'ok',
                        }}
                      >
                        <span>{v.status === 'ok' ? '•' : '✗'} </span>
                        <span>{v.name.replace('--sk-', '')}</span>
                        <Show when={v.status === 'ok'}>
                          <span class="sk-theme-auditor__var-value">
                            {v.value.length > 20 ? v.value.slice(0, 20) + '…' : v.value}
                          </span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )}
        </For>

        {/* Component overrides section */}
        <Show when={props.result.componentVars.length > 0}>
          <button
            class="sk-theme-auditor__group-toggle sk-theme-auditor__group-toggle--comp"
            onClick={() => setExpanded((prev) => (prev === '__comp' ? null : '__comp'))}
          >
            <span>◆ Components</span>
            <span class="sk-theme-auditor__group-count">{props.result.componentVars.length}</span>
          </button>
          <Show when={expanded() === '__comp'}>
            <div class="sk-theme-auditor__group-vars">
              <For each={props.result.componentVars}>
                {(v) => (
                  <div class="sk-theme-auditor__var sk-theme-auditor__var--comp">
                    <span>• {v.name.replace('--sk-comp-', '')}</span>
                    <span class="sk-theme-auditor__var-value">
                      {v.value.length > 20 ? v.value.slice(0, 20) + '…' : v.value}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

/**
 * Dev-mode theme CSS variable auditor.
 * Scans the DOM for expected --sk-* vars and reports missing ones.
 *
 * Zero-cost in production — completely tree-shaken via import.meta.env.DEV.
 *
 * @example
 * <ThemeProvider>
 *   <ThemeAuditor overlay />
 *   <App />
 * </ThemeProvider>
 */
export const ThemeAuditor: Component<ThemeAuditorProps> = (props) => {
  const { theme } = useThemeContext();
  const [result, setResult] = createSignal<ThemeAuditResult | null>(null);
  const [showOverlay, setShowOverlay] = createSignal(false);

  // Sync overlay prop to state
  createEffect(() => {
    setShowOverlay(props.overlay ?? false);
  });

  createEffect(() => {
    // Re-audit whenever theme changes
    const _theme = theme();
    // Small delay to let applyThemeToDOM finish
    const timer = setTimeout(() => {
      const auditResult = auditThemeVars();
      setResult(auditResult);
      if (props.console !== false) {
        logAuditResults(auditResult);
      }
    }, 50);
    return () => clearTimeout(timer);
  });

  useShortcut({
    key: 't',
    ctrl: true,
    shift: true,
    handler: () => setShowOverlay((prev) => !prev),
    description: 'Toggle theme auditor',
    category: 'Developer',
  });

  return (
    <Show when={import.meta.env.DEV}>
      <Show when={showOverlay() && result()}>
        {(r) => <AuditorOverlay result={r()} onClose={() => setShowOverlay(false)} />}
      </Show>
    </Show>
  );
};
