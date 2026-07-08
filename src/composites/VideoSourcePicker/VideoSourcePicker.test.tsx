import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@solidjs/testing-library';
import { VideoSourcePicker, formatSize, relativeTime } from './VideoSourcePicker';
import {
  libraryVideoProvider,
  urlVideoProvider,
  localVideoProvider,
  comingSoonVideoProvider,
} from './providers';
import type { VideoLibraryItem, VideoSourceAdapter, VideoSource } from './types';

function item(over: Partial<VideoLibraryItem> = {}): VideoLibraryItem {
  return { id: 'i1', url: 'u1', title: 'Vid 1', sizeBytes: 2_000_000, addedAt: 1000, ...over };
}

function makeAdapter(over: Partial<VideoSourceAdapter> = {}): VideoSourceAdapter {
  return {
    list: vi.fn(async () => [] as VideoLibraryItem[]),
    download: vi.fn(async (url: string) => ({
      id: 'd1',
      url,
      title: 'downloaded',
      sizeBytes: 1000,
      addedAt: 0,
    })),
    fileUrl: (id: string) => `/file/${id}`,
    ...over,
  };
}

describe('format helpers', () => {
  it('formatSize covers B / KB / MB / GB', () => {
    expect(formatSize(500)).toBe('500 B');
    expect(formatSize(2048)).toBe('2 KB');
    expect(formatSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatSize(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
  });

  it('relativeTime buckets + clamps negatives', () => {
    expect(relativeTime(1000, 1000)).toBe('just now');
    expect(relativeTime(0, 120_000)).toBe('2m ago');
    expect(relativeTime(0, 2 * 3_600_000)).toBe('2h ago');
    expect(relativeTime(0, 2 * 86_400_000)).toBe('2d ago');
    expect(relativeTime(5000, 0)).toBe('just now'); // negative → clamp
  });
});

describe('VideoSourcePicker shell', () => {
  it('shows a fallback when no providers are configured', () => {
    const { getByText } = render(() => <VideoSourcePicker providers={[]} onSelect={vi.fn()} />);
    expect(getByText('No video sources')).toBeInTheDocument();
  });

  it('honours the class prop', () => {
    const { container } = render(() => (
      <VideoSourcePicker
        providers={[comingSoonVideoProvider({ id: 'd', label: 'Drive' })]}
        onSelect={vi.fn()}
        class="mine"
      />
    ));
    expect(container.querySelector('.sk-vsp.mine')).not.toBeNull();
  });

  it('renders a tab icon when a provider supplies an iconPath', () => {
    const { container } = render(() => (
      <VideoSourcePicker
        providers={[comingSoonVideoProvider({ id: 'd', label: 'Drive', iconPath: 'M1 2 3 4' })]}
        onSelect={vi.fn()}
      />
    ));
    const icon = container.querySelector('.sk-vsp__tab-icon path');
    expect(icon?.getAttribute('d')).toBe('M1 2 3 4');
  });

  it('renders one tab per provider and switches between them', () => {
    const { getByText, getByLabelText } = render(() => (
      <VideoSourcePicker
        providers={[
          localVideoProvider(),
          comingSoonVideoProvider({ id: 'drive', label: 'Google Drive' }),
        ]}
        onSelect={vi.fn()}
      />
    ));
    // local is active first
    expect(getByLabelText('Choose a local video')).toBeInTheDocument();
    fireEvent.click(getByText('Google Drive'));
    expect(getByText('Google Drive — coming soon')).toBeInTheDocument();
  });
});

describe('comingSoonVideoProvider', () => {
  it('renders a placeholder with the default message', () => {
    const { getByText } = render(() => (
      <VideoSourcePicker
        providers={[comingSoonVideoProvider({ id: 'photos', label: 'Google Photos' })]}
        onSelect={vi.fn()}
      />
    ));
    expect(getByText('Google Photos support is coming soon.')).toBeInTheDocument();
  });

  it('falls back to a default placeholder for a bare provider (no render, no comingSoon)', () => {
    const { getByText } = render(() => (
      <VideoSourcePicker providers={[{ id: 'raw', label: 'Raw' }]} onSelect={vi.fn()} />
    ));
    expect(getByText('Raw support is coming soon.')).toBeInTheDocument();
  });

  it('honours a custom message + iconPath', () => {
    const p = comingSoonVideoProvider({
      id: 'fs',
      label: 'Filesystem',
      iconPath: 'M0',
      message: 'Soon™',
    });
    expect(p.iconPath).toBe('M0');
    const { getByText } = render(() => <VideoSourcePicker providers={[p]} onSelect={vi.fn()} />);
    expect(getByText('Soon™')).toBeInTheDocument();
  });
});

describe('libraryVideoProvider', () => {
  it('loads on mount; selecting an item returns it', async () => {
    const onSelect = vi.fn<(s: VideoSource) => void>();
    const adapter = makeAdapter({ list: vi.fn(async () => [item({ id: 'a', title: 'Alpha' })]) });
    const { getByLabelText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={onSelect} />
    ));
    await waitFor(() => expect(getByLabelText('Use Alpha')).toBeInTheDocument());
    fireEvent.click(getByLabelText('Use Alpha'));
    expect(onSelect).toHaveBeenCalledWith({
      type: 'library',
      item: expect.objectContaining({ id: 'a' }),
      url: '/file/a',
    });
  });

  it('shows the empty state when the library is empty', async () => {
    const { getByText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(makeAdapter())]} onSelect={vi.fn()} />
    ));
    await waitFor(() => expect(getByText('No videos yet')).toBeInTheDocument());
  });

  it('surfaces a load error + onError', async () => {
    const onError = vi.fn();
    const adapter = makeAdapter({
      list: vi.fn(async () => {
        throw new Error('list boom');
      }),
    });
    const { getByRole } = render(() => (
      <VideoSourcePicker
        providers={[libraryVideoProvider(adapter)]}
        onSelect={vi.fn()}
        onError={onError}
      />
    ));
    await waitFor(() => expect(getByRole('alert').textContent).toContain('list boom'));
    expect(onError).toHaveBeenCalled();
  });

  it('wraps a non-Error rejection', async () => {
    const adapter = makeAdapter({ list: vi.fn(() => Promise.reject('plain')) });
    const { getByRole } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    await waitFor(() => expect(getByRole('alert').textContent).toContain('plain'));
  });

  it('shows a spinner while loading', async () => {
    let resolve!: (v: VideoLibraryItem[]) => void;
    const adapter = makeAdapter({
      list: vi.fn(() => new Promise<VideoLibraryItem[]>((r) => (resolve = r))),
    });
    const { getByLabelText, queryByLabelText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    expect(getByLabelText('Loading library')).toBeInTheDocument();
    resolve([]);
    await waitFor(() => expect(queryByLabelText('Loading library')).toBeNull());
  });

  it('renders a cached badge for cached items', async () => {
    const adapter = makeAdapter({ list: vi.fn(async () => [item({ cached: true })]) });
    const { getByText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    await waitFor(() => expect(getByText('cached')).toBeInTheDocument());
  });

  it('removes an item without selecting it, then reloads', async () => {
    const onSelect = vi.fn();
    const remove = vi.fn(async () => {});
    const list = vi.fn(async () => [item({ id: 'a', title: 'Alpha' })]);
    const adapter = makeAdapter({ list, remove });
    const { getByLabelText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={onSelect} />
    ));
    await waitFor(() => expect(getByLabelText('Remove Alpha')).toBeInTheDocument());
    const before = list.mock.calls.length;
    fireEvent.click(getByLabelText('Remove Alpha'));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('a'));
    await waitFor(() => expect(list.mock.calls.length).toBeGreaterThan(before)); // reloaded
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('surfaces a remove error', async () => {
    const adapter = makeAdapter({
      list: vi.fn(async () => [item({ id: 'a', title: 'Alpha' })]),
      remove: vi.fn(async () => {
        throw new Error('rm boom');
      }),
    });
    const { getByLabelText, getByRole } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    await waitFor(() => expect(getByLabelText('Remove Alpha')).toBeInTheDocument());
    fireEvent.click(getByLabelText('Remove Alpha'));
    await waitFor(() => expect(getByRole('alert').textContent).toContain('rm boom'));
  });

  it('hides the remove affordance when the adapter has no remove', async () => {
    const adapter = makeAdapter({ list: vi.fn(async () => [item({ title: 'Alpha' })]) });
    const { getByLabelText, queryByLabelText } = render(() => (
      <VideoSourcePicker providers={[libraryVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    await waitFor(() => expect(getByLabelText('Use Alpha')).toBeInTheDocument());
    expect(queryByLabelText('Remove Alpha')).toBeNull();
  });

  it('clears a prior error when a later pick succeeds', async () => {
    // First load fails (error banner), reload succeeds via remove path is overkill;
    // instead: library errors, then user selects from a second (local) provider.
    const adapter = makeAdapter({ list: vi.fn(() => Promise.reject('boom')) });
    const onSelect = vi.fn();
    const { getByRole, getByText, getByLabelText, queryByRole } = render(() => (
      <VideoSourcePicker
        providers={[libraryVideoProvider(adapter), localVideoProvider()]}
        onSelect={onSelect}
      />
    ));
    await waitFor(() => expect(getByRole('alert')).toBeInTheDocument());
    fireEvent.click(getByText('Local file'));
    const input = getByLabelText('Choose a local video') as HTMLInputElement;
    const file = new File(['x'], 'c.mp4', { type: 'video/mp4' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(onSelect).toHaveBeenCalledWith({ type: 'local', file });
    expect(queryByRole('alert')).toBeNull(); // error cleared on select
  });
});

describe('urlVideoProvider', () => {
  it('downloads a pasted URL, selects it, and clears the field', async () => {
    const onSelect = vi.fn();
    const adapter = makeAdapter();
    const { getByText, getByLabelText } = render(() => (
      <VideoSourcePicker providers={[urlVideoProvider(adapter)]} onSelect={onSelect} />
    ));
    const input = getByLabelText('Video URL') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'https://x/v.mp4' } });
    fireEvent.click(getByText('Download'));
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library', url: '/file/d1' })
      )
    );
    expect(adapter.download).toHaveBeenCalledWith('https://x/v.mp4');
    expect(input.value).toBe('');
  });

  it('disables Download for a blank URL', () => {
    const { getByText } = render(() => (
      <VideoSourcePicker providers={[urlVideoProvider(makeAdapter())]} onSelect={vi.fn()} />
    ));
    expect((getByText('Download') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows a Downloading… state while in flight', async () => {
    let resolve!: (v: VideoLibraryItem) => void;
    const adapter = makeAdapter({
      download: vi.fn(() => new Promise<VideoLibraryItem>((r) => (resolve = r))),
    });
    const { getByText, getByLabelText, queryByText } = render(() => (
      <VideoSourcePicker providers={[urlVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    fireEvent.input(getByLabelText('Video URL'), { target: { value: 'u' } });
    fireEvent.click(getByText('Download'));
    await waitFor(() => expect(getByText('Downloading…')).toBeInTheDocument());
    resolve(item());
    await waitFor(() => expect(queryByText('Downloading…')).toBeNull());
  });

  it('surfaces a download error', async () => {
    const adapter = makeAdapter({
      download: vi.fn(async () => {
        throw new Error('dl boom');
      }),
    });
    const { getByText, getByLabelText, getByRole } = render(() => (
      <VideoSourcePicker providers={[urlVideoProvider(adapter)]} onSelect={vi.fn()} />
    ));
    fireEvent.input(getByLabelText('Video URL'), { target: { value: 'u' } });
    fireEvent.click(getByText('Download'));
    await waitFor(() => expect(getByRole('alert').textContent).toContain('dl boom'));
  });
});

describe('localVideoProvider', () => {
  it('returns a chosen local file', () => {
    const onSelect = vi.fn();
    const { getByLabelText } = render(() => (
      <VideoSourcePicker providers={[localVideoProvider()]} onSelect={onSelect} />
    ));
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const input = getByLabelText('Choose a local video') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(onSelect).toHaveBeenCalledWith({ type: 'local', file });
  });

  it('ignores a change with no file', () => {
    const onSelect = vi.fn();
    const { getByLabelText } = render(() => (
      <VideoSourcePicker providers={[localVideoProvider()]} onSelect={onSelect} />
    ));
    const input = getByLabelText('Choose a local video') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: null, configurable: true });
    fireEvent.change(input);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('honours a custom accept filter', () => {
    const { getByLabelText } = render(() => (
      <VideoSourcePicker
        providers={[localVideoProvider({ accept: 'video/mp4' })]}
        onSelect={vi.fn()}
      />
    ));
    expect((getByLabelText('Choose a local video') as HTMLInputElement).accept).toBe('video/mp4');
  });
});

describe('provider factory options', () => {
  it('override id / label / iconPath', () => {
    const lib = libraryVideoProvider(makeAdapter(), {
      id: 'lib2',
      label: 'My Lib',
      iconPath: 'M1',
    });
    expect(lib).toMatchObject({ id: 'lib2', label: 'My Lib', iconPath: 'M1' });
    const url = urlVideoProvider(makeAdapter(), { id: 'u2', label: 'Link', iconPath: 'M2' });
    expect(url).toMatchObject({ id: 'u2', label: 'Link', iconPath: 'M2' });
    const local = localVideoProvider({ id: 'l2', label: 'Upload', iconPath: 'M3' });
    expect(local).toMatchObject({ id: 'l2', label: 'Upload', iconPath: 'M3' });
  });

  it('default ids/labels when no opts given', () => {
    expect(libraryVideoProvider(makeAdapter())).toMatchObject({ id: 'library', label: 'Library' });
    expect(urlVideoProvider(makeAdapter())).toMatchObject({ id: 'url', label: 'Paste URL' });
    expect(localVideoProvider()).toMatchObject({ id: 'local', label: 'Local file' });
    expect(libraryVideoProvider(makeAdapter()).iconPath).toBeUndefined();
  });
});
