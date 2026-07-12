import { Component, Show } from 'solid-js';
import { Collapsible } from '../../primitives/Collapsible';
import { Badge } from '../../primitives/Badge';
import '@ybouhjira/hyperkit-styles/composites/ToolExecution/ToolExecution.css';

export type ToolStatus = 'running' | 'success' | 'error';

export interface ToolExecutionProps {
  toolName: string;
  status: ToolStatus;
  input?: string;
  output?: string;
  duration?: number;
  defaultOpen?: boolean;
  class?: string;
}

const statusConfig: Record<
  ToolStatus,
  { variant: 'warning' | 'success' | 'danger'; label: string }
> = {
  running: { variant: 'warning', label: 'Running' },
  success: { variant: 'success', label: 'Done' },
  error: { variant: 'danger', label: 'Error' },
};

export const ToolExecution: Component<ToolExecutionProps> = (props) => {
  const config = () => statusConfig[props.status];

  const trigger = (
    <div class="sk-tool-exec__trigger">
      <span class="sk-tool-exec__name">{props.toolName}</span>
      <Badge variant={config().variant}>{config().label}</Badge>
      <Show when={props.duration !== undefined}>
        <span class="sk-tool-exec__duration">{props.duration}ms</span>
      </Show>
    </div>
  );

  return (
    <div class={`sk-tool-exec ${props.class ?? ''}`} data-testid="tool-execution">
      <Collapsible trigger={trigger} defaultOpen={props.defaultOpen}>
        <div class="sk-tool-exec__details">
          <Show when={props.input}>
            <div class="sk-tool-exec__section sk-tool-exec__section--input">
              <div class="sk-tool-exec__section-label">Input</div>
              <pre class="sk-tool-exec__section-content">{props.input}</pre>
            </div>
          </Show>
          <Show when={props.output}>
            <div class="sk-tool-exec__section sk-tool-exec__section--output">
              <div class="sk-tool-exec__section-label">Output</div>
              <pre class="sk-tool-exec__section-content">{props.output}</pre>
            </div>
          </Show>
        </div>
      </Collapsible>
    </div>
  );
};
