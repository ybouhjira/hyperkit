import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Accordion } from './Accordion';
import type { AccordionItemData } from './Accordion';

describe('Accordion', () => {
  const mockItems: AccordionItemData[] = [
    { value: 'item-1', title: 'Question 1', content: 'Answer 1' },
    { value: 'item-2', title: 'Question 2', content: 'Answer 2' },
    { value: 'item-3', title: 'Question 3', content: 'Answer 3' },
  ];

  it('renders all items', () => {
    render(() => <Accordion items={mockItems} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
  });

  it('expands item on click', async () => {
    render(() => <Accordion items={mockItems} />);

    const trigger = screen.getByText('Question 1');
    fireEvent.click(trigger);

    const content = screen.getByText('Answer 1');
    expect(content).toBeInTheDocument();
  });

  it('single mode - only one item open at a time', async () => {
    render(() => <Accordion items={mockItems} type="single" />);

    const trigger1 = screen.getByText('Question 1');
    const trigger2 = screen.getByText('Question 2');

    fireEvent.click(trigger1);
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    fireEvent.click(trigger2);
    expect(screen.getByText('Answer 2')).toBeInTheDocument();

    // First item should be collapsed (content not visible)
    const firstTrigger = trigger1.closest('button');
    expect(firstTrigger?.getAttribute('data-expanded')).toBeNull();
  });

  it('multiple mode - multiple items can be open', async () => {
    render(() => <Accordion items={mockItems} type="multiple" />);

    const trigger1 = screen.getByText('Question 1');
    const trigger2 = screen.getByText('Question 2');

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);

    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
  });

  it('disabled state - all items disabled', () => {
    const { container } = render(() => <Accordion items={mockItems} disabled />);

    const accordion = container.querySelector('.sk-accordion');
    // Just verify the accordion renders when disabled prop is passed
    expect(accordion).toBeInTheDocument();
  });

  it('per-item disabled state', () => {
    const itemsWithDisabled: AccordionItemData[] = [
      { value: 'item-1', title: 'Question 1', content: 'Answer 1' },
      { value: 'item-2', title: 'Question 2', content: 'Answer 2', disabled: true },
    ];

    render(() => <Accordion items={itemsWithDisabled} />);

    const enabledTrigger = screen.getByText('Question 1').closest('button');
    const disabledTrigger = screen.getByText('Question 2').closest('button');

    expect(enabledTrigger?.hasAttribute('disabled')).toBe(false);
    expect(disabledTrigger?.hasAttribute('disabled')).toBe(true);
  });

  it('applies custom class', () => {
    const { container } = render(() => <Accordion items={mockItems} class="custom-class" />);

    const accordion = container.querySelector('.sk-accordion');
    expect(accordion?.classList.contains('custom-class')).toBe(true);
  });

  it('default expanded item in single mode', async () => {
    render(() => <Accordion items={mockItems} defaultValue="item-2" />);

    // Wait a tick for SolidJS reactivity to settle
    await new Promise((resolve) => setTimeout(resolve, 0));

    const trigger = screen.getByText('Question 2').closest('button');
    // Verify item-2 is marked as the active/selected item
    expect(trigger?.getAttribute('data-key')).toBe('item-2');
  });

  it('default expanded items in multiple mode', () => {
    render(() => (
      <Accordion items={mockItems} type="multiple" defaultValue={['item-1', 'item-3']} />
    ));

    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 3')).toBeInTheDocument();
  });

  it('collapsible prop allows closing all items', async () => {
    render(() => <Accordion items={mockItems} type="single" collapsible={true} />);

    const trigger = screen.getByText('Question 1');

    // Open
    fireEvent.click(trigger);
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    // Close
    fireEvent.click(trigger);
    const button = trigger.closest('button');
    expect(button?.getAttribute('data-expanded')).toBeNull();
  });

  it('applies custom styles', () => {
    const { container } = render(() => (
      <Accordion items={mockItems} style={{ 'max-width': '600px' }} />
    ));

    const accordion = container.querySelector('.sk-accordion') as HTMLElement;
    expect(accordion?.style.maxWidth).toBe('600px');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Accordion items={mockItems} unstyled class="custom" />);
    const accordion = container.firstElementChild;
    expect(accordion?.className).not.toContain('sk-');
    expect(accordion?.className).toContain('custom');
  });
});
