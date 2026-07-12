/**
 * File Manager demo — a desktop-grade two-pane file browser.
 *
 * Places sidebar → FileExplorer (list/icons/gallery views, sort/filter
 * toolbar, PathBreadcrumb, FilePreview pane, status bar) with a working
 * right-click FileContextMenu, rename dialog, and toast notifications.
 */
import { For, Show, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import {
  Button,
  Dialog,
  FileContextMenu,
  FileExplorer,
  Flex,
  Input,
  Sidebar,
  Text,
  ToastProvider,
  useBreakpoint,
  useFileNavigation,
  useToast,
  type FileItem,
} from '@ybouhjira/hyperkit';
import { HOME, PLACES, parentOf, seedFilesystem } from './filesystem';
import './files.css';

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  item: FileItem | null;
}

export function FilesApp() {
  return (
    <ToastProvider position="bottom-right">
      <FilesWorkbench />
    </ToastProvider>
  );
}

function FilesWorkbench() {
  const toast = useToast();
  const breakpoint = useBreakpoint();
  const nav = useFileNavigation(HOME);
  const [fs, setFs] = createStore<Record<string, FileItem[]>>(seedFilesystem());
  const [selectedPaths, setSelectedPaths] = createSignal<Set<string>>(new Set());
  const [menu, setMenu] = createSignal<ContextMenuState>({ open: false, x: 0, y: 0, item: null });
  const [renaming, setRenaming] = createSignal<FileItem | null>(null);
  const [renameValue, setRenameValue] = createSignal('');

  const items = () => fs[nav.current()] ?? [];

  const navigateTo = (path: string) => {
    if (path === nav.current()) return;
    nav.navigateTo(path);
    setSelectedPaths(new Set<string>());
  };

  const goUp = () => {
    if (nav.current() !== '/') navigateTo(parentOf(nav.current()));
  };

  /**
   * FileExplorer views expose no context-menu callback, so the app delegates:
   * every row/tile carries data-testid="entry-<name>", which maps back to the
   * FileItem in the current directory.
   */
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest('[data-testid^="entry-"]');
    if (!el || !target.closest('[data-testid="file-list"]')) return;
    e.preventDefault();
    const name = el.getAttribute('data-testid')!.slice('entry-'.length);
    const item = items().find((i) => i.name === name);
    if (!item) return;
    setSelectedPaths(new Set([item.path]));
    setMenu({ open: true, x: e.clientX, y: e.clientY, item });
  };

  const openItem = (item: FileItem) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      setSelectedPaths(new Set([item.path]));
      toast.info(`Opening ${item.name} with the default application.`, 'Open');
    }
  };

  const copyPath = (item: FileItem) => {
    void navigator.clipboard?.writeText(item.path).catch(() => undefined);
    toast.success(`${item.path} copied to clipboard.`, 'Copied');
  };

  const deleteItem = (item: FileItem) => {
    setFs(
      produce((tree) => {
        const parent = parentOf(item.path);
        const siblings = tree[parent];
        if (siblings) tree[parent] = siblings.filter((i) => i.path !== item.path);
        if (item.isDirectory) {
          for (const key of Object.keys(tree)) {
            if (key === item.path || key.startsWith(`${item.path}/`)) delete tree[key];
          }
        }
      })
    );
    setSelectedPaths(new Set<string>());
    // Deleting the folder we're standing in (or an ancestor) — climb out.
    if (nav.current() === item.path || nav.current().startsWith(`${item.path}/`)) {
      nav.navigateTo(parentOf(item.path));
    }
    toast.warning(`${item.name} moved to trash.`, 'Deleted');
  };

  const startRename = (item: FileItem) => {
    setRenameValue(item.name);
    setRenaming(item);
  };

  const commitRename = () => {
    const item = renaming();
    const newName = renameValue().trim();
    setRenaming(null);
    if (!item || !newName || newName === item.name) return;
    const parent = parentOf(item.path);
    const newPath = `${parent === '/' ? '' : parent}/${newName}`;
    setFs(
      produce((tree) => {
        const siblings = tree[parent];
        const target = siblings?.find((i) => i.path === item.path);
        if (!target) return;
        target.name = newName;
        target.path = newPath;
        if (item.isDirectory) {
          for (const key of Object.keys(tree)) {
            if (key === item.path || key.startsWith(`${item.path}/`)) {
              const moved = tree[key]!.map((child) => ({
                ...child,
                path: newPath + child.path.slice(item.path.length),
              }));
              delete tree[key];
              tree[newPath + key.slice(item.path.length)] = moved;
            }
          }
        }
      })
    );
    // Renaming the folder we're standing in (or an ancestor) — follow it.
    if (nav.current() === item.path || nav.current().startsWith(`${item.path}/`)) {
      nav.navigateTo(newPath + nav.current().slice(item.path.length));
    }
    setSelectedPaths(new Set([newPath]));
    toast.success(`Renamed to ${newName}.`, 'Renamed');
  };

  const createFolder = (name: string) => {
    const path = `${nav.current() === '/' ? '' : nav.current()}/${name}`;
    setFs(
      produce((tree) => {
        tree[nav.current()] = [
          ...(tree[nav.current()] ?? []),
          { name, path, isDirectory: true, mtime: new Date() },
        ];
        tree[path] = [];
      })
    );
    toast.success(`Folder “${name}” created.`, 'New folder');
  };

  // Sidebar slot element, evaluated ONCE at setup. Inline JSX in a prop
  // compiles to a getter that builds a fresh component per access; Sidebar
  // reads its header slot more than once, and the extra instances
  // desynchronize hydration keys ("template is not a function" on load).
  const placesHeader = (
    <Text size="sm" weight="semibold">
      Places
    </Text>
  );

  return (
    <div class="files">
      {/* ── Places sidebar ──────────────────────────────────────────── */}
      <Sidebar
        open={breakpoint() !== 'phone'}
        width="200px"
        class="files__places"
        header={placesHeader}
      >
        <Flex direction="column" gap="xs">
          <For each={PLACES}>
            {(place) => (
              <Button
                variant={nav.current() === place.path ? 'secondary' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => navigateTo(place.path)}
                data-testid={`place-${place.label}`}
              >
                <span class="files__place-row">
                  <span class="files__place-icon" aria-hidden="true">
                    {place.icon}
                  </span>
                  {place.label}
                </span>
              </Button>
            )}
          </For>
        </Flex>
      </Sidebar>

      {/* ── Main column ─────────────────────────────────────────────── */}
      <div class="files__main">
        <div class="files__header">
          <Text weight="semibold">Files</Text>
          <Flex gap="xs">
            <Button
              variant="ghost"
              size="sm"
              disabled={!nav.canGoBack()}
              onClick={() => nav.back()}
              aria-label="Back"
              data-testid="history-back"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!nav.canGoForward()}
              onClick={() => nav.forward()}
              aria-label="Forward"
              data-testid="history-forward"
            >
              →
            </Button>
          </Flex>
          <span class="files__header-spacer" />
          <Text size="sm" color="muted">
            {selectedPaths().size > 0
              ? `${selectedPaths().size} selected`
              : `${items().length} items`}
          </Text>
        </div>

        <div class="files__explorer" onContextMenu={handleContextMenu}>
          <FileExplorer
            items={items()}
            currentPath={nav.current()}
            onNavigate={navigateTo}
            onBack={goUp}
            onRefresh={() => toast.info('Directory contents are up to date.', 'Refreshed')}
            onCreateFolder={createFolder}
            selectedPaths={selectedPaths()}
            onSelectionChange={setSelectedPaths}
            previewPane={breakpoint() !== 'phone'}
          />
        </div>
      </div>

      {/* ── Right-click context menu ────────────────────────────────── */}
      <Show when={menu().item}>
        {(item) => (
          <FileContextMenu
            item={item()}
            x={menu().x}
            y={menu().y}
            open={menu().open}
            onClose={() => setMenu((m) => ({ ...m, open: false }))}
            onOpen={openItem}
            onRename={startRename}
            onDelete={deleteItem}
            onCopyPath={copyPath}
          />
        )}
      </Show>

      {/* ── Rename dialog ───────────────────────────────────────────── */}
      <Dialog
        open={renaming() !== null}
        onOpenChange={(open) => {
          if (!open) setRenaming(null);
        }}
        title="Rename"
        description={renaming() ? `Choose a new name for ${renaming()!.name}` : ''}
      >
        <Flex direction="column" gap="md">
          <Input
            value={renameValue()}
            onInput={setRenameValue}
            placeholder="New name"
            id="files-rename-input"
          />
          <Flex gap="sm" justify="end">
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={commitRename} data-testid="rename-confirm">
              Rename
            </Button>
          </Flex>
        </Flex>
      </Dialog>
    </div>
  );
}
