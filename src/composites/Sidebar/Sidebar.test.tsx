import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders children when open', () => {
    render(() => (
      <Sidebar open>
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('defaults to open', () => {
    render(() => (
      <Sidebar>
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('true');
  });

  it('collapses when closed', () => {
    render(() => (
      <Sidebar open={false}>
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByTestId('sidebar').style.width).toBe('0px');
  });

  it('renders header when provided', () => {
    render(() => (
      <Sidebar header={<span>Header</span>}>
        <div>Body</div>
      </Sidebar>
    ));
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(() => (
      <Sidebar footer={<span>Footer</span>}>
        <div>Body</div>
      </Sidebar>
    ));
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('shows toggle button when onToggle provided', () => {
    render(() => (
      <Sidebar onToggle={() => {}}>
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(() => (
      <Sidebar onToggle={onToggle}>
        <div>Content</div>
      </Sidebar>
    ));
    await fireEvent.click(screen.getByTestId('sidebar-toggle'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('uses custom width', () => {
    render(() => (
      <Sidebar width="20rem">
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByTestId('sidebar').style.width).toBe('20rem');
  });

  it('applies custom class', () => {
    render(() => (
      <Sidebar class="my-sidebar">
        <div>Content</div>
      </Sidebar>
    ));
    expect(screen.getByTestId('sidebar').className).toContain('my-sidebar');
  });
});
