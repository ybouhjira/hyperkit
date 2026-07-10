import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import type { ThemeAuditResult } from './auditThemeVars';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('./ThemeProvider', () => ({
  useThemeContext: () => ({
    theme: () => ({
      id: 'test-theme',
      name: 'Test Theme',
      colors: {},
    }),
    setTheme: vi.fn(),
    themes: [],
    customizeTheme: vi.fn(),
  }),
}));

vi.mock('../keyboard', () => ({
  useShortcut: vi.fn(),
}));

const mockAuditWithFailures: ThemeAuditResult = {
  groups: [
    {
      group: 'Colors',
      vars: [
        { name: '--sk-bg-primary', value: '#111', status: 'ok' },
        { name: '--sk-text-primary', value: '', status: 'missing' },
      ],
      passed: 1,
      failed: 1,
    },
    {
      group: 'Fonts',
      vars: [
        { name: '--sk-font-ui', value: 'Inter', status: 'ok' },
        { name: '--sk-font-code', value: 'Fira Code', status: 'ok' },
      ],
      passed: 2,
      failed: 0,
    },
  ],
  totalVars: 4,
  totalPassed: 3,
  totalFailed: 1,
  componentVars: [],
};

const mockAuditAllPass: ThemeAuditResult = {
  groups: [
    {
      group: 'Colors',
      vars: [{ name: '--sk-bg-primary', value: '#111', status: 'ok' }],
      passed: 1,
      failed: 0,
    },
  ],
  totalVars: 1,
  totalPassed: 1,
  totalFailed: 0,
  componentVars: [],
};

const mockAuditWithComponentVars: ThemeAuditResult = {
  groups: [
    {
      group: 'Colors',
      vars: [{ name: '--sk-bg-primary', value: '#111', status: 'ok' }],
      passed: 1,
      failed: 0,
    },
  ],
  totalVars: 1,
  totalPassed: 1,
  totalFailed: 0,
  componentVars: [
    { name: '--sk-comp-button-bg', value: 'red', status: 'ok' },
    { name: '--sk-comp-card-border', value: '1px solid blue', status: 'ok' },
  ],
};

const mockAuditLongValue: ThemeAuditResult = {
  groups: [
    {
      group: 'Shadows',
      vars: [
        {
          name: '--sk-shadow-lg',
          value: '0 10px 20px rgba(0,0,0,0.5) inset 2px 2px 4px rgba(255,255,255,0.1)',
          status: 'ok',
        },
      ],
      passed: 1,
      failed: 0,
    },
  ],
  totalVars: 1,
  totalPassed: 1,
  totalFailed: 0,
  componentVars: [
    {
      name: '--sk-comp-toolbar-shadow',
      value: '0 4px 8px rgba(0,0,0,0.3) blur(10px) saturate(180%)',
      status: 'ok',
    },
  ],
};

let currentMockResult = mockAuditWithFailures;
const mockAuditThemeVars = vi.fn(() => currentMockResult);
const mockLogAuditResults = vi.fn();

vi.mock('./auditThemeVars', () => ({
  auditThemeVars: (...args: unknown[]) => mockAuditThemeVars(...args),
  logAuditResults: (...args: unknown[]) => mockLogAuditResults(...args),
}));

// Import after mocks are set up
import { ThemeAuditor } from './ThemeAuditor';

// ─── ThemeAuditor Component Tests ─────────────────────────────────────────────

