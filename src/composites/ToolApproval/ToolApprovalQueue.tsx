import '@ybouhjira/hyperkit-styles/composites/ToolApproval/ToolApproval.css';
import { Show, Component } from 'solid-js';
import { ToolApproval, ToolApprovalItem } from './ToolApproval';

export interface ToolApprovalQueueProps {
  queue: ToolApprovalItem[];
  onApprove: (id: string, alwaysAllow: boolean) => void;
  onDeny: (id: string) => void;
  class?: string;
}

export const ToolApprovalQueue: Component<ToolApprovalQueueProps> = (props) => {
  const currentApproval = () => props.queue[0];
  const queueCount = () => props.queue.length;

  return (
    <>
      <Show when={currentApproval()}>
        {(approval) => (
          <div class={`sk-tool-approval-queue__relative ${props.class || ''}`}>
            <ToolApproval
              tool={approval().tool}
              input={approval().input}
              onApprove={(alwaysAllow) => props.onApprove(approval().id, alwaysAllow)}
              onDeny={() => props.onDeny(approval().id)}
            />
            <Show when={queueCount() > 1}>
              <div class="sk-tool-approval-queue__badge" data-testid="tool-approval-queue-badge">
                <svg
                  class="sk-tool-approval-queue__badge-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="sk-tool-approval-queue__badge-text">
                  {queueCount()} pending approval{queueCount() > 1 ? 's' : ''}
                </span>
              </div>
            </Show>
          </div>
        )}
      </Show>
    </>
  );
};
