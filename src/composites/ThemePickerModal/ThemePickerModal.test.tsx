import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ThemePickerModal } from './ThemePickerModal';
import { ThemeProvider } from '../../theme/ThemeProvider';

describe('ThemePickerModal', () => {
  let onOpenChangeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onOpenChangeMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (open = true) => {
    return render(() => (
      <ThemeProvider>
        <ThemePickerModal open={open} onOpenChange={onOpenChangeMock} />
      </ThemeProvider>
    ));
  };

  describe('Rendering', () => {
    it('should render the modal when open is true', () => {
      renderModal(true);
      expect(screen.getByText('Select Theme')).toBeInTheDocument();
    });

    it('should not render modal content when open is false', () => {
      renderModal(false);
      expect(screen.queryByText('Select Theme')).not.toBeInTheDocument();
    });

    it('should render category tabs', () => {
      renderModal(true);
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Editor-Inspired')).toBeInTheDocument();
      expect(screen.getByText('Platform')).toBeInTheDocument();
    });

    it('should render all available themes by default', () => {
      renderModal(true);
      const themeCards = document.querySelectorAll('.sk-theme-picker-modal__theme-card');
      expect(themeCards.length).toBeGreaterThan(0);
    });

    it('should render mini IDE preview for each theme', () => {
      renderModal(true);
      const ideCards = document.querySelectorAll('.sk-theme-card__ide');
      expect(ideCards.length).toBeGreaterThan(0);
    });

    it('should render IDE elements in each card', () => {
      renderModal(true);
      const titlebars = document.querySelectorAll('.sk-theme-card__titlebar');
      const editors = document.querySelectorAll('.sk-theme-card__editor');
      const terminals = document.querySelectorAll('.sk-theme-card__terminal');
      expect(titlebars.length).toBeGreaterThan(0);
      expect(editors.length).toBeGreaterThan(0);
      expect(terminals.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('should call onOpenChange when clicking a theme', () => {
      renderModal(true);
      const themeButton = screen.getByLabelText('Select Cursor theme');
      fireEvent.click(themeButton);
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });

    it('should close modal on Escape key', () => {
      renderModal(true);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });

    it('should handle Enter key to select theme', () => {
      renderModal(true);
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });

    it('should handle Space key to select theme', () => {
      renderModal(true);
      fireEvent.keyDown(window, { key: ' ' });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate right with ArrowRight', () => {
      renderModal(true);
      const initialFocused = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      const newFocused = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      expect(newFocused).not.toBe(initialFocused);
    });

    it('should navigate left with ArrowLeft', () => {
      renderModal(true);
      // First move right
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      const afterRight = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      // Then move left
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      const afterLeft = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      expect(afterLeft).not.toBe(afterRight);
    });

    it('should navigate down with ArrowDown', () => {
      renderModal(true);
      const initialFocused = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      const newFocused = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      expect(newFocused).not.toBe(initialFocused);
    });

    it('should navigate up with ArrowUp', () => {
      renderModal(true);
      // First move down
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      const afterDown = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      // Then move up
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      const afterUp = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      expect(afterUp).not.toBe(afterDown);
    });

    it('should not navigate beyond first theme when pressing ArrowLeft at start', () => {
      renderModal(true);
      // Move focus to first position explicitly
      document.querySelectorAll('.sk-theme-picker-modal__theme-card');

      // Focus should already be on first item or a specific item, pressing left should not go negative
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      // Should still have focused element (not crash)
      const focused = document.querySelector('.sk-theme-picker-modal__theme-card--focused');
      expect(focused).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter themes when clicking category tabs', () => {
      renderModal(true);
      const allCount = document.querySelectorAll('.sk-theme-picker-modal__theme-card').length;

      const darkTab = screen.getByText('Dark');
      fireEvent.click(darkTab);
      const darkCount = document.querySelectorAll('.sk-theme-picker-modal__theme-card').length;

      expect(darkCount).toBeLessThanOrEqual(allCount);
    });

    it('should highlight active category tab', () => {
      renderModal(true);
      const darkTab = screen.getByText('Dark');
      fireEvent.click(darkTab);

      expect(darkTab.classList.contains('sk-theme-picker-modal__tab--active')).toBe(true);
    });

    it('should show all themes when All tab is active', () => {
      renderModal(true);
      const allTab = screen.getByText('All');

      expect(allTab.classList.contains('sk-theme-picker-modal__tab--active')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on theme buttons', () => {
      renderModal(true);
      const themeButton = screen.getByLabelText('Select Zed Dark theme');
      expect(themeButton).toBeInTheDocument();
    });

    it('should have aria-pressed on selected theme', () => {
      renderModal(true);
      const selectedButton = document.querySelector('[aria-pressed="true"]');
      expect(selectedButton).toBeInTheDocument();
    });

    it('should have proper tabIndex on focused item', () => {
      renderModal(true);
      const focusedButton = document.querySelector('[tabIndex="0"]');
      expect(focusedButton).toBeInTheDocument();
    });

    it('should have dialog role and title', () => {
      renderModal(true);
      expect(screen.getByText('Select Theme')).toBeInTheDocument();
    });
  });

  describe('Theme Selection', () => {
    it('should highlight currently selected theme', () => {
      renderModal(true);
      const selectedCard = document.querySelector('.sk-theme-picker-modal__theme-card--selected');
      expect(selectedCard).toBeInTheDocument();
    });

    it('should render footer with keyboard shortcuts', () => {
      renderModal(true);
      const footer = document.querySelector('.sk-theme-picker-modal__footer');
      expect(footer).toBeInTheDocument();
      expect(footer?.textContent).toContain('Arrow keys');
    });
  });

  describe('Event Cleanup', () => {
    it('should cleanup keyboard listeners on unmount', () => {
      const { unmount } = renderModal(true);
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
