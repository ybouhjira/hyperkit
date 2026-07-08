import { createSignal, createEffect, Show, For, onMount, onCleanup } from 'solid-js';
import './BugReporter.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BugSeverity = 'minor' | 'major' | 'critical';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  screenshot?: string;
  url: string;
  viewport: { width: number; height: number };
  userAgent: string;
  createdAt: string;
  reporterEmail?: string;
  reporterName?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

export interface BugReportStorage {
  submit(report: Omit<BugReport, 'id' | 'createdAt' | 'status'>): Promise<BugReport>;
  list(): Promise<BugReport[]>;
  subscribe?(callback: (reports: BugReport[]) => void): () => void;
}

// ─── Storage Adapters ────────────────────────────────────────────────────────

export function createLocalBugStorage(key: string): BugReportStorage {
  const storageKey = `sk-bugs-${key}`;

  function load(): BugReport[] {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as BugReport[]) : [];
    } catch {
      return [];
    }
  }

  function save(reports: BugReport[]): void {
    localStorage.setItem(storageKey, JSON.stringify(reports));
  }

  return {
    submit(data) {
      const report: BugReport = {
        ...data,
        id: `bug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      const reports = load();
      reports.push(report);
      save(reports);
      return Promise.resolve(report);
    },
    list() {
      return Promise.resolve(load());
    },
  };
}

export function createApiBugStorage(baseUrl: string): BugReportStorage {
  const headers = { 'Content-Type': 'application/json' };

  return {
    async submit(data) {
      const res = await fetch(`${baseUrl}/api/bugs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<BugReport>;
    },
    async list() {
      const res = await fetch(`${baseUrl}/api/bugs`);
      return res.json() as Promise<BugReport[]>;
    },
  };
}

