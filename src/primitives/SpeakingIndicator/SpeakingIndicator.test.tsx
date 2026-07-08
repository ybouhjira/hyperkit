import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { SpeakingIndicator } from './SpeakingIndicator';

describe('SpeakingIndicator', () => {
  it('renders nothing when visible=false', () => {
    const { queryByTestId } = render(() => <SpeakingIndicator visible={false} />);
    expect(queryByTestId('speaking-indicator')).toBeNull();
  });

  it('renders bars variant by default', () => {
    const { getByTestId } = render(() => <SpeakingIndicator visible />);
    const root = getByTestId('speaking-indicator');
    expect(root).toBeInTheDocument();
    expect(root.getAttribute('data-variant')).toBe('bars');
    expect(getByTestId('speaking-indicator-bars').children.length).toBe(5);
  });

  it('renders dot variant', () => {
    const { getByTestId } = render(() => <SpeakingIndicator visible variant="dot" />);
    expect(getByTestId('speaking-indicator-dot')).toBeInTheDocument();
  });

  it('renders wave variant', () => {
    const { getByTestId } = render(() => <SpeakingIndicator visible variant="wave" />);
    expect(getByTestId('speaking-indicator-wave')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    const { getByText } = render(() => <SpeakingIndicator visible label="Narrating" />);
    expect(getByText('Narrating')).toBeInTheDocument();
  });

  it('uses role=status + aria-live=polite for screen readers', () => {
    const { getByTestId } = render(() => <SpeakingIndicator visible label="Narrating" />);
    const root = getByTestId('speaking-indicator');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-live')).toBe('polite');
    expect(root.getAttribute('aria-label')).toBe('Narrating');
  });

  it('applies size preset via data attribute', () => {
    const { getByTestId } = render(() => <SpeakingIndicator visible size="lg" />);
    expect(getByTestId('speaking-indicator').getAttribute('data-size')).toBe('lg');
  });
});
