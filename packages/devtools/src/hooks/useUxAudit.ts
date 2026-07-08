import { createSignal } from 'solid-js';
import { runUxAudit } from '../engine/UxAuditEngine';
import type { UxAuditResult, LawScore } from '../engine/UxAuditEngine';
import type { DevToolsAction } from '../context/types';

// ─── LLM Bridge Interface ─────────────────────────────────────────────────────

/**
 * Generic LLM bridge that host apps can provide.
 * Injected via `window.__llmBridge` or DevBridge HTTP API.
 */
export interface LlmBridgeRequest {
  model: string;
  system: string;
  prompt: string;
}

export interface LlmBridgeResponse {
  text: string;
  tokens?: { input: number; output: number };
  duration_ms?: number;
  model?: string;
  error?: string;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a UX design expert reviewing a SolidJS application against the Premium UI Design System v5 (10 Laws).
You receive programmatic audit results and must provide actionable recommendations.
Be specific — reference exact CSS properties, component names, and values to change.
Keep it concise — max 5 recommendations, priority ordered.
Format: numbered list, each with: issue, fix, impact (high/medium/low).`;

function buildUserPrompt(result: UxAuditResult, product?: string): string {
  const lines: string[] = [];

  if (product) {
    lines.push(`App: ${product}`);
  }

  lines.push(`Overall score: ${result.overallScore}/100`);
  lines.push(`Checks: ${result.totalChecks} total — ${result.totalViolations} violations, ${result.totalWarnings} warnings, ${result.totalPasses} passed`);
  lines.push('');
  lines.push('── Law scores ──');

  for (const law of result.laws) {
    lines.push(`Law ${law.law} (${law.name}): ${law.score}/10 — ${law.violationCount}✗ ${law.warningCount}⚠ ${law.passCount}✓`);
  }

  const allViolations = result.laws.flatMap((l: LawScore) =>
    l.checks.filter((c) => c.severity === 'violation').map((c) => ({ ...c, lawName: l.name }))
  );
  const allWarnings = result.laws.flatMap((l: LawScore) =>
    l.checks.filter((c) => c.severity === 'warning').map((c) => ({ ...c, lawName: l.name }))
  );

  if (allViolations.length > 0) {
    lines.push('');
    lines.push('── Violations ──');
    for (const v of allViolations) {
      lines.push(`[Law ${v.law} — ${v.lawName}] ${v.title}`);
      if (v.detail !== v.title) lines.push(`  Detail: ${v.detail}`);
      lines.push(`  Expected: ${v.expected}`);
      if (v.value) lines.push(`  Actual: ${v.value}`);
    }
  }

  if (allWarnings.length > 0) {
    lines.push('');
    lines.push('── Warnings ──');
    for (const w of allWarnings.slice(0, 10)) {
      // Cap to 10 to stay within reasonable token budget
      lines.push(`[Law ${w.law} — ${w.lawName}] ${w.title}`);
      if (w.detail !== w.title) lines.push(`  Detail: ${w.detail}`);
      if (w.value) lines.push(`  Actual: ${w.value}`);
    }
    if (allWarnings.length > 10) {
      lines.push(`  ... and ${allWarnings.length - 10} more warnings.`);
    }
  }

  lines.push('');
  lines.push('Based on the above, provide your top 5 actionable recommendations (priority order, most impactful first).');

  return lines.join('\n');
}

// ─── LLM call strategies ──────────────────────────────────────────────────────

/** Try window.__llmBridge (Electron / host app injection) */
async function tryWindowBridge(req: LlmBridgeRequest): Promise<LlmBridgeResponse | null> {
  const bridge = (window as unknown as Record<string, unknown>)['__llmBridge'];
  if (typeof bridge !== 'object' || bridge === null) return null;
  const call = (bridge as Record<string, unknown>)['call'];
  if (typeof call !== 'function') return null;
  try {
    const result = await (call as (r: LlmBridgeRequest) => Promise<LlmBridgeResponse>)(req);
    return result;
  } catch {
    return null;
  }
}

/** Try DevBridge HTTP API at localhost:9999 */
async function tryDevBridge(req: LlmBridgeRequest): Promise<LlmBridgeResponse | null> {
  try {
    const res = await fetch('http://localhost:9999/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as LlmBridgeResponse;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUxAudit(dispatch: (action: DevToolsAction) => void) {
  const [running, setRunning] = createSignal(false);
  const [llmRunning, setLlmRunning] = createSignal(false);
  const [llmError, setLlmError] = createSignal<string | null>(null);
  const [llmMeta, setLlmMeta] = createSignal<{
    model: string;
    tokens?: { input: number; output: number };
    duration_ms?: number;
  } | null>(null);

  function runAudit(root?: HTMLElement) {
    setRunning(true);
    // Use requestAnimationFrame to not block UI — let the browser finish painting first
    requestAnimationFrame(() => {
      try {
        const target = root ?? document.body;
        const auditResult = runUxAudit(target);
        dispatch({ type: 'SET_UX_AUDIT_RESULT', payload: auditResult });
        // Clear previous LLM analysis when re-running audit
        dispatch({ type: 'SET_UX_AUDIT_LLM_ANALYSIS', payload: null });
        setLlmError(null);
        setLlmMeta(null);
      } finally {
        setRunning(false);
      }
    });
  }

  async function runLlmAnalysis(result: UxAuditResult, product?: string): Promise<void> {
    if (llmRunning()) return;

    setLlmRunning(true);
    setLlmError(null);
    setLlmMeta(null);
    dispatch({ type: 'SET_UX_AUDIT_LLM_RUNNING', payload: true });
    dispatch({ type: 'SET_UX_AUDIT_LLM_ANALYSIS', payload: null });

    const req: LlmBridgeRequest = {
      model: 'haiku',
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(result, product),
    };

    try {
      // Strategy 1: window.__llmBridge (injected by Electron host / host app)
      let response = await tryWindowBridge(req);

      // Strategy 2: DevBridge HTTP API
      if (!response) {
        response = await tryDevBridge(req);
      }

      if (!response) {
        setLlmError(
          'No LLM bridge available. To enable AI analysis:\n' +
            '• Start DevBridge on port 9999 (http://localhost:9999/api/llm), or\n' +
            '• Inject window.__llmBridge in your Electron preload script.'
        );
        return;
      }

      if (response.error) {
        setLlmError(`LLM error: ${response.error}`);
        return;
      }

      dispatch({ type: 'SET_UX_AUDIT_LLM_ANALYSIS', payload: response.text });
      setLlmMeta({
        model: response.model ?? req.model,
        tokens: response.tokens,
        duration_ms: response.duration_ms,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setLlmError(`Unexpected error: ${message}`);
    } finally {
      setLlmRunning(false);
      dispatch({ type: 'SET_UX_AUDIT_LLM_RUNNING', payload: false });
    }
  }

  return {
    running,
    runAudit,
    llmRunning,
    llmError,
    llmMeta,
    runLlmAnalysis,
  };
}
