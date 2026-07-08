import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import { ThemeAuditTab } from '../src/ui/ThemeAuditTab';
import type { ThemeAuditRow } from '../src/engine/ThemeAuditEngine';

const auditMock = vi.fn<(...args: unknown[]) => ThemeAuditRow[]>();

vi.mock('../src/engine/ThemeAuditEngine', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/engine/ThemeAuditEngine')>();
  return {
    ...original,
    auditThemeCompliance: (...args: unknown[]) => auditMock(...args),
  };
});

function Harness(props: { element: HTMLElement | null }) {
  const { dispatch } = useDevTools();
  dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: props.element });
  return <ThemeAuditTab />;
}

function renderTab(element: HTMLElement | null) {
  return render(() => (
    <DevToolsProvider themeName="Test Theme">
      <Harness element={element} />
    </DevToolsProvider>
  ));
}

const FIXTURE_ROWS: ThemeAuditRow[] = [
  {
    property: 'color',
    computedValue: '#e0e0e0',
    rawValue: 'var(--sk-text-primary)',
    status: 'on-theme',
    token: '--sk-text-primary',
    note: null,
  },
  {
    property: 'background-color',
    computedValue: 'rgb(186, 218, 85)',
    rawValue: '#bada55',
    status: 'off-theme',
    token: null,
    note: 'hardcoded — not from a --sk-* token',
  },
  {
    property: 'font-size',
    computedValue: '10px',
    rawValue: null,
    status: 'tiny-text',
    token: '--sk-font-size-xs',
    note: '10px — below the 12px readability floor',
  },
  {
    property: 'padding-top',
    computedValue: '13px',
    rawValue: '13px',
    status: 'off-theme',
    token: null,
    note: 'hardcoded — not from a --sk-* token',
  },
  {
    property: 'border-top-color',
    computedValue: 'rgb(255, 0, 0)',
    rawValue: null,
    status: 'off-theme',
    token: null,
    note: 'hardcoded — not from a --sk-* token',
  },
  {
    property: 'gap',
    computedValue: '',
    rawValue: null,
    status: 'default',
    token: null,
    note: null,
  },
];

describe('ThemeAuditTab', () => {
  afterEach(() => {
    cleanup();
    auditMock.mockReset();
  });

  it('shows an empty state when no element is inspected', () => {
    const { container } = renderTab(null);
    expect(container.querySelector('.sk-devtools__empty')).not.toBeNull();
    expect(container.textContent).toContain('Select an element to audit');
    expect(auditMock).not.toHaveBeenCalled();
  });

  it('renders the compliance summary line', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const el = document.createElement('div');
    const { container } = renderTab(el);

    const summary = container.querySelector('.sk-devtools__ta-summary')!;
    expect(summary.textContent).toContain('1 on-theme');
    expect(summary.textContent).toContain('3 off-theme');
    expect(summary.textContent).toContain('1 tiny-text');
    expect(summary.textContent).toContain('(1 defaults skipped)');
    expect(auditMock).toHaveBeenCalledWith(el, expect.any(Map));
  });

  it('renders one row per audited property with status icon and class', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const { container } = renderTab(document.createElement('div'));

    const rows = container.querySelectorAll('.sk-devtools__ta-row');
    expect(rows).toHaveLength(FIXTURE_ROWS.length);
    expect(container.querySelector('.sk-devtools__ta-row--on-theme .sk-devtools__ta-icon')!.textContent).toBe('✓');
    expect(container.querySelector('.sk-devtools__ta-row--off-theme .sk-devtools__ta-icon')!.textContent).toBe('✗');
    expect(container.querySelector('.sk-devtools__ta-row--tiny-text .sk-devtools__ta-icon')!.textContent).toBe('⚠');
    expect(container.querySelector('.sk-devtools__ta-row--default .sk-devtools__ta-icon')!.textContent).toBe('·');
  });

  it('shows the matched token chip for on-theme rows', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const { container } = renderTab(document.createElement('div'));

    const tokens = Array.from(container.querySelectorAll('.sk-devtools__ta-token')).map(
      (n) => n.textContent,
    );
    expect(tokens).toContain('--sk-text-primary');
    expect(tokens).toContain('--sk-font-size-xs');
  });

  it('shows a color swatch only for color-like computed values', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const { container } = renderTab(document.createElement('div'));

    // #e0e0e0 and rgb(186, 218, 85) → swatches; 10px / 13px / '' → none
    expect(container.querySelectorAll('.sk-devtools__swatch')).toHaveLength(3);
  });

  it('shows the declared raw value only when it differs from the computed value on off-theme rows', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const { container } = renderTab(document.createElement('div'));

    const raws = container.querySelectorAll('.sk-devtools__ta-raw');
    expect(raws).toHaveLength(1);
    expect(raws[0]!.textContent).toBe('declared: #bada55');
  });

  it('shows notes (tiny-text floor, hardcoded) and an em-dash for empty computed values', () => {
    auditMock.mockReturnValue(FIXTURE_ROWS);
    const { container } = renderTab(document.createElement('div'));

    expect(container.textContent).toContain('10px — below the 12px readability floor');
    expect(container.textContent).toContain('hardcoded — not from a --sk-* token');

    const defaultRow = container.querySelector('.sk-devtools__ta-row--default')!;
    expect(defaultRow.querySelector('.sk-devtools__ta-value')!.textContent).toBe('—');
    expect(defaultRow.querySelector('.sk-devtools__ta-note')).toBeNull();
  });
});
