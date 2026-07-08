/**
 * Toolbar — top bar with Undo / Redo / Export / Clear actions.
 */

import { type Component, createSignal } from 'solid-js';
import { Flex, Stack, Button, Text, Dialog } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';
import { treeToTsx } from '../codegen';
import type { EditorStore } from '../store';

export interface ToolbarProps {
  store: EditorStore;
}

export const Toolbar: Component<ToolbarProps> = (props) => {
  const [exportOpen, setExportOpen] = createSignal(false);
  const [exportCode, setExportCode] = createSignal('');

  const handleExport = (): void => {
    const result = Effect.runSync(treeToTsx(props.store.state.tree));
    setExportCode(result);
    setExportOpen(true);
  };

  const canUndo = (): boolean => props.store.state.past.length > 0;
  const canRedo = (): boolean => props.store.state.future.length > 0;

  return (
    <>
      <Flex
        align="center"
        gap="sm"
        style={{
          padding: 'var(--sk-space-xs) var(--sk-space-sm)',
          background: 'var(--sk-bg-secondary)',
          'border-bottom': '1px solid var(--sk-border)',
          height: 'var(--sk-height-lg)',
          'flex-shrink': '0',
        }}
      >
        <Text size="sm" weight="semibold">
          HyperKit Editor
        </Text>

        <Flex gap="xs" align="center" style={{ 'margin-left': 'auto' }}>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo()}
            onClick={() => props.store.undo()}
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo()}
            onClick={() => props.store.redo()}
          >
            Redo
          </Button>
          <Button variant="ghost" size="sm" onClick={() => props.store.clear()}>
            Clear
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            Export
          </Button>
        </Flex>
      </Flex>

      <Dialog
        open={exportOpen()}
        onOpenChange={setExportOpen}
        title="Export TSX"
        description="Copy this code into your SolidJS project."
      >
        <Stack gap="sm">
          <pre
            style={{
              background: 'var(--sk-bg-tertiary)',
              padding: 'var(--sk-space-sm)',
              'border-radius': 'var(--sk-radius-md)',
              'font-family': 'var(--sk-font-code, monospace)',
              'font-size': 'var(--sk-font-size-sm)',
              'white-space': 'pre-wrap',
              'word-break': 'break-all',
              overflow: 'auto',
              'max-height': '60vh',
              color: 'var(--sk-text-primary)',
            }}
          >
            {exportCode()}
          </pre>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(exportCode());
            }}
          >
            Copy to clipboard
          </Button>
        </Stack>
      </Dialog>
    </>
  );
};
