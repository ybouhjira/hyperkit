import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { StreamingIndicator } from './StreamingIndicator';

describe('StreamingIndicator', () => {
  it('shows when visible is true', () => {
    render(() => <StreamingIndicator visible={true} />);
    expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
  });

  it('is hidden when visible is false', () => {
    render(() => <StreamingIndicator visible={false} />);
    expect(screen.queryByTestId('streaming-indicator')).not.toBeInTheDocument();
  });

  it('shows default "Thinking..." message', () => {
    render(() => <StreamingIndicator visible={true} />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('shows custom message when provided', () => {
    render(() => <StreamingIndicator visible={true} message="Processing your request..." />);
    expect(screen.getByText('Processing your request...')).toBeInTheDocument();
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
  });

  it('applies custom class to the container', () => {
    render(() => <StreamingIndicator visible={true} class="my-custom-class" />);
    const indicator = screen.getByTestId('streaming-indicator');
    expect(indicator.className).toContain('my-custom-class');
  });

  it('has 3 animated dots', () => {
    render(() => <StreamingIndicator visible={true} />);
    const dotsContainer = screen.getByTestId('streaming-indicator-dots');
    const dots = dotsContainer.querySelectorAll('span');
    expect(dots).toHaveLength(3);
  });

  it('animated dots have bounce animation class', () => {
    render(() => <StreamingIndicator visible={true} />);
    const dotsContainer = screen.getByTestId('streaming-indicator-dots');
    const dots = dotsContainer.querySelectorAll('span');
    dots.forEach((dot) => {
      // Bounce animation is handled by CSS on the sk-streaming__dot class
      expect(dot.className).toContain('sk-streaming__dot');
    });
  });

  it('animated dots have staggered animation delays', () => {
    render(() => <StreamingIndicator visible={true} />);
    const dotsContainer = screen.getByTestId('streaming-indicator-dots');
    const dots = dotsContainer.querySelectorAll('span');
    expect((dots[0] as HTMLElement).style.animationDelay).toBe('0ms');
    expect((dots[1] as HTMLElement).style.animationDelay).toBe('150ms');
    expect((dots[2] as HTMLElement).style.animationDelay).toBe('300ms');
  });
});
