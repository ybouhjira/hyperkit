import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@solidjs/testing-library';
import { Inspector, InspectorProvider } from './Inspector';
import type { Annotation, InspectorStorage } from './types';

function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'a1',
    selector: '#target-el',
    elementInfo: {
      tagName: 'h3',
      classes: ['title'],
      textPreview: 'Hello world',
      boundingRect: { x: 0, y: 0, width: 100, height: 20 },
    },
    status: 'open',
    createdAt: new Date().toISOString(),
    thread: [
      { id: 't1', author: 'user', text: 'First comment', timestamp: new Date().toISOString() },
      { id: 't2', author: 'claude', text: 'A reply', timestamp: new Date().toISOString() },
    ],
    ...overrides,
  };
}

function makeStorage(initial: Annotation[] = [makeAnnotation()]): InspectorStorage {
  let annotations = [...initial];
  return {
    getAll: vi.fn(() => Promise.resolve([...annotations])),
    create: vi.fn((data) => {
      const a = makeAnnotation({
        id: `a${annotations.length + 1}`,
        selector: data.selector,
        thread: [
          { id: 't1', author: 'user', text: data.note, timestamp: new Date().toISOString() },
        ],
      });
      annotations = [...annotations, a];
      return Promise.resolve(a);
    }),
    update: vi.fn((id, patch) => {
      annotations = annotations.map((a) => (a.id === id ? { ...a, ...patch } : a));
      const found = annotations.find((a) => a.id === id);
      return found ? Promise.resolve(found) : Promise.reject(new Error('not found'));
    }),
    delete: vi.fn((id) => {
      annotations = annotations.filter((a) => a.id !== id);
      return Promise.resolve();
    }),
    reply: vi.fn((id, text, author) => {
      annotations = annotations.map((a) =>
        a.id === id
          ? {
              ...a,
              thread: [
                ...a.thread,
                {
                  id: `t${a.thread.length + 1}`,
                  author: author === 'claude' ? ('claude' as const) : ('user' as const),
                  text,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : a
      );
      const found = annotations.find((a) => a.id === id);
      return found ? Promise.resolve(found) : Promise.reject(new Error('not found'));
    }),
  };
}

function renderInspector(storage: InspectorStorage, active = false) {
  const onClose = vi.fn();
  const result = render(() => (
    <InspectorProvider storage={storage}>
      <Inspector active={active} onClose={onClose} />
    </InspectorProvider>
  ));
  return { ...result, onClose };
}

describe('composites/Inspector', () => {
  it('renders the comments panel with sk- classes and annotation count', async () => {
    renderInspector(makeStorage());
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__panel')).toBeInTheDocument();
    });
    expect(document.querySelector('.sk-inspector__panel-header')).toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__panel-filters')).toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__panel-list')).toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__panel-footer')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('renders open threads with status dot and truncated selector', async () => {
    renderInspector(makeStorage());
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread')).toBeInTheDocument();
    });
    expect(document.querySelector('.sk-inspector__dot')).toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__dot--resolved')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__thread-selector')).toHaveTextContent('<h3>');
    expect(screen.getByText('First comment')).toBeInTheDocument();
  });

  it('expands a thread on click and shows the message thread', async () => {
    renderInspector(makeStorage());
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread-header')).toBeInTheDocument();
    });
    fireEvent.click(document.querySelector('.sk-inspector__thread-header') as HTMLElement);
    expect(document.querySelector('.sk-inspector__thread-body')).toBeInTheDocument();
    expect(document.querySelectorAll('.sk-inspector__msg')).toHaveLength(2);
    expect(document.querySelector('.sk-inspector__msg--claude')).toHaveTextContent('A reply');
  });

  it('filters resolved threads and marks them with the resolved modifier', async () => {
    const storage = makeStorage([
      makeAnnotation({ id: 'a1' }),
      makeAnnotation({ id: 'a2', status: 'resolved' }),
    ]);
    renderInspector(storage);
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread')).toBeInTheDocument();
    });
    // Default filter is "open" — only the open thread renders
    expect(document.querySelectorAll('.sk-inspector__thread')).toHaveLength(1);
    fireEvent.click(screen.getByText('Resolved (1)'));
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread--resolved')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('All (2)'));
    await waitFor(() => {
      expect(document.querySelectorAll('.sk-inspector__thread')).toHaveLength(2);
    });
  });

  it('replies to a thread through storage', async () => {
    const storage = makeStorage();
    renderInspector(storage);
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread-header')).toBeInTheDocument();
    });
    fireEvent.click(document.querySelector('.sk-inspector__thread-header') as HTMLElement);
    const textarea = document.querySelector(
      '.sk-inspector__textarea--reply'
    ) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    fireEvent.input(textarea, { target: { value: 'New reply' } });
    fireEvent.click(screen.getByText('Reply'));
    await waitFor(() => {
      expect(storage.reply).toHaveBeenCalledWith('a1', 'New reply', 'user');
    });
  });

  it('deletes a thread through storage', async () => {
    const storage = makeStorage();
    renderInspector(storage);
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle('Delete').querySelector('button') as HTMLElement);
    await waitFor(() => {
      expect(storage.delete).toHaveBeenCalledWith('a1');
      expect(document.querySelector('.sk-inspector__thread')).not.toBeInTheDocument();
    });
  });

  it('toggles resolution through storage', async () => {
    const storage = makeStorage();
    renderInspector(storage);
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__thread')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle('Resolve').querySelector('button') as HTMLElement);
    await waitFor(() => {
      expect(storage.update).toHaveBeenCalledWith('a1', { status: 'resolved' });
    });
  });

  it('collapses the panel to a floating button and reopens it', async () => {
    renderInspector(makeStorage());
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__panel')).toBeInTheDocument();
    });
    fireEvent.click(document.querySelector('.sk-inspector__panel-header button') as HTMLElement);
    expect(document.querySelector('.sk-inspector__panel')).not.toBeInTheDocument();
    expect(document.querySelector('.sk-inspector__fab')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.sk-inspector__fab button') as HTMLElement);
    expect(document.querySelector('.sk-inspector__panel')).toBeInTheDocument();
  });

  it('shows an empty state when there are no matching comments', async () => {
    renderInspector(makeStorage([]), true);
    await waitFor(() => {
      expect(document.querySelector('.sk-inspector__panel')).toBeInTheDocument();
    });
    expect(document.querySelector('.sk-inspector__panel-empty')).toBeInTheDocument();
    expect(screen.getByText(/No open comments/)).toBeInTheDocument();
  });

  it('renders comment pins for annotations whose targets exist', async () => {
    const target = document.createElement('h3');
    target.id = 'target-el';
    document.body.appendChild(target);
    try {
      renderInspector(makeStorage());
      await waitFor(() => {
        expect(document.querySelector('.sk-inspector__pin')).toBeInTheDocument();
      });
    } finally {
      target.remove();
    }
  });

  it('selects an element in inspect mode and shows the tokenized note popover', async () => {
    const target = document.createElement('p');
    target.textContent = 'Click me';
    document.body.appendChild(target);
    try {
      renderInspector(makeStorage([]), true);
      fireEvent.click(target);
      await waitFor(() => {
        expect(document.querySelector('.sk-inspector__note')).toBeInTheDocument();
      });
      expect(document.querySelector('.sk-inspector__overlay--selected')).toBeInTheDocument();
      expect(document.querySelector('.sk-inspector__element-chip')).toBeInTheDocument();
      expect(document.querySelector('.sk-inspector__textarea')).toBeInTheDocument();
    } finally {
      target.remove();
    }
  });

  it('saves a new annotation from the note popover', async () => {
    const storage = makeStorage([]);
    renderInspector(storage, true);
    const target = document.createElement('p');
    target.textContent = 'Annotate me';
    document.body.appendChild(target);
    try {
      fireEvent.click(target);
      await waitFor(() => {
        expect(document.querySelector('.sk-inspector__note')).toBeInTheDocument();
      });
      const textarea = document.querySelector('.sk-inspector__textarea') as HTMLTextAreaElement;
      fireEvent.input(textarea, { target: { value: 'Needs polish' } });
      fireEvent.click(screen.getByText('Comment'));
      await waitFor(() => {
        expect(storage.create).toHaveBeenCalledWith(
          expect.objectContaining({ note: 'Needs polish' })
        );
      });
    } finally {
      target.remove();
    }
  });
});
