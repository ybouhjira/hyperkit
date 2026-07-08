import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { SignalGrid } from './SignalGrid';

describe('SignalGrid', () => {
  it('renders the grid container', () => {
    render(() => <SignalGrid cells={[{ id: 'a', value: 0.5 }]} />);
    expect(screen.getByTestId('signal-grid')).toBeInTheDocument();
  });

  it('renders a cell for each entry', () => {
    const cells = [
      { id: 'a', value: 0 },
      { id: 'b', value: 0.5 },
      { id: 'c', value: 1 },
    ];
    render(() => <SignalGrid cells={cells} />);
    expect(screen.getByTestId('signal-grid-cell-0')).toBeInTheDocument();
    expect(screen.getByTestId('signal-grid-cell-1')).toBeInTheDocument();
    expect(screen.getByTestId('signal-grid-cell-2')).toBeInTheDocument();
  });

  it('handles empty cells array', () => {
    render(() => <SignalGrid cells={[]} />);
    expect(screen.getByTestId('signal-grid')).toBeInTheDocument();
  });

  it('applies custom cell size', () => {
    render(() => <SignalGrid cells={[{ id: 'a', value: 0.5 }]} cellSize={24} />);
    const cell = screen.getByTestId('signal-grid-cell-0');
    expect(cell.style.width).toBe('24px');
    expect(cell.style.height).toBe('24px');
  });

  it('uses custom color scale', () => {
    const customScale = () => 'rgb(255, 0, 0)';
    render(() => <SignalGrid cells={[{ id: 'a', value: 0.5 }]} colorScale={customScale} />);
    const cell = screen.getByTestId('signal-grid-cell-0');
    expect(cell.style.background).toContain('rgb(255, 0, 0)');
  });

  it('shows tooltip with label and value', () => {
    render(() => <SignalGrid cells={[{ id: 'a', value: 0.75, label: 'Node A' }]} />);
    const cell = screen.getByTestId('signal-grid-cell-0');
    expect(cell.getAttribute('title')).toContain('Node A');
    expect(cell.getAttribute('title')).toContain('0.75');
  });

  it('applies columns to grid template', () => {
    render(() => <SignalGrid cells={[{ id: 'a', value: 0.5 }]} columns={4} cellSize={16} />);
    const grid = screen.getByTestId('signal-grid');
    expect(grid.style.gridTemplateColumns).toContain('repeat(4');
  });

  it('applies custom class', () => {
    render(() => <SignalGrid cells={[{ id: 'a', value: 0 }]} class="my-grid" />);
    expect(screen.getByTestId('signal-grid')).toHaveClass('my-grid');
  });
});
