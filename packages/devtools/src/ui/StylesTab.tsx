import { Show, For, createMemo, createSignal } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { findMatchingRules } from '../engine/StylesheetMatcher';
import { traceVarChain } from '../engine/CssVariableTracer';
import { containsVar } from '../engine/css-parser';
import { cleanSourceName, classifyRule } from '../engine/RuleProvenance';
import type { MatchedRule, CssVarTrace } from '../context/types';

export function StylesTab() {
  const { state, themeName } = useDevTools();
  const [appOnly, setAppOnly] = createSignal(false);

  const rules = createMemo(() => {
    const el = state.inspectedElement;
    if (!el) return [];
    return findMatchingRules(el);
  });

  const hyperkitCount = createMemo(
    () => rules().filter((rule) => classifyRule(rule) === 'hyperkit').length,
  );
  const appCount = createMemo(() => rules().length - hyperkitCount());

  const visibleRules = createMemo(() =>
    appOnly() ? rules().filter((rule) => classifyRule(rule) === 'app') : rules(),
  );

  return (
    <div>
      <Show when={rules().length > 0} fallback={
        <div class="sk-devtools__empty">
          <div class="sk-devtools__empty-icon">&#128196;</div>
          <div class="sk-devtools__empty-text">Select an element to see its CSS rules</div>
        </div>
      }>
        <div class="sk-devtools__styles-summary">
          <span>
            {rules().length} rules &middot; {hyperkitCount()} HyperKit &middot; {appCount()} app
          </span>
          <button
            type="button"
            class="sk-devtools__styles-filter"
            classList={{ 'sk-devtools__styles-filter--active': appOnly() }}
            onClick={() => setAppOnly((v) => !v)}
          >
            App only
          </button>
        </div>
        <For each={visibleRules()}>
          {(rule) => (
            <div class="sk-devtools__rule">
              <div class="sk-devtools__rule-meta">
                <span class="sk-devtools__rule-file">{cleanSourceName(rule.source)}</span>
                <RuleOriginBadge rule={rule} />
              </div>
              <div class="sk-devtools__rule-selector">
                {rule.selector}
                <span class="sk-devtools__rule-specificity">
                  [{rule.specificity.join(',')}]
                </span>
              </div>
              <div style={{ 'padding-left': 'var(--sk-space-sm)' }}>
                <For each={Object.entries(rule.properties)}>
                  {([name, value]) => (
                    <div class="sk-devtools__prop">
                      <span class="sk-devtools__prop-name">{name}</span>
                      <span class="sk-devtools__trace-arrow"> : </span>
                      <span class="sk-devtools__prop-value">{value}</span>
                      <Show when={containsVar(value)}>
                        <VarTraces
                          element={state.inspectedElement!}
                          rawValue={value}
                          themeName={themeName()}
                        />
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}

function RuleOriginBadge(props: { rule: MatchedRule }) {
  const origin = createMemo(() => classifyRule(props.rule));

  return (
    <span
      class="sk-devtools__rule-origin"
      classList={{
        'sk-devtools__rule-origin--hyperkit': origin() === 'hyperkit',
        'sk-devtools__rule-origin--app': origin() === 'app',
      }}
    >
      {origin() === 'hyperkit' ? 'HyperKit' : 'App'}
    </span>
  );
}

function VarTraces(props: { element: HTMLElement; rawValue: string; themeName: string }) {
  const traces = createMemo(() => traceVarChain(props.element, props.rawValue, props.themeName));

  return (
    <div style={{ 'padding-left': 'var(--sk-space-lg)' }}>
      <For each={traces()}>
        {(trace) => <InlineTrace trace={trace} depth={0} />}
      </For>
    </div>
  );
}

function InlineTrace(props: { trace: CssVarTrace; depth: number }) {
  const isColor = createMemo(() => {
    const v = props.trace.value;
    return v ? /^(#|rgb|hsl)/.test(v) : false;
  });

  return (
    <div class="sk-devtools__trace" style={{ 'padding-left': `${props.depth * 16}px` }}>
      <Show when={props.depth > 0}>
        <span class="sk-devtools__trace-arrow">&#8627; </span>
      </Show>
      <span class="sk-devtools__trace-var">{props.trace.variable}</span>
      <span class="sk-devtools__trace-arrow"> : </span>
      <Show when={props.trace.isSet} fallback={<span class="sk-devtools__trace-unset">not set</span>}>
        <span class="sk-devtools__trace-value">{props.trace.value}</span>
        <Show when={isColor()}>
          <span class="sk-devtools__swatch" style={{ background: props.trace.value! }} />
        </Show>
      </Show>
      <Show when={props.trace.fallbackTrace}>
        <InlineTrace trace={props.trace.fallbackTrace!} depth={props.depth + 1} />
      </Show>
    </div>
  );
}
