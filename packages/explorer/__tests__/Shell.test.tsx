import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { Shell } from '../src/components/Shell';
import { ExplorerProvider } from '../src/stores/explorerStore';
import { PluginProvider } from '../src/plugins/pluginStore';
import { ThemeProvider } from '@ybouhjira/hyperkit';

function renderShell() {
  return render(() => (
    <ThemeProvider>
      <ExplorerProvider>
        <PluginProvider>
          <Shell />
        </PluginProvider>
      </ExplorerProvider>
    </ThemeProvider>
  ));
}

describe('Shell', () => {
  it('renders header title', () => {
    renderShell();
    expect(screen.getByText('SolidKit Explorer')).toBeInTheDocument();
  });

  it('shows empty state when no story selected', () => {
    renderShell();
    expect(screen.getByText('Select a story to begin')).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    renderShell();
    // Without any enabled plugins, the fallback Sidebar renders with its search input
    const searchInput = screen.getByPlaceholderText('Search stories...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderShell();
    const input = screen.getByPlaceholderText('Search stories...');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });
});
