import { createSignal, createMemo, Show, For } from 'solid-js';
import { useUxAudit } from '../hooks/useUxAudit';
import { useDevTools } from '../context/DevToolsProvider';
import type { UxAuditCheck, LawScore } from '../engine/UxAuditEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreClass(score: number): string {
  if (score >= 8) return 'sk-devtools__ux-score--green';
  if (score >= 5) return 'sk-devtools__ux-score--yellow';
  return 'sk-devtools__ux-score--red';
}

function getOverallScoreClass(score: number): string {
  if (score >= 80) return 'sk-devtools__ux-overall--green';
  if (score >= 60) return 'sk-devtools__ux-overall--yellow';
  return 'sk-devtools__ux-overall--red';
}

function getSeveritySymbol(severity: UxAuditCheck['severity']): string {
  if (severity === 'pass') return '✓';
  if (severity === 'violation') return '✗';
  return '⚠';
}

function getSeverityClass(severity: UxAuditCheck['severity']): string {
  return `sk-devtools__ux-check-icon sk-devtools__ux-check-icon--${severity}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const LAW_ABBR: Record<number, string> = {
  1: 'Spd',
  2: 'Dep',
  3: 'Typ',
  4: 'Clr',
  5: 'Den',
  6: 'Mot',
  7: 'Key',
  8: 'Sdb',
  9: 'Sta',
  10: 'Emp',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LawCardProps {
  law: LawScore;
  active: boolean;
  onClick: () => void;
}

function LawCard(props: LawCardProps) {
  return (
    <button
      class="sk-devtools__ux-law-card"
      classList={{
        [getScoreClass(props.law.score)]: true,
        'sk-devtools__ux-law-card--active': props.active,
      }}
      onClick={props.onClick}
      title={`Law ${props.law.law}: ${props.law.name} — ${props.law.score}/10`}
    >
      <span class="sk-devtools__ux-law-card-score">{props.law.score}</span>
      <span class="sk-devtools__ux-law-card-abbr">{LAW_ABBR[props.law.law]}</span>
    </button>
  );
}

interface CheckRowProps {
  check: UxAuditCheck;
  onHighlight: (el: HTMLElement) => void;
}

function CheckRow(props: CheckRowProps) {
  return (
    <div
      class="sk-devtools__ux-check"
      classList={{ [`sk-devtools__ux-check--${props.check.severity}`]: true }}
    >
      <span class={getSeverityClass(props.check.severity)}>
        {getSeveritySymbol(props.check.severity)}
      </span>
      <div class="sk-devtools__ux-check-content">
        <span class="sk-devtools__ux-check-title">{props.check.title}</span>
        <Show when={props.check.detail !== props.check.title}>
          <span class="sk-devtools__ux-check-detail">{props.check.detail}</span>
        </Show>
        <Show when={props.check.severity !== 'pass'}>
          <span class="sk-devtools__ux-check-expected">
            Expected: {props.check.expected}
          </span>
        </Show>
      </div>
      <Show when={props.check.value}>
        <span class="sk-devtools__ux-check-value">{props.check.value}</span>
      </Show>
      <Show when={props.check.element}>
        <button
          class="sk-devtools__ux-inspect-btn"
          onClick={() => props.onHighlight(props.check.element!)}
          title="Highlight element"
        >
          &#9678;
        </button>
      </Show>
    </div>
  );
}

interface LawSectionProps {
  law: LawScore;
  expanded: boolean;
  onToggle: () => void;
  onHighlight: (el: HTMLElement) => void;
  filter: 'all' | 'violations' | 'warnings' | 'passes';
}

function LawSection(props: LawSectionProps) {
  const filteredChecks = createMemo(() => {
    if (props.filter === 'all') return props.law.checks;
    return props.law.checks.filter((c) => {
      if (props.filter === 'violations') return c.severity === 'violation';
      if (props.filter === 'warnings') return c.severity === 'warning';
      return c.severity === 'pass';
    });
  });

  return (
    <div
      class="sk-devtools__ux-law-section"
      id={`ux-law-${props.law.law}`}
    >
      <button
        class="sk-devtools__ux-law-header"
        onClick={props.onToggle}
      >
        <span class="sk-devtools__ux-law-arrow">
          {props.expanded ? '▼' : '▶'}
        </span>
        <span class="sk-devtools__ux-law-title">
          Law {props.law.law}: {props.law.name}
        </span>
        <span class={`sk-devtools__ux-law-score-badge ${getScoreClass(props.law.score)}`}>
          {props.law.score}/10
        </span>
        <span class="sk-devtools__ux-law-counts">
          <Show when={props.law.violationCount > 0}>
            <span class="sk-devtools__ux-count sk-devtools__ux-count--violation">
              {props.law.violationCount}✗
            </span>
          </Show>
          <Show when={props.law.warningCount > 0}>
            <span class="sk-devtools__ux-count sk-devtools__ux-count--warning">
              {props.law.warningCount}⚠
            </span>
          </Show>
          <Show when={props.law.passCount > 0}>
            <span class="sk-devtools__ux-count sk-devtools__ux-count--pass">
              {props.law.passCount}✓
            </span>
          </Show>
        </span>
      </button>

      <Show when={props.expanded}>
        <div class="sk-devtools__ux-law-checks">
          <Show
            when={filteredChecks().length > 0}
            fallback={
              <div class="sk-devtools__ux-check-empty">
                No {props.filter === 'all' ? 'checks' : props.filter} for this law.
              </div>
            }
          >
            <For each={filteredChecks()}>
              {(check) => (
                <CheckRow check={check} onHighlight={props.onHighlight} />
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
}

// ─── LLM Analysis Panel ───────────────────────────────────────────────────────

interface LlmAnalysisPanelProps {
  analysis: string;
  meta: { model: string; tokens?: { input: number; output: number }; duration_ms?: number } | null;
}

function LlmAnalysisPanel(props: LlmAnalysisPanelProps) {
  /** Render simple numbered-list markdown into JSX without pulling in a markdown dep */
  const lines = () => props.analysis.split('\n');

  return (
    <div class="sk-devtools__ux-llm-panel">
      <div class="sk-devtools__ux-llm-header">
        <span class="sk-devtools__ux-llm-title">AI Analysis</span>
        <Show when={props.meta}>
          {(m) => (
            <span class="sk-devtools__ux-llm-meta">
              <span class="sk-devtools__ux-llm-model">{m().model}</span>
              <Show when={m().duration_ms != null}>
                <span class="sk-devtools__ux-llm-duration">
                  {formatDuration(m().duration_ms!)}
                </span>
              </Show>
              <Show when={m().tokens}>
                {(t) => (
                  <span class="sk-devtools__ux-llm-tokens">
                    {t().input + t().output} tokens
                  </span>
                )}
              </Show>
            </span>
          )}
        </Show>
      </div>
      <div class="sk-devtools__ux-llm-body">
        <For each={lines()}>
          {(line) => {
            const trimmed = line.trim();
            if (!trimmed) return <div class="sk-devtools__ux-llm-spacer" />;
            // Numbered list item: "1. text" or "1) text"
            const listMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
            if (listMatch) {
              return (
                <div class="sk-devtools__ux-llm-item">
                  <span class="sk-devtools__ux-llm-item-num">{listMatch[1]}.</span>
                  <span class="sk-devtools__ux-llm-item-text">{listMatch[2]}</span>
                </div>
              );
            }
            // Sub-bullet: starts with "-" or "•"
            const subMatch = trimmed.match(/^[-•]\s+(.*)$/);
            if (subMatch) {
              return (
                <div class="sk-devtools__ux-llm-subitem">
                  <span class="sk-devtools__ux-llm-subitem-bullet">–</span>
                  <span class="sk-devtools__ux-llm-subitem-text">{subMatch[1]}</span>
                </div>
              );
            }
            // Section heading: all-caps or ends with ":"
            if (/^[A-Z][A-Z\s]+:?$/.test(trimmed) || trimmed.endsWith(':')) {
              return <div class="sk-devtools__ux-llm-heading">{trimmed}</div>;
            }
            // Plain paragraph text
            return <div class="sk-devtools__ux-llm-line">{trimmed}</div>;
          }}
        </For>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function UxAuditTab() {
  const { state, dispatch } = useDevTools();
  const { running, runAudit, llmRunning, llmError, llmMeta, runLlmAnalysis } = useUxAudit(dispatch);
  const result = () => state.uxAuditResult;
  const llmAnalysis = () => state.uxAuditLlmAnalysis;

  const [filter, setFilter] = createSignal<'all' | 'violations' | 'warnings' | 'passes'>('all');
  const [expandedLaws, setExpandedLaws] = createSignal<Set<number>>(new Set());
  const [activeLaw, setActiveLaw] = createSignal<number | null>(null);

  function toggleLaw(law: number) {
    setExpandedLaws((prev) => {
      const next = new Set(prev);
      if (next.has(law)) {
        next.delete(law);
      } else {
        next.add(law);
      }
      return next;
    });
  }

  function scrollToLaw(law: number) {
    setActiveLaw(law);
    setExpandedLaws((prev) => {
      const next = new Set(prev);
      next.add(law);
      return next;
    });
    // Scroll the law section into view
    requestAnimationFrame(() => {
      document.getElementById(`ux-law-${law}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function handleHighlight(el: HTMLElement) {
    dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: el });
  }

  function handleRunWithAi() {
    const r = result();
    if (!r || llmRunning()) return;
    void runLlmAnalysis(r);
  }

  const filteredLaws = createMemo(() => {
    const r = result();
    if (!r) return [];
    if (filter() === 'all') return r.laws;
    return r.laws.filter((law) => {
      if (filter() === 'violations') return law.violationCount > 0;
      if (filter() === 'warnings') return law.warningCount > 0;
      return law.passCount > 0;
    });
  });

  return (
    <div class="sk-devtools__ux-audit">
      {/* ── Top bar ───────────────────────────── */}
      <div class="sk-devtools__ux-toolbar">
        <div class="sk-devtools__ux-actions">
          <button
            class="sk-devtools__ux-run-btn"
            classList={{ 'sk-devtools__ux-run-btn--loading': running() }}
            onClick={() => runAudit()}
            disabled={running()}
          >
            {running() ? 'Auditing…' : 'Run Audit'}
          </button>

          <button
            class="sk-devtools__ux-ai-btn"
            classList={{ 'sk-devtools__ux-ai-btn--loading': llmRunning() }}
            onClick={handleRunWithAi}
            disabled={!result() || llmRunning()}
            title={
              !result()
                ? 'Run an audit first'
                : llmRunning()
                  ? 'AI analysis in progress…'
                  : 'Analyse results with Claude Haiku'
            }
          >
            {llmRunning() ? 'Analysing…' : 'Run with AI'}
            <Show when={!llmRunning()}>
              <span class="sk-devtools__ux-ai-model">haiku</span>
            </Show>
          </button>
        </div>

        <Show when={result()}>
          {(r) => (
            <div class="sk-devtools__ux-score-area">
              <span
                class={`sk-devtools__ux-overall-score ${getOverallScoreClass(r().overallScore)}`}
              >
                {r().overallScore}/100
              </span>
              <span class="sk-devtools__ux-audit-time">
                {formatTimestamp(r().timestamp)}
              </span>
            </div>
          )}
        </Show>
      </div>

      {/* ── LLM error banner ─────────────────── */}
      <Show when={llmError()}>
        {(err) => (
          <div class="sk-devtools__ux-llm-error">
            <span class="sk-devtools__ux-llm-error-icon">⚠</span>
            <pre class="sk-devtools__ux-llm-error-text">{err()}</pre>
          </div>
        )}
      </Show>

      {/* ── LLM analysis result ───────────────── */}
      <Show when={llmAnalysis()}>
        {(analysis) => (
          <LlmAnalysisPanel analysis={analysis()} meta={llmMeta()} />
        )}
      </Show>

      {/* ── Law score cards ───────────────────── */}
      <Show when={result()}>
        {(r) => (
          <div class="sk-devtools__ux-law-cards">
            <For each={r().laws}>
              {(law) => (
                <LawCard
                  law={law}
                  active={activeLaw() === law.law}
                  onClick={() => scrollToLaw(law.law)}
                />
              )}
            </For>
          </div>
        )}
      </Show>

      {/* ── Summary stats bar ─────────────────── */}
      <Show when={result()}>
        {(r) => (
          <div class="sk-devtools__ux-stats-bar">
            <button
              class="sk-devtools__ux-stat"
              classList={{ 'sk-devtools__ux-stat--active': filter() === 'violations' }}
              onClick={() => setFilter((f) => f === 'violations' ? 'all' : 'violations')}
            >
              <span class="sk-devtools__ux-stat-value sk-devtools__ux-stat-value--violation">
                {r().totalViolations}
              </span>
              <span class="sk-devtools__ux-stat-label">violations</span>
            </button>
            <button
              class="sk-devtools__ux-stat"
              classList={{ 'sk-devtools__ux-stat--active': filter() === 'warnings' }}
              onClick={() => setFilter((f) => f === 'warnings' ? 'all' : 'warnings')}
            >
              <span class="sk-devtools__ux-stat-value sk-devtools__ux-stat-value--warning">
                {r().totalWarnings}
              </span>
              <span class="sk-devtools__ux-stat-label">warnings</span>
            </button>
            <button
              class="sk-devtools__ux-stat"
              classList={{ 'sk-devtools__ux-stat--active': filter() === 'passes' }}
              onClick={() => setFilter((f) => f === 'passes' ? 'all' : 'passes')}
            >
              <span class="sk-devtools__ux-stat-value sk-devtools__ux-stat-value--pass">
                {r().totalPasses}
              </span>
              <span class="sk-devtools__ux-stat-label">passed</span>
            </button>
            <span class="sk-devtools__ux-stat-total">
              {r().totalChecks} total checks
            </span>
          </div>
        )}
      </Show>

      {/* ── Law detail accordion ──────────────── */}
      <Show
        when={result()}
        fallback={
          <div class="sk-devtools__empty">
            <div class="sk-devtools__empty-icon">&#9673;</div>
            <div class="sk-devtools__empty-text">
              Click "Run Audit" to score the UI against the 10 design laws.
            </div>
          </div>
        }
      >
        {(_r) => (
          <div class="sk-devtools__ux-laws">
            <Show
              when={filteredLaws().length > 0}
              fallback={
                <div class="sk-devtools__empty">
                  <div class="sk-devtools__empty-icon">&#10003;</div>
                  <div class="sk-devtools__empty-text">
                    No {filter()} found in current audit.
                  </div>
                </div>
              }
            >
              <For each={filteredLaws()}>
                {(law) => (
                  <LawSection
                    law={law}
                    expanded={expandedLaws().has(law.law)}
                    onToggle={() => toggleLaw(law.law)}
                    onHighlight={handleHighlight}
                    filter={filter()}
                  />
                )}
              </For>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
