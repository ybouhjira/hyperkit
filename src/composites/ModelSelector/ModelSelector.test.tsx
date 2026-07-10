import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ModelSelector } from './ModelSelector';

const defaultModels = [
  { id: 'opus', name: 'Claude Opus' },
  { id: 'sonnet', name: 'Claude Sonnet' },
  { id: 'haiku', name: 'Claude Haiku' },
];

describe('ModelSelector', () => {
  it('renders the selector', () => {
    render(() => <ModelSelector models={defaultModels} />);
    expect(screen.getByTestId('model-selector')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(() => <ModelSelector models={defaultModels} />);
    expect(screen.getByText('Select model...')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <ModelSelector models={defaultModels} class="w-48" />);
    expect(screen.getByTestId('model-selector').className).toContain('w-48');
  });

  it('renders the sk- root class and a tokenized Select primitive inside', () => {
    const { container } = render(() => <ModelSelector models={defaultModels} />);
    expect(container.querySelector('.sk-model-selector')).toBeInTheDocument();
    // All visual styling comes from the composed Select primitive
    expect(container.querySelector('.sk-model-selector [class*="sk-select"]')).toBeInTheDocument();
  });

  it('renders with empty models list', () => {
    render(() => <ModelSelector models={[]} />);
    expect(screen.getByTestId('model-selector')).toBeInTheDocument();
  });
});
