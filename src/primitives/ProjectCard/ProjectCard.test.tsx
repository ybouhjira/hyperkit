import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  it('renders project name', () => {
    render(() => <ProjectCard name="My Project" />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('applies base CSS class', () => {
    const { container } = render(() => <ProjectCard name="Test" />);
    expect(container.querySelector('.sk-project-card')).toBeInTheDocument();
  });

  it('applies custom class name', () => {
    const { container } = render(() => <ProjectCard name="Test" class="custom-card" />);
    const card = container.querySelector('.sk-project-card');
    expect(card).toHaveClass('sk-project-card');
    expect(card).toHaveClass('custom-card');
  });

  it('displays project initials when no icon provided', () => {
    render(() => <ProjectCard name="Test Project" />);
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    const { container } = render(() => <ProjectCard name="Test" icon="folder" />);
    const iconContainer = container.querySelector('.sk-project-card__icon');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom color to icon background', () => {
    const { container } = render(() => <ProjectCard name="Test" color="#FF5733" />);
    const iconContainer = container.querySelector('.sk-project-card__icon') as HTMLElement;
    expect(iconContainer.style.backgroundColor).toBe('rgb(255, 87, 51)');
  });

  it('renders subtitle when provided', () => {
    render(() => <ProjectCard name="Test" subtitle="Project subtitle" />);
    expect(screen.getByText('Project subtitle')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(() => <ProjectCard name="Test" description="This is a test project" />);
    expect(screen.getByText('This is a test project')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const { container } = render(() => <ProjectCard name="Test" />);
    expect(container.querySelector('.sk-project-card__subtitle')).not.toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(() => <ProjectCard name="Test" />);
    expect(container.querySelector('.sk-project-card__description')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(() => <ProjectCard name="Test" onClick={handleClick} />);

    const card = container.querySelector('.sk-project-card') as HTMLElement;
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sets role="button" when onClick is provided', () => {
    const { container } = render(() => <ProjectCard name="Test" onClick={() => {}} />);
    const card = container.querySelector('.sk-project-card');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('sets tabIndex when onClick is provided', () => {
    const { container } = render(() => <ProjectCard name="Test" onClick={() => {}} />);
    const card = container.querySelector('.sk-project-card');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('does not set role or tabIndex when onClick is not provided', () => {
    const { container } = render(() => <ProjectCard name="Test" />);
    const card = container.querySelector('.sk-project-card');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('renders pin button when onTogglePin is provided', () => {
    render(() => <ProjectCard name="Test" onTogglePin={() => {}} />);
    expect(screen.getByLabelText('Pin')).toBeInTheDocument();
  });

  it('does not render pin button when onTogglePin is not provided', () => {
    render(() => <ProjectCard name="Test" />);
    expect(screen.queryByLabelText('Pin')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Unpin')).not.toBeInTheDocument();
  });

  it('shows "Unpin" aria-label when pinned', () => {
    render(() => <ProjectCard name="Test" pinned onTogglePin={() => {}} />);
    expect(screen.getByLabelText('Unpin')).toBeInTheDocument();
  });

  it('shows "Pin" aria-label when not pinned', () => {
    render(() => <ProjectCard name="Test" pinned={false} onTogglePin={() => {}} />);
    expect(screen.getByLabelText('Pin')).toBeInTheDocument();
  });

  it('calls onTogglePin when pin button is clicked', () => {
    const handleTogglePin = vi.fn();
    render(() => <ProjectCard name="Test" onTogglePin={handleTogglePin} />);

    const pinButton = screen.getByLabelText('Pin');
    fireEvent.click(pinButton);

    expect(handleTogglePin).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when pin button is clicked', () => {
    const handleClick = vi.fn();
    const handleTogglePin = vi.fn();
    render(() => <ProjectCard name="Test" onClick={handleClick} onTogglePin={handleTogglePin} />);

    const pinButton = screen.getByLabelText('Pin');
    fireEvent.click(pinButton);

    expect(handleTogglePin).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('generates correct initials from single word name', () => {
    render(() => <ProjectCard name="Test" />);
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('generates correct initials from multi-word name', () => {
    render(() => <ProjectCard name="My Project" />);
    expect(screen.getByText('MY')).toBeInTheDocument();
  });

  it('generates correct initials for single character name', () => {
    const { container } = render(() => <ProjectCard name="X" />);
    const iconContainer = container.querySelector('.sk-project-card__icon');
    expect(iconContainer?.textContent).toBe('X');
  });

  it('forwards other props to wrapper div', () => {
    const { container } = render(() => <ProjectCard name="Test" data-custom="test-value" />);
    const card = container.querySelector('.sk-project-card');
    expect(card).toHaveAttribute('data-custom', 'test-value');
  });
});
