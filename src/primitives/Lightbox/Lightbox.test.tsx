import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createSignal } from 'solid-js';
import { Lightbox } from './Lightbox';

const IMAGES = [
  { src: '/img1.jpg', alt: 'Image 1' },
  { src: '/img2.jpg', alt: 'Image 2' },
  { src: '/img3.jpg', alt: 'Image 3' },
];

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('Lightbox', () => {
  it('renders nothing when closed', () => {
    render(() => <Lightbox open={false} onClose={vi.fn()} images={IMAGES} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the first image by default', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    const img = screen.getByAltText('Image 1') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/img1.jpg');
  });

  it('shows the correct image for a non-zero initialIndex', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={2} />);
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(() => <Lightbox open={true} onClose={onClose} images={IMAGES} />);
    fireEvent.click(screen.getByLabelText('Close gallery'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(() => <Lightbox open={true} onClose={onClose} images={IMAGES} />);
    const backdrop = document.querySelector('.sk-lightbox__backdrop')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(() => <Lightbox open={true} onClose={onClose} images={IMAGES} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates to next image with ArrowRight', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
  });

  it('navigates to prev image with ArrowLeft', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={2} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
  });

  it('wraps around when going past the last image', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={2} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
  });

  it('wraps around when going before the first image', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  it('navigates with next/prev buttons', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
  });

  it('shows dot indicators when there are multiple images', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} />);
    const dots = document.querySelectorAll('.sk-lightbox__dot');
    expect(dots).toHaveLength(IMAGES.length);
  });

  it('marks the active dot correctly', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={1} />);
    const dots = document.querySelectorAll('.sk-lightbox__dot');
    expect(dots[1]).toHaveClass('sk-lightbox__dot--active');
    expect(dots[0]).not.toHaveClass('sk-lightbox__dot--active');
  });

  it('navigates by clicking a dot', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    const dots = document.querySelectorAll('.sk-lightbox__dot');
    fireEvent.click(dots[2]!);
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  it('shows a counter when there are multiple images', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} initialIndex={0} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('does not show nav buttons for a single image', () => {
    render(() => (
      <Lightbox
        open={true}
        onClose={vi.fn()}
        images={[{ src: '/single.jpg', alt: 'Only image' }]}
      />
    ));
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
  });

  it('works correctly with reactive open signal', async () => {
    const [open, setOpen] = createSignal(false);
    render(() => <Lightbox open={open} onClose={() => setOpen(false)} images={IMAGES} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    setOpen(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    setOpen(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct ARIA role and label', () => {
    render(() => <Lightbox open={true} onClose={vi.fn()} images={IMAGES} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Image gallery');
  });
});
