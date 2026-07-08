import { Show, For, createMemo } from 'solid-js';
import { Badge } from '@ybouhjira/hyperkit';
import { useDevTools } from '../context/DevToolsProvider';
import { identifyComponent, describeBem } from '../engine/ComponentIdentifier';
import type { BemModifierPart } from '../engine/ComponentIdentifier';
import { tokensConsumed } from '../engine/TokensConsumed';
import type { ConsumedToken } from '../engine/TokensConsumed';
import { resolveAllTokens } from '../engine/CssVariableTracer';
import { useElementStyles } from '../hooks/useElementStyles';
import type { CssVarTrace, InspectedProperty } from '../context/types';

const MODIFIER_BADGE_VARIANT: Record<BemModifierPart['kind'], 'info' | 'default' | 'warning'> = {
  variant: 'info',
  size: 'default',
  state: 'warning',
  other: 'default',
};

export function InspectTab() {
  const { state } = useDevTools();
  const styles = useElementStyles();

  const componentInfo = createMemo(() => {
    const el = state.inspectedElement;
    if (!el) return null;
    return identifyComponent(el);
  });

  const bem = createMemo(() => {
    const el = state.inspectedElement;
    if (!el) return null;
    return describeBem(Array.from(el.classList));
  });

  const tokens = createMemo<ConsumedToken[]>(() => {
    const el = state.inspectedElement;
    if (!el) return [];
    return tokensConsumed(el, resolveAllTokens());
  });

  const keyProperties = createMemo(() => {
    return styles().filter((p) => p.traces.length > 0).slice(0, 12);
  });

  return (
    <div>
      <Show when={componentInfo()} fallback={
        <div class="sk-devtools__empty">
          <div class="sk-devtools__empty-icon">&#9678;</div>
          <div class="sk-devtools__empty-text">Click the inspect button, then select an element</div>
        </div>
      }>
        {(info) => (
          <>
            {/* HyperKit identity — eyebrow + component name + modifiers */}
            <div class="sk-devtools__hk-eyebrow">
              <span class="sk-devtools__hk-mark">&#11041;</span>
              <Show when={bem()!.isKnown} fallback={<span>sk-* element</span>}>
                <span>HyperKit component</span>
              </Show>
            </div>
            <div class="sk-devtools__component-header">
              <span class="sk-devtools__component-name">{info().name}</span>
              <Show when={info().subPart}>
                {(part) => <span class="sk-devtools__component-part">&#8250; {part()}</span>}
              </Show>
              <For each={bem()!.modifiers}>
                {(mod) => <Badge variant={MODIFIER_BADGE_VARIANT[mod.kind]}>{mod.name}</Badge>}
              </For>
            </div>

            {/* BEM structure — block · parts · modifiers, the framework view */}
            <div class="sk-devtools__section">
              <span class="sk-devtools__section-icon">&#9707;</span>
              Structure
            </div>
            <div class="sk-devtools__bem-row">
              <span class="sk-devtools__bem-kind">block</span>
              <span class="sk-devtools__bem-class">{bem()!.block}</span>
              <span class="sk-devtools__bem-arrow">&#8594;</span>
              <span class="sk-devtools__bem-name">{bem()!.name}</span>
            </div>
            <For each={bem()!.elements}>
              {(el) => (
                <div class="sk-devtools__bem-row">
                  <span class="sk-devtools__bem-kind">part</span>
                  <span class="sk-devtools__bem-class">{el.raw}</span>
                  <span class="sk-devtools__bem-arrow">&#8594;</span>
                  <span class="sk-devtools__bem-name">{el.name}</span>
                </div>
              )}
            </For>
            <For each={bem()!.modifiers}>
              {(mod) => (
                <div class="sk-devtools__bem-row">
                  <span class="sk-devtools__bem-kind">{mod.kind}</span>
                  <span class="sk-devtools__bem-class">{mod.raw}</span>
                  <span class="sk-devtools__bem-arrow">&#8594;</span>
                  <span class="sk-devtools__bem-name">{mod.name}</span>
                </div>
              )}
            </For>

            <Show when={info().parentComponent}>
              {(parent) => (
                <div class="sk-devtools__detail">
                  <span class="sk-devtools__detail-label">Inside</span>
                  <span class="sk-devtools__detail-value">{parent()}</span>
                </div>
              )}
            </Show>

            {/* Design tokens this element's HyperKit styles consume */}
            <Show when={tokens().length > 0}>
              <div class="sk-devtools__section">
                <span class="sk-devtools__section-icon">&#9881;</span>
                Tokens consumed ({tokens().length})
              </div>
              <For each={tokens()}>
                {(token) => <TokenRow token={token} />}
              </For>
            </Show>

            {/* Key styles with traces */}
            <Show when={keyProperties().length > 0}>
              <div class="sk-devtools__section">
                <span class="sk-devtools__section-icon">&#127912;</span>
                Key Styles
              </div>
              <For each={keyProperties()}>
                {(prop) => <PropertyRow property={prop} />}
              </For>
            </Show>

            {/* Raw classes — secondary reference */}
            <div class="sk-devtools__detail sk-devtools__detail--secondary">
              <span class="sk-devtools__detail-label">Classes</span>
              <span class="sk-devtools__detail-value">{info().classes.join('  ')}</span>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}

function TokenRow(props: { token: ConsumedToken }) {
  return (
    <div class="sk-devtools__token-row">
      <Show when={props.token.isColor}>
        <span class="sk-devtools__swatch" style={{ background: props.token.value! }} />
      </Show>
      <span class="sk-devtools__token-name">{props.token.name}</span>
      <Show when={props.token.value} fallback={<span class="sk-devtools__trace-unset">not set</span>}>
        <span class="sk-devtools__token-value">{props.token.value}</span>
      </Show>
      <span class="sk-devtools__token-key">{props.token.properties.join(', ')}</span>
    </div>
  );
}

function PropertyRow(props: { property: InspectedProperty }) {
  return (
    <div class="sk-devtools__prop">
      <div class="sk-devtools__prop-header">
        <span class="sk-devtools__prop-name">{props.property.name}</span>
        <span class="sk-devtools__prop-value">{props.property.computedValue}</span>
      </div>
      <div class="sk-devtools__prop-raw">{props.property.rawValue}</div>
      <For each={props.property.traces}>
        {(trace) => <TraceRow trace={trace} indent={0} />}
      </For>
    </div>
  );
}

function TraceRow(props: { trace: CssVarTrace; indent: number }) {
  const isColor = createMemo(() => {
    const v = props.trace.value;
    return v ? /^(#|rgb|hsl)/.test(v) : false;
  });

  return (
    <div class="sk-devtools__trace" style={{ 'padding-left': `${16 + props.indent * 16}px` }}>
      <Show when={props.indent > 0}>
        <span class="sk-devtools__trace-arrow">&#8627;</span>
      </Show>
      <span class="sk-devtools__trace-var">{props.trace.variable}</span>
      <span class="sk-devtools__trace-arrow"> : </span>
      <Show when={props.trace.isSet} fallback={<span class="sk-devtools__trace-unset">not set</span>}>
        <span class="sk-devtools__trace-value">{props.trace.value}</span>
        <Show when={isColor()}>
          <span class="sk-devtools__swatch" style={{ background: props.trace.value! }} />
        </Show>
      </Show>
      <Show when={props.trace.source.type === 'theme'}>
        <span class="sk-devtools__trace-source">
          {' '}&#8592; {(props.trace.source as { key: string }).key}
        </span>
      </Show>
      <Show when={props.trace.fallbackTrace}>
        <TraceRow trace={props.trace.fallbackTrace!} indent={props.indent + 1} />
      </Show>
    </div>
  );
}
