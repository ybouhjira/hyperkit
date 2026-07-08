import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { KanbanBoard, KanbanColumn, KanbanCard } from './KanbanBoard';

describe('KanbanBoard', () => {
  const mockCards: KanbanCard[] = [
    {
      id: '1',
      title: 'Task 1',
      subtitle: 'Description 1',
      badge: { text: 'High', color: '#ff0000' },
      accent: '#ff0000',
      icon: '🔥',
    },
    {
      id: '2',
      title: 'Task 2',
      subtitle: 'Description 2',
    },
    {
      id: '3',
      title: 'Task 3',
      icon: '⚡',
      accent: '#00ff00',
    },
  ];

  const mockColumns: KanbanColumn[] = [
    {
      id: 'todo',
      label: 'To Do',
      icon: '📋',
      color: '#3b82f6',
      cards: [mockCards[0], mockCards[1]],
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      color: '#f59e0b',
      cards: [mockCards[2]],
    },
    {
      id: 'done',
      label: 'Done',
      icon: '✅',
      color: '#10b981',
      cards: [],
    },
  ];

  it('renders correctly with columns', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <KanbanBoard columns={mockColumns} class="custom-kanban" />);

    const kanban = document.querySelector('.sk-kanban');
    expect(kanban).toHaveClass('custom-kanban');
  });

  it('renders column icons', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders card count for each column', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const counts = screen.getAllByText(/^[0-9]+$/);
    expect(counts).toHaveLength(3);
    expect(counts[0]).toHaveTextContent('2'); // To Do
    expect(counts[1]).toHaveTextContent('1'); // In Progress
    expect(counts[2]).toHaveTextContent('0'); // Done
  });

  it('renders cards in columns', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('renders card subtitles', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders card badges', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('High')).toBeInTheDocument();
    const badge = document.querySelector('.sk-kanban__card-badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders card icons with accent color', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('shows empty state when column has no cards', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('shows custom empty state message', () => {
    render(() => <KanbanBoard columns={mockColumns} emptyState="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onCardClick when card is clicked', () => {
    const onCardClick = vi.fn();
    render(() => <KanbanBoard columns={mockColumns} onCardClick={onCardClick} />);

    const card = screen.getByText('Task 1').closest('.sk-kanban__card');
    fireEvent.click(card!);

    expect(onCardClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).toHaveBeenCalledWith(mockCards[0], 'todo');
  });

  it('highlights selected card', () => {
    render(() => <KanbanBoard columns={mockColumns} selectedCardId="2" />);

    const selectedCard = screen.getByText('Task 2').closest('.sk-kanban__card');
    const unselectedCard = screen.getByText('Task 1').closest('.sk-kanban__card');

    expect(selectedCard).toHaveClass('sk-kanban__card--selected');
    expect(unselectedCard).not.toHaveClass('sk-kanban__card--selected');
  });

  it('applies column header border color', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const headers = document.querySelectorAll('.sk-kanban__column-header');
    expect(headers[0]).toHaveStyle({ 'border-top-color': '#3b82f6' });
    expect(headers[1]).toHaveStyle({ 'border-top-color': '#f59e0b' });
    expect(headers[2]).toHaveStyle({ 'border-top-color': '#10b981' });
  });

  it('applies column count badge styling with color', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const countBadges = document.querySelectorAll('.sk-kanban__column-count');
    expect(countBadges[0]).toHaveStyle({ color: '#3b82f6' });
  });

  it('renders cards without subtitles', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const card3 = screen.getByText('Task 3').closest('.sk-kanban__card');
    const subtitle = card3?.querySelector('.sk-kanban__card-subtitle');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('renders cards without badges', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const card2 = screen.getByText('Task 2').closest('.sk-kanban__card');
    const badge = card2?.querySelector('.sk-kanban__card-badge');
    expect(badge).not.toBeInTheDocument();
  });

  it('renders cards without icons', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const card2 = screen.getByText('Task 2').closest('.sk-kanban__card');
    const icon = card2?.querySelector('.sk-kanban__card-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders columns without icons', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const inProgressColumn = screen.getByText('In Progress').closest('.sk-kanban__column-header');
    const icon = inProgressColumn?.querySelector('.sk-kanban__column-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders with empty columns array', () => {
    render(() => <KanbanBoard columns={[]} />);

    const kanban = document.querySelector('.sk-kanban');
    expect(kanban).toBeInTheDocument();
  });

  it('handles card click without onCardClick prop', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const card = screen.getByText('Task 1').closest('.sk-kanban__card');
    expect(() => fireEvent.click(card!)).not.toThrow();
  });

  it('applies BEM classes correctly', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    expect(document.querySelector('.sk-kanban')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column-header')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column-label')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column-name')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column-count')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__column-body')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__card')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__card-header')).toBeInTheDocument();
    expect(document.querySelector('.sk-kanban__card-title')).toBeInTheDocument();
  });

  it('renders multiple cards in single column correctly', () => {
    render(() => <KanbanBoard columns={mockColumns} />);

    const todoColumn = screen.getByText('To Do').closest('.sk-kanban__column');
    const cards = todoColumn?.querySelectorAll('.sk-kanban__card');
    expect(cards).toHaveLength(2);
  });
});
