import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaGrid } from './MediaGrid';
import type { MediaGridItem } from './MediaGrid';

const createMockFile = (name = 'test.png', type = 'image/png', size = 1024): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const sampleItems: MediaGridItem[] = [
  { id: '1', src: 'blob:face1', label: 'Face 1' },
  { id: '2', src: 'blob:face2', label: 'Face 2' },
  { id: '3', src: 'blob:face3' },
];

describe('MediaGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders empty grid with add card only', () => {
      const onAdd = vi.fn();
      const { container } = render(() => <MediaGrid items={[]} onAdd={onAdd} />);

      const addCard = container.querySelector('.sk-media-grid__add-card');
      const items = container.querySelectorAll('.sk-media-grid__item');

      expect(addCard).toBeInTheDocument();
      expect(items).toHaveLength(0);
    });

    it('renders items with thumbnails', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} />);

      const items = container.querySelectorAll('.sk-media-grid__item');
      expect(items).toHaveLength(3);

      const img1 = items[0].querySelector('.sk-media-grid__thumbnail') as HTMLImageElement;
      const img2 = items[1].querySelector('.sk-media-grid__thumbnail') as HTMLImageElement;
      const img3 = items[2].querySelector('.sk-media-grid__thumbnail') as HTMLImageElement;

      expect(img1).toBeInTheDocument();
      expect(img1.src).toContain('blob:face1');
      expect(img2.src).toContain('blob:face2');
      expect(img3.src).toContain('blob:face3');
    });

    it('renders labels when showLabels is true (default)', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} />);

      const labels = container.querySelectorAll('.sk-media-grid__label');
      expect(labels).toHaveLength(2); // Only items with labels

      expect(labels[0].textContent).toBe('Face 1');
      expect(labels[1].textContent).toBe('Face 2');
    });

    it('hides labels when showLabels is false', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} showLabels={false} />);

      const labels = container.querySelectorAll('.sk-media-grid__label');
      expect(labels).toHaveLength(0);
    });

    it('applies selected class to selectedId item', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} selectedId="2" />);

      const items = container.querySelectorAll('.sk-media-grid__item');
      expect(items[0]).not.toHaveClass('sk-media-grid__item--selected');
      expect(items[1]).toHaveClass('sk-media-grid__item--selected');
      expect(items[2]).not.toHaveClass('sk-media-grid__item--selected');
    });
  });

  describe('Add', () => {
    it('click add card triggers file input', () => {
      const onAdd = vi.fn();
      const { container } = render(() => <MediaGrid items={[]} onAdd={onAdd} />);

      const addCard = container.querySelector('.sk-media-grid__add-card') as HTMLElement;
      const fileInput = container.querySelector('.sk-media-grid__file-input') as HTMLInputElement;

      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(addCard);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('file input change calls onAdd', () => {
      const onAdd = vi.fn();
      const { container } = render(() => <MediaGrid items={[]} onAdd={onAdd} />);

      const fileInput = container.querySelector('.sk-media-grid__file-input') as HTMLInputElement;
      const file = createMockFile();

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(onAdd).toHaveBeenCalledWith([file]);
    });

    it('grid drop calls onAdd', () => {
      const onAdd = vi.fn();
      const { container } = render(() => <MediaGrid items={[]} onAdd={onAdd} />);

      const grid = container.querySelector('.sk-media-grid') as HTMLElement;
      const file = createMockFile();

      fireEvent.drop(grid, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onAdd).toHaveBeenCalledWith([file]);
    });

    it('hides add card when onAdd is not provided', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} />);

      const addCard = container.querySelector('.sk-media-grid__add-card');
      expect(addCard).not.toBeInTheDocument();
    });
  });

  describe('Select', () => {
    it('click item calls onSelect with id', () => {
      const onSelect = vi.fn();
      const { container } = render(() => <MediaGrid items={sampleItems} onSelect={onSelect} />);

      const items = container.querySelectorAll('.sk-media-grid__item');
      fireEvent.click(items[0]);

      expect(onSelect).toHaveBeenCalledWith('1');
    });

    it('click add card does NOT call onSelect', () => {
      const onSelect = vi.fn();
      const onAdd = vi.fn();
      const { container } = render(() => (
        <MediaGrid items={[]} onAdd={onAdd} onSelect={onSelect} />
      ));

      const addCard = container.querySelector('.sk-media-grid__add-card') as HTMLElement;
      fireEvent.click(addCard);

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Delete', () => {
    it('click delete button calls onDelete with id', () => {
      const onDelete = vi.fn();
      const { container } = render(() => <MediaGrid items={sampleItems} onDelete={onDelete} />);

      const deleteBtn = container.querySelector('.sk-media-grid__delete-btn') as HTMLElement;
      fireEvent.click(deleteBtn);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('delete click does NOT bubble to onSelect', () => {
      const onDelete = vi.fn();
      const onSelect = vi.fn();
      const { container } = render(() => (
        <MediaGrid items={sampleItems} onDelete={onDelete} onSelect={onSelect} />
      ));

      const deleteBtn = container.querySelector('.sk-media-grid__delete-btn') as HTMLElement;
      fireEvent.click(deleteBtn);

      expect(onDelete).toHaveBeenCalledWith('1');
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('no delete button when onDelete not provided', () => {
      const { container } = render(() => <MediaGrid items={sampleItems} />);

      const deleteBtn = container.querySelector('.sk-media-grid__delete-btn');
      expect(deleteBtn).not.toBeInTheDocument();
    });
  });

  describe('Replace', () => {
    it('drop on item calls onReplace(id, file)', () => {
      const onReplace = vi.fn();
      const { container } = render(() => <MediaGrid items={sampleItems} onReplace={onReplace} />);

      const items = container.querySelectorAll('.sk-media-grid__item');
      const file = createMockFile();

      fireEvent.drop(items[0], {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onReplace).toHaveBeenCalledWith('1', file);
    });

    it('item drag over applies drag-over class', () => {
      const onReplace = vi.fn();
      const { container } = render(() => <MediaGrid items={sampleItems} onReplace={onReplace} />);

      const items = container.querySelectorAll('.sk-media-grid__item');
      const file = createMockFile();

      fireEvent.dragEnter(items[0], {
        dataTransfer: {
          files: [file],
        },
      });

      expect(items[0]).toHaveClass('sk-media-grid__item--drag-over');

      fireEvent.dragLeave(items[0]);

      expect(items[0]).not.toHaveClass('sk-media-grid__item--drag-over');
    });
  });

  describe('Validation', () => {
    it('filters oversized files on add', () => {
      const onAdd = vi.fn();
      const { container } = render(() => <MediaGrid items={[]} onAdd={onAdd} maxSize={500} />);

      const grid = container.querySelector('.sk-media-grid') as HTMLElement;
      const file = createMockFile('large.png', 'image/png', 1000);

      fireEvent.drop(grid, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onAdd).not.toHaveBeenCalled();
    });

    it('filters wrong MIME files on add', () => {
      const onAdd = vi.fn();
      const { container } = render(() => (
        <MediaGrid items={[]} onAdd={onAdd} accept="image/jpeg" />
      ));

      const grid = container.querySelector('.sk-media-grid') as HTMLElement;
      const file = createMockFile('test.png', 'image/png');

      fireEvent.drop(grid, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  describe('Disabled', () => {
    it('disabled blocks all interactions', () => {
      const onAdd = vi.fn();
      const onSelect = vi.fn();
      const { container } = render(() => (
        <MediaGrid items={sampleItems} onAdd={onAdd} onSelect={onSelect} disabled />
      ));

      const grid = container.querySelector('.sk-media-grid') as HTMLElement;
      expect(grid).toHaveClass('sk-media-grid--disabled');

      // Add card click doesn't trigger file input
      const addCard = container.querySelector('.sk-media-grid__add-card') as HTMLElement;
      const fileInput = container.querySelector('.sk-media-grid__file-input') as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.click(addCard);
      expect(clickSpy).not.toHaveBeenCalled();

      // Drop doesn't call onAdd
      const file = createMockFile();
      fireEvent.drop(grid, {
        dataTransfer: {
          files: [file],
        },
      });
      expect(onAdd).not.toHaveBeenCalled();

      // Item click doesn't call onSelect
      const items = container.querySelectorAll('.sk-media-grid__item');
      fireEvent.click(items[0]);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Appearance', () => {
    it('applies custom class', () => {
      const { container } = render(() => <MediaGrid items={[]} class="my-grid" />);

      const grid = container.querySelector('.sk-media-grid');
      expect(grid).toHaveClass('my-grid');
    });

    it('sets column-min CSS variable', () => {
      const { container } = render(() => <MediaGrid items={[]} columnMinWidth={150} />);

      const grid = container.querySelector('.sk-media-grid') as HTMLElement;
      expect(grid.style.getPropertyValue('--sk-media-grid-column-min')).toBe('150px');
    });

    it('custom addLabel text', () => {
      const onAdd = vi.fn();
      const { container } = render(() => (
        <MediaGrid items={[]} onAdd={onAdd} addLabel="Add Face" />
      ));

      const addCard = container.querySelector('.sk-media-grid__add-card');
      expect(addCard?.textContent).toContain('Add Face');
    });
  });
});
