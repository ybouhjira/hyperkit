import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './Tabs';

const items = [
  { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div>, disabled: true },
];

describe('Tabs', () => {
  it('renders all tab triggers with labels', () => {
    render(() => <Tabs items={items} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('shows first tab content by default when no value prop', () => {
    render(() => <Tabs items={items} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('shows controlled tab content', () => {
    render(() => <Tabs items={items} value="tab2" />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    const onChange = vi.fn();
    render(() => <Tabs items={items} value="tab1" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('disabled tab cannot be clicked', () => {
    const onChange = vi.fn();
    render(() => <Tabs items={items} value="tab1" onChange={onChange} />);
    const tab3 = screen.getByText('Tab 3');
    // Kobalte uses data-disabled attribute
    expect(tab3).toHaveAttribute('data-disabled');
    // Verify onChange is not called when clicking disabled tab
    fireEvent.click(tab3);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders with horizontal orientation by default', () => {
    const { container } = render(() => <Tabs items={items} />);
    const tabsRoot = container.querySelector('[role="tablist"]')?.parentElement;
    expect(tabsRoot?.className).toContain('sk-tabs');
    expect(tabsRoot?.className).not.toContain('sk-tabs--vertical');
  });

  it('renders with vertical orientation', () => {
    const { container } = render(() => <Tabs items={items} orientation="vertical" />);
    const tabsRoot = container.querySelector('[role="tablist"]')?.parentElement;
    expect(tabsRoot?.className).toContain('sk-tabs');
    expect(tabsRoot?.className).toContain('sk-tabs--vertical');
  });

  it('applies custom class', () => {
    const { container } = render(() => <Tabs items={items} class="custom-tabs" />);
    const tabsRoot = container.querySelector('[role="tablist"]')?.parentElement;
    expect(tabsRoot?.className).toContain('custom-tabs');
  });
});