describe('ThemeAuditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    currentMockResult = mockAuditWithFailures;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('default behavior (no props)', () => {
    it('renders no overlay by default', () => {
      render(() => <ThemeAuditor />);
      expect(document.querySelector('.sk-theme-auditor')).toBeNull();
    });

    it('calls auditThemeVars after 50ms timer', () => {
      render(() => <ThemeAuditor />);
      expect(mockAuditThemeVars).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(mockAuditThemeVars).toHaveBeenCalledTimes(1);
    });

    it('calls logAuditResults by default (console prop not set)', () => {
      render(() => <ThemeAuditor />);
      vi.advanceTimersByTime(50);
      expect(mockLogAuditResults).toHaveBeenCalledTimes(1);
      expect(mockLogAuditResults).toHaveBeenCalledWith(mockAuditWithFailures);
    });
  });

  describe('console prop', () => {
    it('logs to console when console prop is true', () => {
      render(() => <ThemeAuditor console={true} />);
      vi.advanceTimersByTime(50);
      expect(mockLogAuditResults).toHaveBeenCalledTimes(1);
    });

    it('skips console logging when console prop is false', () => {
      render(() => <ThemeAuditor console={false} />);
      vi.advanceTimersByTime(50);
      expect(mockLogAuditResults).not.toHaveBeenCalled();
    });
  });

  describe('overlay prop', () => {
    it('renders overlay when overlay=true after audit completes', () => {
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);
      // DEV mode is true in vitest, so the overlay should render
      const overlay = document.querySelector('.sk-theme-auditor');
      expect(overlay).not.toBeNull();
    });

    it('does not render overlay when overlay=false', () => {
      render(() => <ThemeAuditor overlay={false} />);
      vi.advanceTimersByTime(50);
      expect(document.querySelector('.sk-theme-auditor')).toBeNull();
    });
  });

  describe('AuditorOverlay — header', () => {
    it('shows warning icon when there are failures', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);
      expect(screen.getByText(/⚠/)).toBeTruthy();
      expect(screen.getByText(/Theme Audit/)).toBeTruthy();
    });

    it('shows checkmark icon when all pass', () => {
      currentMockResult = mockAuditAllPass;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);
      // The header span contains "✓ Theme Audit"
      expect(screen.getByText(/✓.*Theme Audit/)).toBeTruthy();
    });

    it('displays passed/total counts', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);
      // totalPassed/totalVars = 3/4
      expect(screen.getByText('3/4')).toBeTruthy();
    });

    it('close button hides the overlay', () => {
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);
      expect(document.querySelector('.sk-theme-auditor')).not.toBeNull();

      const closeBtn = screen.getByText('×');
      fireEvent.click(closeBtn);

      expect(document.querySelector('.sk-theme-auditor')).toBeNull();
    });
  });

  describe('AuditorOverlay — groups', () => {
    it('renders group buttons for each group', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Groups: Colors (failed), Fonts (passed)
      expect(screen.getByText(/Colors/)).toBeTruthy();
      expect(screen.getByText(/Fonts/)).toBeTruthy();
    });

    it('shows failed group with ✗ prefix', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Colors group has 1 failure — should show ✗ Colors
      expect(screen.getByText(/✗.*Colors/)).toBeTruthy();
    });

    it('shows passing group with ✓ prefix', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Fonts group has 0 failures — should show ✓ Fonts
      expect(screen.getByText(/✓.*Fonts/)).toBeTruthy();
    });

    it('shows passed/total per group', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Colors: 1/2
      expect(screen.getByText('1/2')).toBeTruthy();
      // Fonts: 2/2
      expect(screen.getByText('2/2')).toBeTruthy();
    });

    it('expands group details on click', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Before click — var details not visible
      expect(screen.queryByText('bg-primary')).toBeNull();

      // Click Colors group
      fireEvent.click(screen.getByText(/✗.*Colors/));

      // After click — var names visible (--sk- prefix stripped)
      expect(screen.getByText('bg-primary')).toBeTruthy();
      expect(screen.getByText('text-primary')).toBeTruthy();
    });

    it('collapses expanded group on second click', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      const colorsBtn = screen.getByText(/✗.*Colors/);
      fireEvent.click(colorsBtn);
      expect(screen.queryByText('bg-primary')).toBeTruthy();

      fireEvent.click(colorsBtn);
      expect(screen.queryByText('bg-primary')).toBeNull();
    });

    it('switches expanded group when clicking different group', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Expand Colors
      fireEvent.click(screen.getByText(/✗.*Colors/));
      expect(screen.queryByText('bg-primary')).toBeTruthy();

      // Expand Fonts — Colors should collapse
      fireEvent.click(screen.getByText(/✓.*Fonts/));
      expect(screen.queryByText('bg-primary')).toBeNull();
      expect(screen.getByText('font-ui')).toBeTruthy();
    });

    it('renders ok var with bullet and value preview', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      fireEvent.click(screen.getByText(/✗.*Colors/));

      // bg-primary has value '#111' — shows bullet
      expect(screen.getByText('•')).toBeTruthy();
    });

    it('renders missing var with ✗ marker', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      fireEvent.click(screen.getByText(/✗.*Colors/));

      // Missing --sk-text-primary — shows ✗ in item (different from group header)
      const errorMarkers = screen.getAllByText('✗');
      // At least one ✗ should be from the var item row (inside expanded group)
      expect(errorMarkers.length).toBeGreaterThan(0);
    });

    it('truncates long ok var values to 20 chars with ellipsis', () => {
      currentMockResult = mockAuditLongValue;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      fireEvent.click(screen.getByText(/✓.*Shadows/));

      // Value is > 20 chars — should be truncated to 20 chars + '…'
      const longValue = '0 10px 20px rgba(0,0,0,0.5) inset 2px 2px 4px rgba(255,255,255,0.1)';
      const truncated = longValue.slice(0, 20) + '…';
      expect(screen.getByText(truncated)).toBeTruthy();
    });

    it('shows full value when value length is 20 chars or less', () => {
      currentMockResult = mockAuditWithFailures;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      fireEvent.click(screen.getByText(/✗.*Colors/));

      // bg-primary value is '#111' (5 chars) — not truncated
      expect(screen.getByText('#111')).toBeTruthy();
    });
  });

  describe('AuditorOverlay — component vars section', () => {
    it('does not render Components section when componentVars is empty', () => {
      currentMockResult = mockAuditWithFailures; // componentVars: []
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      expect(screen.queryByText('◆ Components')).toBeNull();
    });

    it('renders Components section when componentVars present', () => {
      currentMockResult = mockAuditWithComponentVars;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      expect(screen.getByText('◆ Components')).toBeTruthy();
    });

    it('shows count of component vars', () => {
      currentMockResult = mockAuditWithComponentVars;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // The count span shows '2'
      expect(screen.getByText('2')).toBeTruthy();
    });

    it('expands component vars on click', () => {
      currentMockResult = mockAuditWithComponentVars;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      // Click the button that contains '◆ Components' span
      const compSpan = screen.getByText('◆ Components');
      // Get the parent button
      const compBtn = compSpan.closest('button')!;
      fireEvent.click(compBtn);

      // --sk-comp-button-bg → strips '--sk-comp-' prefix → '• button-bg' (in one span)
      // Match using regex since the span textContent is "• button-bg"
      expect(screen.getByText(/button-bg/)).toBeTruthy();
      expect(screen.getByText(/card-border/)).toBeTruthy();
    });

    it('collapses component vars on second click', () => {
      currentMockResult = mockAuditWithComponentVars;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      const compSpan = screen.getByText('◆ Components');
      const compBtn = compSpan.closest('button')!;

      fireEvent.click(compBtn);
      expect(screen.queryByText(/button-bg/)).toBeTruthy();

      fireEvent.click(compBtn);
      expect(screen.queryByText(/button-bg/)).toBeNull();
    });

    it('truncates long component var values', () => {
      currentMockResult = mockAuditLongValue;
      render(() => <ThemeAuditor overlay={true} />);
      vi.advanceTimersByTime(50);

      const compSpan = screen.getByText('◆ Components');
      const compBtn = compSpan.closest('button')!;
      fireEvent.click(compBtn);

      const longCompValue = '0 4px 8px rgba(0,0,0,0.3) blur(10px) saturate(180%)';
      const truncated = longCompValue.slice(0, 20) + '…';
      expect(screen.getByText(truncated)).toBeTruthy();
    });
  });

  describe('timer behavior', () => {
    it('does not call audit immediately on render (uses 50ms delay)', () => {
      render(() => <ThemeAuditor />);
      // No time advanced — should not have called audit yet
      expect(mockAuditThemeVars).not.toHaveBeenCalled();
    });

    it('calls audit exactly once after 50ms', () => {
      render(() => <ThemeAuditor />);
      vi.advanceTimersByTime(50);
      expect(mockAuditThemeVars).toHaveBeenCalledTimes(1);
    });

    it('does not call audit multiple times before 50ms', () => {
      render(() => <ThemeAuditor />);
      vi.advanceTimersByTime(25);
      expect(mockAuditThemeVars).not.toHaveBeenCalled();
    });
  });
});