export function createMemoryBugStorage(): BugReportStorage & { reports: BugReport[] } {
  const reports: BugReport[] = [];
  const listeners: Array<(reports: BugReport[]) => void> = [];

  return {
    reports,
    submit(data) {
      const report: BugReport = {
        ...data,
        id: `bug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      reports.push(report);
      listeners.forEach((l) => l([...reports]));
      return Promise.resolve(report);
    },
    list() {
      return Promise.resolve([...reports]);
    },
    subscribe(callback) {
      listeners.push(callback);
      return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
  };
}

// ─── Screenshot Utility ──────────────────────────────────────────────────────

async function captureScreenshot(): Promise<string | undefined> {
  try {
    // Use html2canvas if available, otherwise skip
    const html2canvas = (window as unknown as Record<string, unknown>)['html2canvas'] as
      ((el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>) | undefined;

    if (html2canvas) {
      const canvas = await html2canvas(document.body, {
        scale: 0.5,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL('image/jpeg', 0.6);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// ─── Severity Config ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<BugSeverity, { label: string; emoji: string; color: string }> = {
  minor: { label: 'Minor', emoji: '🟡', color: 'var(--sk-warning)' },
  major: { label: 'Major', emoji: '🟠', color: 'var(--sk-error)' },
  critical: { label: 'Critical', emoji: '🔴', color: 'var(--sk-error)' },
};

// ─── BugReporter Component ───────────────────────────────────────────────────

export interface BugReporterProps {
  storage: BugReportStorage;
  product: string;
  reporterEmail?: string;
  reporterName?: string;
  /** Controlled open state — when provided, component is controlled. */
  open?: boolean;
  /** Called when open state should change (controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** Hide the built-in floating bug button (use when providing your own trigger). */
  hideFab?: boolean;
  /** Disable the built-in Ctrl+Shift+B keyboard shortcut. */
  disableShortcut?: boolean;
}

export function BugReporter(props: BugReporterProps) {
  const [internalOpen, setInternalOpen] = createSignal(false);
  const isControlled = () => props.open !== undefined;
  const open = () => (isControlled() ? (props.open ?? false) : internalOpen());
  const setOpen = (next: boolean) => {
    if (!isControlled()) setInternalOpen(next);
    props.onOpenChange?.(next);
  };
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [severity, setSeverity] = createSignal<BugSeverity>('major');
  const [screenshot, setScreenshot] = createSignal<string | undefined>();
  const [submitting, setSubmitting] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);
  const [bugCount, setBugCount] = createSignal(0);

  // Load bug count on mount
  onMount(() => {
    void props.storage.list().then((bugs) => setBugCount(bugs.length));
  });

  // Keyboard shortcut: Ctrl+Shift+B to open (opt-out via disableShortcut)
  onMount(() => {
    if (props.disableShortcut) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        void handleOpen();
      }
    };
    window.addEventListener('keydown', handler);
    onCleanup(() => window.removeEventListener('keydown', handler));
  });

  const resetAndCapture = async () => {
    const shot = await captureScreenshot();
    setScreenshot(shot);
    setSubmitted(false);
    setTitle('');
    setDescription('');
    setSeverity('major');
  };

  const handleOpen = async () => {
    // Capture screenshot BEFORE opening the form (so the form isn't in the screenshot)
    await resetAndCapture();
    setOpen(true);
  };

  // In controlled mode, when parent flips open false→true, run the same setup
  let prevOpen = false;
  createEffect(() => {
    const next = open();
    if (isControlled() && next && !prevOpen) void resetAndCapture();
    prevOpen = next;
  });

  const handleSubmit = async () => {
    if (!title().trim()) return;
    setSubmitting(true);
    try {
      await props.storage.submit({
        title: title().trim(),
        description: description().trim(),
        severity: severity(),
        screenshot: screenshot(),
        url: window.location.href,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        userAgent: navigator.userAgent,
        reporterEmail: props.reporterEmail,
        reporterName: props.reporterName,
      });
      setBugCount((c) => c + 1);
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting()) setOpen(false);
  };

  return (
    <>
      {/* Floating Bug Button — hidden when `hideFab` is set (consumer provides own trigger) */}
      <Show when={!props.hideFab}>
        <button
          class="sk-bug-fab"
          onClick={() => void handleOpen()}
          title="Report a bug (Ctrl+Shift+B)"
          data-sk-inspector="true"
        >
          <span class="sk-bug-fab__icon">🐛</span>
          <Show when={bugCount() > 0}>
            <span class="sk-bug-fab__count">{bugCount()}</span>
          </Show>
        </button>
      </Show>

      {/* Bug Report Modal */}
      <Show when={open()}>
        <div class="sk-bug-overlay" onClick={handleClose} data-sk-inspector="true">
          <div class="sk-bug-modal" onClick={(e) => e.stopPropagation()}>
            <Show
              when={!submitted()}
              fallback={
                <div class="sk-bug-success">
                  <span class="sk-bug-success__icon">✅</span>
                  <span class="sk-bug-success__text">Bug reported! Thank you.</span>
                </div>
              }
            >
              {/* Header */}
              <div class="sk-bug-header">
                <span class="sk-bug-header__title">Report a Bug</span>
                <button class="sk-bug-close" onClick={handleClose}>
                  ✕
                </button>
              </div>

              {/* Screenshot Preview */}
              <Show when={screenshot()}>
                <div class="sk-bug-screenshot">
                  <img src={screenshot() ?? ''} alt="Screenshot" class="sk-bug-screenshot__img" />
                  <span class="sk-bug-screenshot__label">Auto-captured screenshot</span>
                </div>
              </Show>

              {/* Form */}
              <div class="sk-bug-form">
                {/* Title */}
                <input
                  class="sk-bug-input"
                  type="text"
                  placeholder="What went wrong? (short title)"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  autofocus
                />

                {/* Description */}
                <textarea
                  class="sk-bug-textarea"
                  placeholder="Describe what happened, what you expected, and steps to reproduce..."
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  rows={4}
                />

                {/* Severity Picker */}
                <div class="sk-bug-severity">
                  <span class="sk-bug-severity__label">How bad is it?</span>
                  <div class="sk-bug-severity__options">
                    <For each={['minor', 'major', 'critical'] as BugSeverity[]}>
                      {(sev) => (
                        <button
                          class="sk-bug-severity__btn"
                          classList={{ 'sk-bug-severity__btn--active': severity() === sev }}
                          style={{ '--sk-sev-color': SEVERITY_CONFIG[sev].color }}
                          onClick={() => setSeverity(sev)}
                        >
                          <span>{SEVERITY_CONFIG[sev].emoji}</span>
                          <span>{SEVERITY_CONFIG[sev].label}</span>
                        </button>
                      )}
                    </For>
                  </div>
                </div>

                {/* Submit */}
                <button
                  class="sk-bug-submit"
                  onClick={() => void handleSubmit()}
                  disabled={!title().trim() || submitting()}
                >
                  {submitting() ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  );
}
