import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { KeyboardProvider } from './KeyboardProvider';
import { useShortcut, useShortcuts } from './useShortcut';
import { useKeyboard } from './useKeyboard';
import { KeyboardScope } from './KeyboardScope';
import { ShortcutsHelp } from './ShortcutsHelp';
import { formatShortcut } from './formatShortcut';

const meta: Meta<typeof KeyboardProvider> = {
  title: 'Hooks/Keyboard',
  component: KeyboardProvider,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof KeyboardProvider>;

// Story 1: Global Shortcuts
const GlobalShortcutsDemo = () => {
  const [log, setLog] = createSignal<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  useShortcut({
    key: 'k',
    mod: true,
    handler: () => addLog('Cmd/Ctrl+K pressed!'),
    description: 'Open command palette',
    category: 'Navigation',
  });

  useShortcut({
    key: 't',
    ctrl: true,
    shift: true,
    handler: () => addLog('Ctrl+Shift+T pressed!'),
    description: 'Toggle theme auditor',
    category: 'Developer',
  });

  useShortcut({
    key: '/',
    mod: true,
    handler: () => addLog('Cmd/Ctrl+/ pressed!'),
    description: 'Toggle help',
    category: 'General',
  });

  return (
    <div style={{ padding: '20px', 'font-family': 'var(--sk-font-ui, system-ui)' }}>
      <h3 style={{ margin: '0 0 12px' }}>Global Shortcuts</h3>
      <p style={{ color: 'var(--sk-text-muted, #888)', 'font-size': '14px', margin: '0 0 16px' }}>
        Try pressing: <kbd>{formatShortcut({ key: 'k', mod: true })}</kbd>,{' '}
        <kbd>{formatShortcut({ key: 't', ctrl: true, shift: true })}</kbd>,{' '}
        <kbd>{formatShortcut({ key: '/', mod: true })}</kbd>
      </p>
      <div
        style={{
          background: 'var(--sk-surface-sunken-bg, #111)',
          'border-radius': 'var(--sk-radius-md, 6px)',
          padding: '12px',
          'min-height': '200px',
          'font-family': 'var(--sk-font-mono, monospace)',
          'font-size': '13px',
        }}
      >
        {log().length === 0 ? (
          <span style={{ color: 'var(--sk-text-muted, #666)' }}>Waiting for key presses...</span>
        ) : (
          log().map((entry) => <div style={{ padding: '2px 0' }}>{entry}</div>)
        )}
      </div>
    </div>
  );
};

export const GlobalShortcuts: Story = {
  render: () => (
    <KeyboardProvider>
      <GlobalShortcutsDemo />
    </KeyboardProvider>
  ),
};

// Story 2: Exclusive Scope
const ExclusiveScopeDemo = () => {
  const [modalOpen, setModalOpen] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  useShortcut({
    key: 'g',
    handler: () => addLog('Global "G" shortcut fired'),
    description: 'Global shortcut',
    scope: 'global',
  });

  useShortcut({
    key: 'b',
    handler: () => addLog('Background "B" shortcut fired'),
    description: 'Background shortcut',
    scope: 'background',
  });

  return (
    <div style={{ padding: '20px', 'font-family': 'var(--sk-font-ui, system-ui)' }}>
      <h3 style={{ margin: '0 0 12px' }}>Exclusive Scope Demo</h3>
      <p style={{ 'font-size': '14px', margin: '0 0 16px', color: 'var(--sk-text-muted, #888)' }}>
        Press G (global) and B (background). Open the modal to see B blocked by exclusive scope.
      </p>
      <button onClick={() => setModalOpen(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Open Modal
      </button>

      {modalOpen() && (
        <KeyboardScope name="modal" exclusive>
          <ModalContent
            onClose={() => {
              addLog('Modal closed via Escape');
              setModalOpen(false);
            }}
            onConfirm={() => {
              addLog('Modal confirmed via Enter');
              setModalOpen(false);
            }}
          />
        </KeyboardScope>
      )}

      <div
        style={{
          'margin-top': '16px',
          background: 'var(--sk-surface-sunken-bg, #111)',
          padding: '12px',
          'border-radius': 'var(--sk-radius-md, 6px)',
          'font-family': 'var(--sk-font-mono, monospace)',
          'font-size': '13px',
          'min-height': '100px',
        }}
      >
        {log().length === 0 ? (
          <span style={{ color: 'var(--sk-text-muted, #666)' }}>Event log...</span>
        ) : (
          log().map((entry) => <div style={{ padding: '2px 0' }}>{entry}</div>)
        )}
      </div>
    </div>
  );
};

const ModalContent = (props: { onClose: () => void; onConfirm: () => void }) => {
  useShortcuts([
    {
      key: 'Escape',
      handler: props.onClose,
      description: 'Close modal',
      scope: 'modal',
      category: 'Modal',
      excludeInputs: false,
    },
    {
      key: 'Enter',
      handler: props.onConfirm,
      description: 'Confirm',
      scope: 'modal',
      category: 'Modal',
      excludeInputs: false,
    },
  ]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: 'rgba(0,0,0,0.5)',
        'z-index': '1000',
      }}
    >
      <div
        style={{
          background: 'var(--sk-surface-raised-bg, #222)',
          padding: '24px',
          'border-radius': 'var(--sk-radius-lg, 8px)',
          'min-width': '300px',
          'text-align': 'center',
        }}
      >
        <h3 style={{ margin: '0 0 8px' }}>Modal (Exclusive Scope)</h3>
        <p style={{ 'font-size': '14px', color: 'var(--sk-text-muted, #888)' }}>
          Press Enter to confirm or Escape to close.
          <br />
          Background shortcuts are blocked.
        </p>
        <div
          style={{ 'margin-top': '16px', display: 'flex', gap: '8px', 'justify-content': 'center' }}
        >
          <button onClick={props.onClose} style={{ padding: '6px 12px' }}>
            Cancel
          </button>
          <button onClick={props.onConfirm} style={{ padding: '6px 12px' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExclusiveScope: Story = {
  render: () => (
    <KeyboardProvider>
      <ExclusiveScopeDemo />
    </KeyboardProvider>
  ),
};

// Story 3: Shortcuts Help Modal
const ShortcutsHelpDemo = () => {
  const [helpOpen, setHelpOpen] = createSignal(false);

  useShortcut({
    key: 'k',
    mod: true,
    handler: () => {},
    description: 'Open command palette',
    category: 'Navigation',
  });

  useShortcut({
    key: '/',
    mod: true,
    handler: () => setHelpOpen(true),
    description: 'Show keyboard shortcuts',
    category: 'General',
  });

  useShortcut({
    key: 'n',
    mod: true,
    handler: () => {},
    description: 'New conversation',
    category: 'Navigation',
  });

  useShortcut({
    key: 't',
    ctrl: true,
    shift: true,
    handler: () => {},
    description: 'Toggle theme auditor',
    category: 'Developer',
  });

  useShortcut({
    key: 'Enter',
    handler: () => {},
    description: 'Send message',
    category: 'Chat',
    excludeInputs: false,
  });

  useShortcut({
    key: 'Escape',
    handler: () => {},
    description: 'Cancel action',
    category: 'General',
  });

  return (
    <div style={{ padding: '20px', 'font-family': 'var(--sk-font-ui, system-ui)' }}>
      <h3 style={{ margin: '0 0 12px' }}>Shortcuts Help Modal</h3>
      <p style={{ 'font-size': '14px', margin: '0 0 16px', color: 'var(--sk-text-muted, #888)' }}>
        Press <kbd>{formatShortcut({ key: '/', mod: true })}</kbd> or click the button to open.
      </p>
      <button onClick={() => setHelpOpen(true)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Show Shortcuts
      </button>
      <ShortcutsHelp isOpen={helpOpen()} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export const ShortcutsHelpModal: Story = {
  render: () => (
    <KeyboardProvider>
      <ShortcutsHelpDemo />
    </KeyboardProvider>
  ),
};

// Story 4: Conflict Detection
const ConflictDetectionDemo = () => {
  const [registered, setRegistered] = createSignal(false);

  useShortcut({
    key: 'd',
    ctrl: true,
    handler: () => {},
    description: 'First shortcut (Ctrl+D)',
    category: 'Demo',
  });

  return (
    <div style={{ padding: '20px', 'font-family': 'var(--sk-font-ui, system-ui)' }}>
      <h3 style={{ margin: '0 0 12px' }}>Conflict Detection</h3>
      <p style={{ 'font-size': '14px', margin: '0 0 16px', color: 'var(--sk-text-muted, #888)' }}>
        A Ctrl+D shortcut is already registered. Click below to register a duplicate. Check the
        browser console for the conflict warning.
      </p>
      <button
        onClick={() => setRegistered(true)}
        disabled={registered()}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        {registered() ? 'Conflict registered - check console' : 'Register duplicate Ctrl+D'}
      </button>
      {registered() && <DuplicateShortcut />}
    </div>
  );
};

const DuplicateShortcut = () => {
  useShortcut({
    key: 'd',
    ctrl: true,
    handler: () => {},
    description: 'Duplicate shortcut (Ctrl+D)',
    category: 'Demo',
  });
  return null;
};

export const ConflictDetection: Story = {
  render: () => (
    <KeyboardProvider>
      <ConflictDetectionDemo />
    </KeyboardProvider>
  ),
};

// Story 5: Interactive - Dynamic register/unregister
const InteractiveDemo = () => {
  const { shortcuts } = useKeyboard();
  const [helpOpen, setHelpOpen] = createSignal(false);
  const [features, setFeatures] = createSignal<string[]>([]);
  const [log, setLog] = createSignal<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  const toggleFeature = (name: string) => {
    setFeatures((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]));
  };

  return (
    <div style={{ padding: '20px', 'font-family': 'var(--sk-font-ui, system-ui)' }}>
      <h3 style={{ margin: '0 0 12px' }}>Interactive Demo</h3>
      <p style={{ 'font-size': '14px', margin: '0 0 16px', color: 'var(--sk-text-muted, #888)' }}>
        Toggle features to dynamically register/unregister shortcuts. Active shortcuts:{' '}
        {shortcuts().length}
      </p>
      <div style={{ display: 'flex', gap: '8px', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        <button onClick={() => toggleFeature('search')} style={{ padding: '6px 12px' }}>
          {features().includes('search') ? 'Disable' : 'Enable'} Search (Cmd+F)
        </button>
        <button onClick={() => toggleFeature('save')} style={{ padding: '6px 12px' }}>
          {features().includes('save') ? 'Disable' : 'Enable'} Save (Cmd+S)
        </button>
        <button onClick={() => toggleFeature('undo')} style={{ padding: '6px 12px' }}>
          {features().includes('undo') ? 'Disable' : 'Enable'} Undo (Cmd+Z)
        </button>
        <button onClick={() => setHelpOpen(true)} style={{ padding: '6px 12px' }}>
          Show Help
        </button>
      </div>

      {features().includes('search') && (
        <FeatureShortcut
          keyConfig={{ key: 'f', mod: true }}
          desc="Search"
          cat="Edit"
          onFire={() => addLog('Search triggered')}
        />
      )}
      {features().includes('save') && (
        <FeatureShortcut
          keyConfig={{ key: 's', mod: true }}
          desc="Save"
          cat="Edit"
          onFire={() => addLog('Save triggered')}
        />
      )}
      {features().includes('undo') && (
        <FeatureShortcut
          keyConfig={{ key: 'z', mod: true }}
          desc="Undo"
          cat="Edit"
          onFire={() => addLog('Undo triggered')}
        />
      )}

      <div
        style={{
          background: 'var(--sk-surface-sunken-bg, #111)',
          padding: '12px',
          'border-radius': 'var(--sk-radius-md, 6px)',
          'font-family': 'var(--sk-font-mono, monospace)',
          'font-size': '13px',
          'min-height': '100px',
        }}
      >
        {log().length === 0 ? (
          <span style={{ color: 'var(--sk-text-muted, #666)' }}>Event log...</span>
        ) : (
          log().map((entry) => <div style={{ padding: '2px 0' }}>{entry}</div>)
        )}
      </div>

      <ShortcutsHelp isOpen={helpOpen()} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

const FeatureShortcut = (props: {
  keyConfig: { key: string; mod?: boolean };
  desc: string;
  cat: string;
  onFire: () => void;
}) => {
  useShortcut({
    key: props.keyConfig.key,
    mod: props.keyConfig.mod,
    handler: props.onFire,
    description: props.desc,
    category: props.cat,
  });
  return null;
};

export const Interactive: Story = {
  render: () => (
    <KeyboardProvider>
      <InteractiveDemo />
    </KeyboardProvider>
  ),
};
