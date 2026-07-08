import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { OnboardingLayout } from './OnboardingLayout';

describe('OnboardingLayout', () => {
  it('renders directory picker', () => {
    render(() => <OnboardingLayout items={[]} currentPath="/home" />);
    expect(screen.getByTestId('directory-picker')).toBeInTheDocument();
  });

  it('shows title', () => {
    render(() => <OnboardingLayout items={[]} currentPath="/home" />);
    expect(screen.getByText('Select Working Directory')).toBeInTheDocument();
  });
});
