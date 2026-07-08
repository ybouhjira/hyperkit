import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useThemeContext } from './ThemeProvider';
import { useShortcut } from '../keyboard';
import {
  auditThemeVars,
  logAuditResults,
  type ThemeAuditResult,
  type AuditGroupResult,
} from './auditThemeVars';

interface ThemeAuditorProps {
  /** Show floating overlay panel. Default: false (console only) */
  overlay?: boolean;
  /** Log to console. Default: true */
  console?: boolean;
}

const AuditorOverlay: Component<{ result: ThemeAuditResult; onClose: () => void }> = (props) => {
  const [expanded, setExpanded] = createSignal<string | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        'z-index': '99999',
        'max-width': '360px',
        'max-height': '480px',
        overflow: 'auto',
        background: 'var(--sk-bg-secondary)',
        color: 'var(--sk-text-primary)',
        'border-radius': '8px',
        'box-shadow': '0 8px 32px rgba(0,0,0,0.4)',
        'font-family': 'ui-monospace, monospace',
        'font-size': '12px',
        border: '1px solid var(--sk-border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          padding: '8px 12px',
          'border-bottom': '1px solid var(--sk-border)',
          background:
            props.result.totalFailed > 0
              ? 'color-mix(in srgb, var(--sk-error) 15%, var(--sk-bg-secondary))'
              : 'color-mix(in srgb, var(--sk-success) 15%, var(--sk-bg-secondary))',
        }}
      >
        <span style={{ 'font-weight': '600' }}>
          {props.result.totalFailed > 0 ? '⚠' : '✓'} Theme Audit
        </span>
        <span style={{ opacity: '0.7' }}>
          {props.result.totalPassed}/{props.result.totalVars}
        </span>
        <button
          onClick={() => props.onClose?.()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sk-text-muted)',
            cursor: 'pointer',
            'font-size': '14px',
            padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Groups */}
      <div style={{ padding: '4px 0' }}>
        <For each={props.result.groups}>
          {(group: AuditGroupResult) => (
            <div>
              <button
                onClick={() => setExpanded((prev) => (prev === group.group ? null : group.group))}
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'space-between',
                  width: '100%',
                  padding: '6px 12px',
                  background: 'none',
                  border: 'none',
                  color: group.failed > 0 ? 'var(--sk-error)' : 'var(--sk-success)',
                  cursor: 'pointer',
                  'font-family': 'inherit',
                  'font-size': 'inherit',
                  'text-align': 'left',
                }}
              >
                <span>
                  {group.failed > 0 ? '✗' : '✓'} {group.group}
                </span>
                <span style={{ opacity: '0.6' }}>
                  {group.passed}/{group.vars.length}
                </span>
              </button>
              <Show when={expanded() === group.group}>
                <div style={{ padding: '2px 12px 8px 24px' }}>
                  <For each={group.vars}>
                    {(v) => (
                      <div
                        style={{
                          padding: '2px 0',
                          color: v.status === 'ok' ? 'var(--sk-success)' : 'var(--sk-error)',
                          opacity: v.status === 'ok' ? '0.6' : '1',
                        }}
                      >
                        <span>{v.status === 'ok' ? '•' : '✗'} </span>
                        <span>{v.name.replace('--sk-', '')}</span>
                        <Show when={v.status === 'ok'}>
                          <span style={{ opacity: '0.4', 'margin-left': '8px' }}>
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
            onClick={() => setExpanded((prev) => (prev === '__comp' ? null : '__comp'))}
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              width: '100%',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              color: 'var(--sk-info)',
              cursor: 'pointer',
              'font-family': 'inherit',
              'font-size': 'inherit',
              'text-align': 'left',
            }}
          >
            <span>◆ Components</span>
            <span style={{ opacity: '0.6' }}>{props.result.componentVars.length}</span>
          </button>
          <Show when={expanded() === '__comp'}>
            <div style={{ padding: '2px 12px 8px 24px' }}>
              <For each={props.result.componentVars}>
                {(v) => (
                  <div style={{ padding: '2px 0', color: 'var(--sk-info)', opacity: '0.8' }}>
                    <span>• {v.name.replace('--sk-comp-', '')}</span>
                    <span style={{ opacity: '0.4', 'margin-left': '8px' }}>
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
