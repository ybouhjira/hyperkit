import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import { DevToolsProvider, useDevTools } from '../src/context/DevToolsProvider';
import { InspectTab } from '../src/ui/InspectTab';

let style: HTMLStyleElement;

beforeEach(() => {
  style = document.createElement('style');
  style.textContent = `
    .sk-card {
      background: var(--sk-card-bg, var(--sk-bg-secondary));
      border-radius: var(--sk-radius-md);
    }
  `;
  document.head.appendChild(style);
  document.documentElement.style.setProperty('--sk-bg-secondary', '#222529');
  document.documentElement.style.setProperty('--sk-radius-md', '8px');
});

afterEach(() => {
  cleanup();
  style.remove();
  document.documentElement.style.removeProperty('--sk-bg-secondary');
  document.documentElement.style.removeProperty('--sk-radius-md');
});

function Harness(props: { element: HTMLElement | null }) {
  const { dispatch } = useDevTools();
  dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: props.element });
  return <InspectTab />;
}

function renderTab(element: HTMLElement | null) {
  return render(() => (
    <DevToolsProvider themeName="Test Theme">
      <Harness element={element} />
    </DevToolsProvider>
  ));
}

function makeCard(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'sk-card sk-card--outlined plan-card';
  document.body.appendChild(el);
  return el;
}

describe('InspectTab', () => {
  it('shows the empty state when no element is inspected', () => {
    const { getByText } = renderTab(null);
    expect(getByText('Click the inspect button, then select an element')).toBeInTheDocument();
  });

  it('leads with the HyperKit eyebrow and the component name', () => {
    const el = makeCard();
    const { container } = renderTab(el);
    const eyebrow = container.querySelector('.sk-devtools__hk-eyebrow');
    expect(eyebrow?.textContent).toContain('HyperKit component');
    expect(container.querySelector('.sk-devtools__component-name')?.textContent).toBe('Card');
    el.remove();
  });

  it('labels unknown sk-* blocks as sk-* element, not HyperKit component', () => {
    const el = document.createElement('div');
    el.className = 'sk-custom-widget';
    document.body.appendChild(el);
    const { container } = renderTab(el);
    expect(container.querySelector('.sk-devtools__hk-eyebrow')?.textContent).toContain(
      'sk-* element',
    );
    expect(container.querySelector('.sk-devtools__component-name')?.textContent).toBe(
      'CustomWidget',
    );
    el.remove();
  });

  it('renders modifier badges in the header', () => {
    const el = makeCard();
    const { container } = renderTab(el);
    const header = container.querySelector('.sk-devtools__component-header');
    expect(header?.textContent).toContain('outlined');
    el.remove();
  });

  it('renders the BEM structure rows: block, part, and modifier', () => {
    const el = document.createElement('div');
    el.className = 'sk-card sk-card--outlined sk-card__header';
    document.body.appendChild(el);
    const { container } = renderTab(el);
    const rows = Array.from(container.querySelectorAll('.sk-devtools__bem-row')).map((row) => [
      row.querySelector('.sk-devtools__bem-kind')?.textContent,
      row.querySelector('.sk-devtools__bem-class')?.textContent,
      row.querySelector('.sk-devtools__bem-name')?.textContent,
    ]);
    expect(rows).toEqual([
      ['block', 'sk-card', 'Card'],
      ['part', 'sk-card__header', 'header'],
      ['variant', 'sk-card--outlined', 'outlined'],
    ]);
    el.remove();
  });

  it('shows the sub-part next to the component name', () => {
    const el = document.createElement('div');
    el.className = 'sk-card__header';
    document.body.appendChild(el);
    const { container } = renderTab(el);
    expect(container.querySelector('.sk-devtools__component-part')?.textContent).toContain(
      'header',
    );
    el.remove();
  });

  it('shows the parent HyperKit component as an Inside row', () => {
    const parent = document.createElement('div');
    parent.className = 'sk-kanban';
    const el = document.createElement('div');
    el.className = 'sk-card';
    parent.appendChild(el);
    document.body.appendChild(parent);
    const { getByText } = renderTab(el);
    expect(getByText('Inside')).toBeInTheDocument();
    expect(getByText('KanbanBoard')).toBeInTheDocument();
    parent.remove();
  });

  it('lists the --sk-* tokens the element consumes with resolved values', () => {
    const el = makeCard();
    const { container } = renderTab(el);
    const section = Array.from(container.querySelectorAll('.sk-devtools__section')).find(
      (node) => node.textContent?.includes('Tokens consumed'),
    );
    expect(section).toBeTruthy();
    const rows = Array.from(container.querySelectorAll('.sk-devtools__token-row'));
    const names = rows.map(
      (row) => row.querySelector('.sk-devtools__token-name')?.textContent,
    );
    expect(names).toEqual(['--sk-bg-secondary', '--sk-card-bg', '--sk-radius-md']);
    const bgRow = rows[0]!;
    expect(bgRow.querySelector('.sk-devtools__token-value')?.textContent).toBe('#222529');
    expect(bgRow.querySelector('.sk-devtools__swatch')).toBeInTheDocument();
    const cardBgRow = rows[1]!;
    expect(cardBgRow.querySelector('.sk-devtools__trace-unset')?.textContent).toBe('not set');
    el.remove();
  });

  it('keeps the raw class dump as a secondary detail row', () => {
    const el = makeCard();
    const { container } = renderTab(el);
    const secondary = container.querySelector('.sk-devtools__detail--secondary');
    expect(secondary?.textContent).toContain('sk-card');
    expect(secondary?.textContent).toContain('sk-card--outlined');
    el.remove();
  });

  it('renders the Key Styles section when matched rules trace var() chains', () => {
    const el = makeCard();
    const { container, getByText } = renderTab(el);
    expect(getByText('Key Styles')).toBeInTheDocument();
    expect(container.querySelector('.sk-devtools__prop')).toBeInTheDocument();
    el.remove();
  });

  it('traces resolved var chains with color swatch, theme source, and fallback arrow', () => {
    // jsdom doesn't inherit custom properties from :root — set on the element.
    const el = makeCard();
    el.style.setProperty('--sk-card-bg', 'var(--sk-bg-secondary)');
    el.style.setProperty('--sk-bg-secondary', '#222529');
    const { container } = renderTab(el);
    const values = Array.from(container.querySelectorAll('.sk-devtools__trace-value')).map(
      (node) => node.textContent,
    );
    expect(values).toContain('var(--sk-bg-secondary)');
    expect(values).toContain('#222529');
    // Resolved color renders a swatch inside the trace row
    expect(container.querySelector('.sk-devtools__trace .sk-devtools__swatch')).toBeInTheDocument();
    // --sk-bg-secondary is a theme token — its ThemeConfig key is annotated
    expect(container.querySelector('.sk-devtools__trace-source')?.textContent).toContain(
      'colors.bgSecondary',
    );
    // The fallback chain renders with the depth arrow
    expect(container.textContent).toContain('↳');
    el.remove();
  });
});
