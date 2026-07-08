import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DashboardContainer } from './DashboardContainer';
import type { DashboardCardConfig, DashboardCardProps } from './types';
import { autoPlace } from './useDashboardLayout';

// ── Sample cards ───────────────────────────────────────────────────────────

const makeCard = (
  id: string,
  overrides: Partial<DashboardCardConfig> = {}
): DashboardCardConfig => ({
  id,
  title: `Card ${id}`,
  component: (props: DashboardCardProps) => (
    <div data-testid={`card-body-${id}`}>{props.config.title}</div>
  ),
  defaultSize: { cols: 4, rows: 2 },
  ...overrides,
});

const sampleCards: DashboardCardConfig[] = [
  makeCard('a', { category: 'Metrics' }),
  makeCard('b', { category: 'Metrics' }),
  makeCard('c', { category: 'Activity' }),
];

// ── localStorage mock ──────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  localStorageMock.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DashboardContainer', () => {
  it('renders with card configs', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    expect(container.querySelector('.sk-dashboard-container')).toBeInTheDocument();
  });

  it('renders all visible cards', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    expect(container.querySelector('[data-testid="card-body-a"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="card-body-b"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="card-body-c"]')).toBeInTheDocument();
  });

  it('places cards in the grid with grid-column and grid-row styles', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} columns={12} />);
    const cells = container.querySelectorAll('.sk-dashboard-container__cell');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of Array.from(cells)) {
      const el = cell as HTMLElement;
      expect(el.style.gridColumn).toBeTruthy();
      expect(el.style.gridRow).toBeTruthy();
    }
  });

  it('shows edit controls when editable is not false', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    expect(container.querySelector('.sk-dashboard-container__edit-btn')).toBeInTheDocument();
  });

  it('hides edit controls when editable=false', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} editable={false} />);
    expect(container.querySelector('.sk-dashboard-container__edit-btn')).not.toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    expect(container.querySelector('.sk-dashboard-container--editing')).toBeInTheDocument();
  });

  it('exits edit mode when edit button is clicked again', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    fireEvent.click(editBtn);
    expect(container.querySelector('.sk-dashboard-container--editing')).not.toBeInTheDocument();
  });

  it('shows add button in edit mode', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    expect(container.querySelector('.sk-dashboard-container__add-btn')).toBeInTheDocument();
  });

  it('shows remove button on cards in edit mode', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    const removeBtn = container.querySelector('.sk-dashboard-card__remove');
    expect(removeBtn).toBeInTheDocument();
  });

  it('hides remove button when not in edit mode', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    expect(container.querySelector('.sk-dashboard-card__remove')).not.toBeInTheDocument();
  });

  it('removes a card when remove button is clicked', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);
    const cells = container.querySelectorAll('.sk-dashboard-container__cell');
    expect(cells.length).toBe(sampleCards.length - 1);
  });

  it('shows resize handles in edit mode for resizable cards', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    const handles = container.querySelectorAll('.sk-dashboard-card__resize-handle');
    expect(handles.length).toBeGreaterThan(0);
  });

  it('does not show resize handle for non-resizable cards', () => {
    const cards = [makeCard('x', { resizable: false })];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    expect(container.querySelector('.sk-dashboard-card__resize-handle')).not.toBeInTheDocument();
  });

  it('opens card picker when add button is clicked', () => {
    const removedCards = [
      makeCard('a', { category: 'Metrics', removable: true }),
      makeCard('b', { category: 'Metrics' }),
    ];
    const { container } = render(() => <DashboardContainer cards={removedCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove a card so picker has something to show
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);
    expect(container.querySelector('.sk-dashboard-container__picker')).toBeInTheDocument();
  });

  it('adds a card back via the picker', () => {
    const cards = [makeCard('a'), makeCard('b')];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove first card
    const removeBtns = container.querySelectorAll('.sk-dashboard-card__remove');
    fireEvent.click(removeBtns[0] as HTMLElement);
    expect(container.querySelectorAll('.sk-dashboard-container__cell').length).toBe(1);

    // Open picker and add back
    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);
    const pickerItems = container.querySelectorAll('.sk-dashboard-container__picker-item');
    expect(pickerItems.length).toBeGreaterThan(0);
    fireEvent.click(pickerItems[0] as HTMLElement);
    expect(container.querySelectorAll('.sk-dashboard-container__cell').length).toBe(2);
  });

  it('calls onLayoutChange when layout changes', () => {
    const onChange = vi.fn();
    render(() => <DashboardContainer cards={sampleCards} onLayoutChange={onChange} />);
    // onLayoutChange is called on initial render via effect
    expect(onChange).toHaveBeenCalled();
    const args = onChange.mock.calls[0][0] as unknown[];
    expect(Array.isArray(args)).toBe(true);
  });

  it('persists layout to localStorage with storageKey', async () => {
    const spy = vi.spyOn(localStorageMock, 'setItem');
    render(() => <DashboardContainer cards={sampleCards} storageKey="test-dashboard" />);
    await vi.waitFor(
      () => {
        expect(spy).toHaveBeenCalledWith('test-dashboard', expect.any(String));
      },
      { timeout: 500 }
    );
  });

  it('loads layout from localStorage when storageKey is provided', () => {
    const saved = JSON.stringify([{ id: 'a', col: 3, row: 0, cols: 6, rows: 3 }]);
    localStorageMock.setItem('test-dashboard', saved);
    const cards = [makeCard('a')];
    const { container } = render(() => (
      <DashboardContainer cards={cards} storageKey="test-dashboard" />
    ));
    const cell = container.querySelector('.sk-dashboard-container__cell') as HTMLElement;
    expect(cell.style.gridColumn).toContain('4');
  });

  it('resets layout when reset button is clicked', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} columns={12} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);
    const resetBtn = container.querySelector('.sk-dashboard-container__reset-btn') as HTMLElement;
    fireEvent.click(resetBtn);
    expect(container.querySelectorAll('.sk-dashboard-container__cell').length).toBe(
      sampleCards.length
    );
  });

  it('renders card title in header', () => {
    const { container } = render(() => <DashboardContainer cards={[makeCard('x')]} />);
    const titleEl = container.querySelector('.sk-dashboard-card__title');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl?.textContent).toBe('Card x');
  });

  it('renders card icon when provided', () => {
    const cards = [makeCard('x', { icon: <span data-testid="card-icon">★</span> })];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    expect(container.querySelector('[data-testid="card-icon"]')).toBeInTheDocument();
  });

  it('picker groups cards by category', () => {
    const cards = [
      makeCard('a', { category: 'Metrics' }),
      makeCard('b', { category: 'Metrics' }),
      makeCard('c', { category: 'Activity' }),
    ];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove two cards to populate picker with both categories
    const removeBtns = container.querySelectorAll('.sk-dashboard-card__remove');
    fireEvent.click(removeBtns[0] as HTMLElement);
    fireEvent.click(removeBtns[1] as HTMLElement);

    // Open picker
    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);

    // Should show category group labels
    const categories = container.querySelectorAll('.sk-dashboard-container__picker-category');
    expect(categories.length).toBeGreaterThanOrEqual(1);
  });

  it('default category is "General" when card has no category', () => {
    const cards = [makeCard('a'), makeCard('b')]; // no category
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove card
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    // Open picker
    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);

    const categories = container.querySelectorAll('.sk-dashboard-container__picker-category');
    const categoryTexts = Array.from(categories).map((c) => c.textContent);
    expect(categoryTexts).toContain('General');
  });

  it('picker closes after adding a card', () => {
    const cards = [makeCard('a'), makeCard('b')];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    // Open picker
    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);
    expect(container.querySelector('.sk-dashboard-container__picker')).toBeInTheDocument();

    // Add card via picker
    const pickerItem = container.querySelector(
      '.sk-dashboard-container__picker-item'
    ) as HTMLElement;
    fireEvent.click(pickerItem);

    // Picker should close
    expect(container.querySelector('.sk-dashboard-container__picker')).not.toBeInTheDocument();
  });

  it('picker closes when exiting edit mode', () => {
    const cards = [makeCard('a'), makeCard('b')];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    // Open picker
    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    fireEvent.click(addBtn);
    expect(container.querySelector('.sk-dashboard-container__picker')).toBeInTheDocument();

    // Exit edit mode
    fireEvent.click(editBtn);

    // Picker should be gone (edit mode exited, picker hidden)
    expect(container.querySelector('.sk-dashboard-container__picker')).not.toBeInTheDocument();
  });

  it('add button toggles picker open/closed', () => {
    const cards = [makeCard('a'), makeCard('b')];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove to have hidden cards
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;

    // Open
    fireEvent.click(addBtn);
    expect(container.querySelector('.sk-dashboard-container__picker')).toBeInTheDocument();

    // Close
    fireEvent.click(addBtn);
    expect(container.querySelector('.sk-dashboard-container__picker')).not.toBeInTheDocument();
  });

  it('edit button aria-label toggles between edit/done', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;

    expect(editBtn.getAttribute('aria-label')).toBe('Edit dashboard');
    expect(editBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(editBtn);

    expect(editBtn.getAttribute('aria-label')).toBe('Done editing');
    expect(editBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('add button shows aria-expanded state', () => {
    const cards = [makeCard('a'), makeCard('b')];
    const { container } = render(() => <DashboardContainer cards={cards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove to have a hidden card
    const removeBtn = container.querySelector('.sk-dashboard-card__remove') as HTMLElement;
    fireEvent.click(removeBtn);

    const addBtn = container.querySelector('.sk-dashboard-container__add-btn') as HTMLElement;
    expect(addBtn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(addBtn);
    expect(addBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('reset restores all cards including removed ones', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const editBtn = container.querySelector('.sk-dashboard-container__edit-btn') as HTMLElement;
    fireEvent.click(editBtn);

    // Remove all cards
    let removeBtns = container.querySelectorAll('.sk-dashboard-card__remove');
    while (removeBtns.length > 0) {
      fireEvent.click(removeBtns[0] as HTMLElement);
      removeBtns = container.querySelectorAll('.sk-dashboard-card__remove');
    }

    expect(container.querySelectorAll('.sk-dashboard-container__cell').length).toBe(0);

    // Reset
    const resetBtn = container.querySelector('.sk-dashboard-container__reset-btn') as HTMLElement;
    fireEvent.click(resetBtn);

    expect(container.querySelectorAll('.sk-dashboard-container__cell').length).toBe(
      sampleCards.length
    );
  });

  it('applies custom class and style', () => {
    const { container } = render(() => (
      <DashboardContainer cards={sampleCards} class="my-dashboard" style={{ color: 'red' }} />
    ));
    const root = container.querySelector('.sk-dashboard-container') as HTMLElement;
    expect(root).toHaveClass('my-dashboard');
  });

  it('grid style variables are set correctly', () => {
    const { container } = render(() => (
      <DashboardContainer cards={sampleCards} columns={8} rowHeight="lg" gap="sm" />
    ));
    const grid = container.querySelector('.sk-dashboard-container__grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dc-columns')).toBe('8');
    expect(grid.style.getPropertyValue('--sk-dc-row-height')).toBe('120px');
    expect(grid.style.getPropertyValue('--sk-dc-gap')).toBe('var(--sk-space-sm)');
  });

  it('uses default gap=md, rowHeight=md, columns=12', () => {
    const { container } = render(() => <DashboardContainer cards={sampleCards} />);
    const grid = container.querySelector('.sk-dashboard-container__grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--sk-dc-columns')).toBe('12');
    expect(grid.style.getPropertyValue('--sk-dc-row-height')).toBe('80px');
    expect(grid.style.getPropertyValue('--sk-dc-gap')).toBe('var(--sk-space-md)');
  });
});

// ── autoPlace unit tests ───────────────────────────────────────────────────

describe('autoPlace', () => {
  it('places a single card at (0, 0)', () => {
    const cards = [makeCard('a', { defaultSize: { cols: 4, rows: 2 } })];
    const layouts = autoPlace(cards, 12);
    expect(layouts[0]).toMatchObject({ id: 'a', col: 0, row: 0, cols: 4, rows: 2 });
  });

  it('places multiple non-overlapping cards', () => {
    const cards = [
      makeCard('a', { defaultSize: { cols: 6, rows: 2 } }),
      makeCard('b', { defaultSize: { cols: 6, rows: 2 } }),
    ];
    const layouts = autoPlace(cards, 12);
    const [la, lb] = layouts;
    expect(la).toBeDefined();
    expect(lb).toBeDefined();
    if (!la || !lb) return;
    // b should not overlap a
    const aRight = la.col + la.cols;
    const bRight = lb.col + lb.cols;
    const overlap =
      la.col < bRight && aRight > lb.col && la.row < lb.row + lb.rows && la.row + la.rows > lb.row;
    expect(overlap).toBe(false);
  });

  it('wraps to next row when no space left in current row', () => {
    const cards = [
      makeCard('a', { defaultSize: { cols: 8, rows: 2 } }),
      makeCard('b', { defaultSize: { cols: 6, rows: 2 } }),
    ];
    const layouts = autoPlace(cards, 12);
    const lb = layouts[1];
    expect(lb).toBeDefined();
    if (!lb) return;
    // b doesn't fit on row 0 next to a (8+6=14 > 12), so it should be on row ≥ 1 or col 8
    const la = layouts[0];
    if (!la) return;
    const noOverlap =
      lb.col >= la.col + la.cols || lb.row >= la.row + la.rows || lb.col + lb.cols <= la.col;
    expect(noOverlap).toBe(true);
  });

  it('uses default size of (min(4, columns), 2) when defaultSize not specified', () => {
    const card: DashboardCardConfig = {
      id: 'x',
      title: 'X',
      component: () => null,
    };
    const layouts = autoPlace([card], 12);
    expect(layouts[0]?.cols).toBe(4);
    expect(layouts[0]?.rows).toBe(2);
  });
});
