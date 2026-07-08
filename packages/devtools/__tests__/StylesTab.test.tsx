import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import { StylesTab } from '../src/ui/StylesTab';
import type { MatchedRule } from '../src/context/types';

const rulesMock = vi.fn<(...args: unknown[]) => MatchedRule[]>();

vi.mock('../src/engine/StylesheetMatcher', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/engine/StylesheetMatcher')>();
  return {
    ...original,
    findMatchingRules: (...args: unknown[]) => rulesMock(...args),
  };
});

function Harness(props: { element: HTMLElement | null }) {
  const { dispatch } = useDevTools();
  dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: props.element });
  return <StylesTab />;
}

function renderTab(element: HTMLElement | null) {
  return render(() => (
    <DevToolsProvider themeName="Test Theme">
      <Harness element={element} />
    </DevToolsProvider>
  ));
}

const FIXTURE_RULES: MatchedRule[] = [
  {
    selector: '.sk-card',
    specificity: [0, 1, 0],
    properties: { padding: '16px' },
    source: 'https://example.com/assets/Card-CyVyeno4.css',
  },
  {
    selector: '.plan__board',
    specificity: [0, 1, 0],
    properties: { display: 'grid' },
    source: 'https://example.com/assets/plan-Xk29fmQa.css',
  },
  {
    selector: '.sk-badge',
    specificity: [0, 1, 0],
    properties: { color: 'red' },
    source: 'https://example.com/assets/app-Bq3kV9Lm.css',
  },
];

afterEach(() => {
  cleanup();
  rulesMock.mockReset();
});

describe('StylesTab', () => {
  it('shows the empty state when no element is inspected', () => {
    const { getByText } = renderTab(null);
    expect(getByText('Select an element to see its CSS rules')).toBeInTheDocument();
    expect(rulesMock).not.toHaveBeenCalled();
  });

  it('shows the empty state when no rules match', () => {
    rulesMock.mockReturnValue([]);
    const { getByText } = renderTab(document.createElement('div'));
    expect(getByText('Select an element to see its CSS rules')).toBeInTheDocument();
  });

  it('renders the cleaned filename for each rule', () => {
    rulesMock.mockReturnValue(FIXTURE_RULES);
    const { getByText } = renderTab(document.createElement('div'));
    expect(getByText('Card.css')).toBeInTheDocument();
    expect(getByText('plan.css')).toBeInTheDocument();
    expect(getByText('app.css')).toBeInTheDocument();
  });

  it('renders an origin badge per rule — app.css overriding .sk-badge reads App', () => {
    rulesMock.mockReturnValue(FIXTURE_RULES);
    const { container } = renderTab(document.createElement('div'));
    const badges = Array.from(container.querySelectorAll('.sk-devtools__rule-origin')).map(
      (badge) => badge.textContent,
    );
    expect(badges).toEqual(['HyperKit', 'App', 'App']);
    expect(
      container.querySelectorAll('.sk-devtools__rule-origin--hyperkit'),
    ).toHaveLength(1);
    expect(container.querySelectorAll('.sk-devtools__rule-origin--app')).toHaveLength(2);
  });

  it('renders the summary line with rule counts', () => {
    rulesMock.mockReturnValue(FIXTURE_RULES);
    const { container } = renderTab(document.createElement('div'));
    const summary = container.querySelector('.sk-devtools__styles-summary');
    expect(summary?.textContent).toContain('3 rules · 1 HyperKit · 2 app');
  });

  it('keeps selector, specificity, and properties rendering intact', () => {
    rulesMock.mockReturnValue(FIXTURE_RULES);
    const { getByText, getAllByText } = renderTab(document.createElement('div'));
    expect(getByText('.sk-card')).toBeInTheDocument();
    expect(getAllByText('[0,1,0]')).toHaveLength(3);
    expect(getByText('padding')).toBeInTheDocument();
    expect(getByText('16px')).toBeInTheDocument();
  });

  it('filters to app rules when "App only" is toggled, and restores on second click', () => {
    rulesMock.mockReturnValue(FIXTURE_RULES);
    const { container, getByText, queryByText } = renderTab(document.createElement('div'));

    const toggle = getByText('App only');
    fireEvent.click(toggle);

    expect(queryByText('.sk-card')).not.toBeInTheDocument();
    expect(getByText('.plan__board')).toBeInTheDocument();
    expect(getByText('.sk-badge')).toBeInTheDocument();
    expect(
      container.querySelector('.sk-devtools__styles-filter--active'),
    ).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(getByText('.sk-card')).toBeInTheDocument();
    expect(
      container.querySelector('.sk-devtools__styles-filter--active'),
    ).not.toBeInTheDocument();
  });

  it('renders var traces for properties containing var()', () => {
    rulesMock.mockReturnValue([
      {
        selector: '.sk-card',
        specificity: [0, 1, 0],
        properties: { background: 'var(--sk-bg-secondary)' },
        source: 'https://example.com/assets/Card-CyVyeno4.css',
      },
    ]);
    const { container } = renderTab(document.createElement('div'));
    expect(container.querySelector('.sk-devtools__trace')).toBeInTheDocument();
    expect(container.querySelector('.sk-devtools__trace-unset')).toBeInTheDocument();
  });

  it('renders resolved var values with a color swatch and fallback chain', () => {
    // jsdom doesn't inherit custom properties from :root — set on the element.
    const el = document.createElement('div');
    el.style.setProperty('--sk-accent', '#5b9cf5');
    el.style.setProperty('--sk-card-bg', 'var(--sk-accent)');
    rulesMock.mockReturnValue([
      {
        selector: '.sk-card',
        specificity: [0, 1, 0],
        properties: { background: 'var(--sk-card-bg)' },
        source: 'https://example.com/assets/Card-CyVyeno4.css',
      },
    ]);
    const { container } = renderTab(el);
    const values = Array.from(container.querySelectorAll('.sk-devtools__trace-value')).map(
      (node) => node.textContent,
    );
    expect(values).toEqual(['var(--sk-accent)', '#5b9cf5']);
    expect(container.querySelector('.sk-devtools__swatch')).toBeInTheDocument();
    // The fallback chain renders with the depth arrow
    expect(container.textContent).toContain('↳');
  });
});
