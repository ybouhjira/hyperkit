import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders a navigation landmark', () => {
    render(() => <Pagination current={1} total={5} onChange={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders all page buttons when total <= maxVisible', () => {
    render(() => <Pagination current={1} total={5} onChange={vi.fn()} />);
    // 5 page buttons + prev + next = 7 buttons
    const buttons = screen.getAllByRole('button');
    // pages 1-5 are present
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument();
    expect(buttons.length).toBe(7); // prev + 5 pages + next
  });

  it('renders ellipsis when total > maxVisible', () => {
    render(() => <Pagination current={5} total={20} onChange={vi.fn()} maxVisible={5} />);
    const ellipses = document.querySelectorAll('.sk-pagination__ellipsis');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('always renders first and last page', () => {
    render(() => <Pagination current={10} total={20} onChange={vi.fn()} maxVisible={5} />);
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 20')).toBeInTheDocument();
  });

  it('disables prev button on page 1', () => {
    render(() => <Pagination current={1} total={10} onChange={vi.fn()} />);
    const prevBtn = screen.getByLabelText('Go to previous page');
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(() => <Pagination current={10} total={10} onChange={vi.fn()} />);
    const nextBtn = screen.getByLabelText('Go to next page');
    expect(nextBtn).toBeDisabled();
  });

  it('enables prev button when not on first page', () => {
    render(() => <Pagination current={3} total={10} onChange={vi.fn()} />);
    const prevBtn = screen.getByLabelText('Go to previous page');
    expect(prevBtn).not.toBeDisabled();
  });

  it('enables next button when not on last page', () => {
    render(() => <Pagination current={3} total={10} onChange={vi.fn()} />);
    const nextBtn = screen.getByLabelText('Go to next page');
    expect(nextBtn).not.toBeDisabled();
  });

  it('calls onChange with current-1 when prev is clicked', () => {
    const onChange = vi.fn();
    render(() => <Pagination current={5} total={10} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to previous page'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with current+1 when next is clicked', () => {
    const onChange = vi.fn();
    render(() => <Pagination current={5} total={10} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('calls onChange with the page number when a page button is clicked', () => {
    const onChange = vi.fn();
    render(() => <Pagination current={1} total={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('marks current page with aria-current="page"', () => {
    render(() => <Pagination current={3} total={5} onChange={vi.fn()} />);
    const active = screen.getByLabelText('Go to page 3');
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('applies active class to current page button', () => {
    render(() => <Pagination current={3} total={5} onChange={vi.fn()} />);
    const active = screen.getByLabelText('Go to page 3');
    expect(active).toHaveClass('sk-pagination__btn--active');
  });

  it('does not call onChange when clicking the active page', () => {
    const onChange = vi.fn();
    render(() => <Pagination current={3} total={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom class to root nav', () => {
    render(() => <Pagination current={1} total={5} onChange={vi.fn()} class="my-pager" />);
    expect(screen.getByRole('navigation')).toHaveClass('my-pager');
  });

  it('renders a single page with no ellipsis', () => {
    render(() => <Pagination current={1} total={1} onChange={vi.fn()} />);
    expect(document.querySelectorAll('.sk-pagination__ellipsis')).toHaveLength(0);
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
  });

  it('handles maxVisible=7', () => {
    render(() => <Pagination current={10} total={20} onChange={vi.fn()} maxVisible={7} />);
    // Should have both ellipses (start and end)
    const ellipses = document.querySelectorAll('.sk-pagination__ellipsis');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('shows start-only ellipsis when current is near end', () => {
    render(() => <Pagination current={19} total={20} onChange={vi.fn()} maxVisible={5} />);
    // Only start ellipsis expected, no end ellipsis
    const ellipses = document.querySelectorAll('.sk-pagination__ellipsis');
    expect(ellipses.length).toBe(1);
    expect(screen.getByLabelText('Go to page 20')).toBeInTheDocument();
  });

  it('shows end-only ellipsis when current is near start', () => {
    render(() => <Pagination current={2} total={20} onChange={vi.fn()} maxVisible={5} />);
    const ellipses = document.querySelectorAll('.sk-pagination__ellipsis');
    expect(ellipses.length).toBe(1);
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
  });
});
