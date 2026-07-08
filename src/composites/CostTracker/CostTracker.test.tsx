import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { CostTracker } from './CostTracker';

describe('CostTracker', () => {
  describe('Default mode', () => {
    it('renders cost with 4 decimal places', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} />);
      expect(screen.getByText('$0.0234')).toBeInTheDocument();
    });

    it('renders input tokens under 1000 as-is', () => {
      render(() => <CostTracker cost={0.0012} inputTokens={234} outputTokens={156} />);
      expect(screen.getByText('234')).toBeInTheDocument();
    });

    it('renders output tokens under 1000 as-is', () => {
      render(() => <CostTracker cost={0.0012} inputTokens={234} outputTokens={156} />);
      expect(screen.getByText('156')).toBeInTheDocument();
    });

    it('formats input tokens 1000+ as k notation', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} />);
      expect(screen.getByText('1.2k')).toBeInTheDocument();
    });

    it('formats output tokens 1000+ as k notation', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={234} outputTokens={1567} />);
      expect(screen.getByText('1.6k')).toBeInTheDocument();
    });

    it('shows up arrow for input tokens', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} />);
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('shows down arrow for output tokens', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} />);
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('applies custom class', () => {
      const { container } = render(() => (
        <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} class="custom-class" />
      ));
      const tracker = container.querySelector('.sk-cost-tracker');
      expect(tracker?.className).toContain('custom-class');
    });
  });

  describe('Compact mode', () => {
    it('applies compact class', () => {
      const { container } = render(() => (
        <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} compact />
      ));
      const tracker = container.querySelector('.sk-cost-tracker');
      expect(tracker?.className).toContain('sk-cost-tracker--compact');
    });

    it('shows cost in compact mode', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} compact />);
      expect(screen.getByText('$0.0234')).toBeInTheDocument();
    });

    it('hides token counts in compact mode', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} compact />);
      expect(screen.queryByText('1.2k')).not.toBeInTheDocument();
      expect(screen.queryByText('567')).not.toBeInTheDocument();
    });

    it('hides arrows in compact mode', () => {
      render(() => <CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} compact />);
      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('Cost formatting', () => {
    it('formats zero cost', () => {
      render(() => <CostTracker cost={0} inputTokens={0} outputTokens={0} />);
      expect(screen.getByText('$0.0000')).toBeInTheDocument();
    });

    it('formats very small cost', () => {
      render(() => <CostTracker cost={0.0001} inputTokens={100} outputTokens={50} />);
      expect(screen.getByText('$0.0001')).toBeInTheDocument();
    });

    it('formats large cost', () => {
      render(() => <CostTracker cost={1.2345} inputTokens={100000} outputTokens={50000} />);
      expect(screen.getByText('$1.2345')).toBeInTheDocument();
    });

    it('rounds to 4 decimal places', () => {
      render(() => <CostTracker cost={0.12345678} inputTokens={1000} outputTokens={500} />);
      expect(screen.getByText('$0.1235')).toBeInTheDocument();
    });
  });

  describe('Token formatting', () => {
    it('formats tokens exactly at 1000 as 1.0k', () => {
      render(() => <CostTracker cost={0.01} inputTokens={1000} outputTokens={500} />);
      expect(screen.getByText('1.0k')).toBeInTheDocument();
    });

    it('formats tokens at 1500 as 1.5k', () => {
      render(() => <CostTracker cost={0.01} inputTokens={1500} outputTokens={500} />);
      expect(screen.getByText('1.5k')).toBeInTheDocument();
    });

    it('formats tokens at 10000 as 10.0k', () => {
      render(() => <CostTracker cost={0.1} inputTokens={10000} outputTokens={500} />);
      expect(screen.getByText('10.0k')).toBeInTheDocument();
    });

    it('formats tokens at 15234 as 15.2k', () => {
      render(() => <CostTracker cost={0.1} inputTokens={15234} outputTokens={500} />);
      expect(screen.getByText('15.2k')).toBeInTheDocument();
    });
  });
});
