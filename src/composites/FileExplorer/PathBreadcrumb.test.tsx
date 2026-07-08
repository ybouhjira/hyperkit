import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { PathBreadcrumb } from './PathBreadcrumb';

describe('PathBreadcrumb', () => {
  it('renders root button', () => {
    render(() => <PathBreadcrumb path="/" onNavigate={vi.fn()} />);
    expect(screen.getByTestId('path-breadcrumb')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to root')).toBeInTheDocument();
  });

  it('renders path segments', () => {
    render(() => <PathBreadcrumb path="/home/user/projects" onNavigate={vi.fn()} />);
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('projects')).toBeInTheDocument();
  });

  it('calls onNavigate with "/" when root clicked', async () => {
    const onNavigate = vi.fn();
    render(() => <PathBreadcrumb path="/home/user" onNavigate={onNavigate} />);
    await fireEvent.click(screen.getByLabelText('Go to root'));
    expect(onNavigate).toHaveBeenCalledWith('/');
  });

  it('calls onNavigate with correct path when segment clicked', async () => {
    const onNavigate = vi.fn();
    render(() => <PathBreadcrumb path="/home/user" onNavigate={onNavigate} />);
    await fireEvent.click(screen.getByText('home'));
    expect(onNavigate).toHaveBeenCalledWith('/home');
  });

  it('marks last segment with aria-current=page', () => {
    render(() => <PathBreadcrumb path="/home/user" onNavigate={vi.fn()} />);
    const currentBtn = screen.getByText('user').closest('button');
    expect(currentBtn).toHaveAttribute('aria-current', 'page');
  });

  it('shows edit input when editable and last segment clicked', async () => {
    render(() => <PathBreadcrumb path="/home/user" onNavigate={vi.fn()} editable />);
    const lastSegment = screen.getByText('user');
    await fireEvent.click(lastSegment);
    expect(screen.getByTestId('breadcrumb-edit-input')).toBeInTheDocument();
  });

  it('commits edit on Enter and calls onNavigate', async () => {
    const onNavigate = vi.fn();
    render(() => <PathBreadcrumb path="/home/user" onNavigate={onNavigate} editable />);
    await fireEvent.click(screen.getByText('user'));
    const input = screen.getByTestId('breadcrumb-edit-input');
    await fireEvent.input(input, { target: { value: '/etc' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('/etc');
  });

  it('cancels edit on Escape', async () => {
    render(() => <PathBreadcrumb path="/home/user" onNavigate={vi.fn()} editable />);
    await fireEvent.click(screen.getByText('user'));
    const input = screen.getByTestId('breadcrumb-edit-input');
    await fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('breadcrumb-edit-input')).not.toBeInTheDocument();
  });

  it('accepts class and style props', () => {
    render(() => (
      <PathBreadcrumb path="/" onNavigate={vi.fn()} class="custom" style={{ color: 'red' }} />
    ));
    const el = screen.getByTestId('path-breadcrumb');
    expect(el.className).toContain('custom');
  });
});
