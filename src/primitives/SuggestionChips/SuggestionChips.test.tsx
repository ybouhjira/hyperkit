import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SuggestionChips, type SuggestionChip } from './SuggestionChips';

const TestIcon = () => (
  <svg data-testid="test-icon" width="16" height="16">
    <circle cx="8" cy="8" r="8" />
  </svg>
);

describe('SuggestionChips', () => {
  const mockChips: SuggestionChip[] = [
    { id: '1', label: 'First chip' },
    { id: '2', label: 'Second chip' },
    { id: '3', label: 'Third chip' },
  ];

  describe('Rendering', () => {
    it('renders all chips', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      expect(screen.getByText('First chip')).toBeInTheDocument();
      expect(screen.getByText('Second chip')).toBeInTheDocument();
      expect(screen.getByText('Third chip')).toBeInTheDocument();
    });

    it('renders with icons', () => {
      const chipsWithIcons: SuggestionChip[] = [
        { id: '1', label: 'With icon', icon: <TestIcon /> },
      ];
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={chipsWithIcons} onSelect={onSelect} />);

      expect(screen.getByText('With icon')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders without icons', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const chip = screen.getByText('First chip').closest('button');
      const icon = chip?.querySelector('.sk-suggestion-chips__icon');
      expect(icon).not.toBeInTheDocument();
    });

    it('applies custom class', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <SuggestionChips chips={mockChips} onSelect={onSelect} class="custom-class" />
      ));

      const wrapper = container.querySelector('.sk-suggestion-chips');
      expect(wrapper?.className).toContain('custom-class');
    });

    it('renders empty state', () => {
      const onSelect = vi.fn();
      const { container } = render(() => <SuggestionChips chips={[]} onSelect={onSelect} />);

      const chips = container.querySelectorAll('.sk-suggestion-chips__chip');
      expect(chips.length).toBe(0);
    });
  });

  describe('Interaction', () => {
    it('calls onSelect when chip is clicked', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const firstChip = screen.getByText('First chip');
      fireEvent.click(firstChip);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockChips[0]);
    });

    it('calls onSelect with correct chip when multiple chips exist', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const secondChip = screen.getByText('Second chip');
      fireEvent.click(secondChip);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockChips[1]);
    });

    it('allows multiple clicks', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const firstChip = screen.getByText('First chip');
      fireEvent.click(firstChip);
      fireEvent.click(firstChip);

      expect(onSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('renders buttons with proper type', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
      buttons.forEach((button) => {
        expect(button.getAttribute('type')).toBe('button');
      });
    });

    it('uses label as aria-label when no description', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const button = screen.getByText('First chip').closest('button');
      expect(button?.getAttribute('aria-label')).toBe('First chip');
    });

    it('uses description as aria-label when provided', () => {
      const chipsWithDescription: SuggestionChip[] = [
        { id: '1', label: 'Search', description: 'Search all files' },
      ];
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={chipsWithDescription} onSelect={onSelect} />);

      const button = screen.getByText('Search').closest('button');
      expect(button?.getAttribute('aria-label')).toBe('Search all files');
    });
  });

  describe('CSS Classes', () => {
    it('applies base class to container', () => {
      const onSelect = vi.fn();
      const { container } = render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const wrapper = container.querySelector('.sk-suggestion-chips');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies chip class to buttons', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const button = screen.getByText('First chip').closest('button');
      expect(button?.className).toContain('sk-suggestion-chips__chip');
    });

    it('applies icon class when icon present', () => {
      const chipsWithIcons: SuggestionChip[] = [
        { id: '1', label: 'With icon', icon: <TestIcon /> },
      ];
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={chipsWithIcons} onSelect={onSelect} />);

      const chip = screen.getByText('With icon').closest('button');
      const icon = chip?.querySelector('.sk-suggestion-chips__icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies label class to text', () => {
      const onSelect = vi.fn();
      render(() => <SuggestionChips chips={mockChips} onSelect={onSelect} />);

      const chip = screen.getByText('First chip').closest('button');
      const label = chip?.querySelector('.sk-suggestion-chips__label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('First chip');
    });
  });
});
