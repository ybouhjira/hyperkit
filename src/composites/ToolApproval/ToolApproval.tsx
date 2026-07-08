import './ToolApproval.css';
import { createSignal, Component } from 'solid-js';
import { useShortcuts, KeyboardScope } from '../../keyboard';

export interface ToolApprovalItem {
  id: string;
  tool: string;
  input: Record<string, unknown>;
}

export interface ToolApprovalProps {
  tool: string;
  input: Record<string, unknown>;
  onApprove: (alwaysAllow: boolean) => void;
  onDeny: () => void;
  class?: string;
}

let checkboxIdCounter = 0;

export const ToolApproval: Component<ToolApprovalProps> = (props) => {
  const [alwaysAllow, setAlwaysAllow] = createSignal(false);
  const checkboxId = `tool-approval-checkbox-${++checkboxIdCounter}`;

  useShortcuts([
    {
      key: 'Enter',
      handler: () => props.onApprove(alwaysAllow()),
      description: 'Approve tool',
      scope: 'tool-approval',
      category: 'Tool Approval',
      excludeInputs: false,
    },
    {
      key: 'Escape',
      handler: () => props.onDeny(),
      description: 'Deny tool',
      scope: 'tool-approval',
      category: 'Tool Approval',
      excludeInputs: false,
    },
  ]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onDeny();
    }
  };

  const formatInput = () => {
    try {
      return JSON.stringify(props.input, null, 2);
    } catch {
      return '[Unable to format input]';
    }
  };

  const getToolDescription = () => {
    const descriptions: Record<string, string> = {
      Read: 'Read file contents from the filesystem',
      Write: 'Write or modify file contents',
      Edit: 'Edit specific parts of a file',
      Bash: 'Execute a shell command',
      Glob: 'Search for files by pattern',
      Grep: 'Search file contents',
      WebFetch: 'Fetch content from a URL',
      WebSearch: 'Search the web',
    };
    return descriptions[props.tool] || 'Execute a tool operation';
  };

  return (
    <KeyboardScope name="tool-approval" exclusive>
      <div
        class={`sk-tool-approval ${props.class || ''}`}
        onClick={handleBackdropClick}
        data-testid="tool-approval"
      >
        <div class="sk-tool-approval__dialog">
          <div class="sk-tool-approval__header">
            <div class="sk-tool-approval__header-left">
              <div class="sk-tool-approval__icon-wrap">
                <svg
                  class="sk-tool-approval__icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="sk-tool-approval__title">Tool Approval Required</h2>
                <p class="sk-tool-approval__subtitle">
                  Claude wants to use: <span class="sk-tool-approval__tool-name">{props.tool}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => props.onDeny?.()}
              class="sk-tool-approval__close"
              aria-label="Deny and close"
            >
              <svg
                class="sk-tool-approval__close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="sk-tool-approval__content">
            <div>
              <h3 class="sk-tool-approval__section-label">What this tool does:</h3>
              <p class="sk-tool-approval__description">{getToolDescription()}</p>
            </div>
            <div>
              <h3 class="sk-tool-approval__section-label">Parameters:</h3>
              <div class="sk-tool-approval__params-box">
                <pre class="sk-tool-approval__pre">{formatInput()}</pre>
              </div>
            </div>
            <div class="sk-tool-approval__always-allow">
              <input
                type="checkbox"
                id={checkboxId}
                checked={alwaysAllow()}
                onChange={(e) => setAlwaysAllow(e.currentTarget.checked)}
                class="sk-tool-approval__checkbox"
                data-testid="tool-approval-checkbox"
              />
              <label for={checkboxId} class="sk-tool-approval__always-allow-label">
                <span class="sk-tool-approval__always-allow-title">Always allow this tool</span>
                <br />
                This tool will be automatically approved for the rest of this session
              </label>
            </div>
          </div>
          <div class="sk-tool-approval__footer">
            <div class="sk-tool-approval__hints">
              <kbd class="sk-tool-approval__kbd">Enter</kbd> to approve •{' '}
              <kbd class="sk-tool-approval__kbd">Escape</kbd> to deny
            </div>
            <div class="sk-tool-approval__actions">
              <button
                onClick={() => props.onDeny?.()}
                data-testid="tool-approval-deny"
                class="sk-tool-approval__btn sk-tool-approval__btn--deny"
              >
                Deny
              </button>
              <button
                onClick={() => props.onApprove(alwaysAllow())}
                data-testid="tool-approval-approve"
                class="sk-tool-approval__btn sk-tool-approval__btn--approve"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      </div>
    </KeyboardScope>
  );
};
