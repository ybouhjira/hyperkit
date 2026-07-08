import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import {
  PaperclipIcon,
  BoldIcon,
  ItalicIcon,
  CodeIcon,
  LinkIcon,
  MicIcon,
  SendIcon,
  StopIcon,
  CloseIcon,
} from './icons';

describe('MessageInput icons', () => {
  it('renders PaperclipIcon', () => {
    const { container } = render(() => <PaperclipIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 16 16');
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });

  it('renders BoldIcon', () => {
    const { container } = render(() => <BoldIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('fill')).toBe('currentColor');
  });

  it('renders ItalicIcon', () => {
    const { container } = render(() => <ItalicIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('fill')).toBe('currentColor');
  });

  it('renders CodeIcon', () => {
    const { container } = render(() => <CodeIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
  });

  it('renders LinkIcon', () => {
    const { container } = render(() => <LinkIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
  });

  it('renders MicIcon', () => {
    const { container } = render(() => <MicIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('rect')).toBeInTheDocument();
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });

  it('renders SendIcon', () => {
    const { container } = render(() => <SendIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('stroke-width')).toBe('2');
  });

  it('renders StopIcon', () => {
    const { container } = render(() => <StopIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('fill')).toBe('currentColor');
    expect(svg?.querySelector('rect')).toBeInTheDocument();
  });

  it('renders CloseIcon', () => {
    const { container } = render(() => <CloseIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('12');
    expect(svg?.getAttribute('height')).toBe('12');
  });
});
