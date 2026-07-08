import { For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import type { SessionSubagentInfo } from './SessionManager';
import { getSubagentStatusColor, getModelIcon } from './sessionManagerUtils';

export const SubagentTreeNode = (props: {
  readonly agent: SessionSubagentInfo;
  readonly tree: Map<string, readonly SessionSubagentInfo[]>;
  readonly isLast: boolean;
  readonly prefix: string;
}) => {
  const children = () => props.tree.get(props.agent.id) || [];
  const hasChildren = () => children().length > 0;

  const nodeStyle = (): JSX.CSSProperties => ({
    display: 'flex',
    'align-items': 'center',
    gap: '8px',
    'font-size': '13px',
    'font-family': 'var(--sk-font-ui)',
    color: 'var(--sk-text-secondary)',
    'margin-left': `${props.prefix.length * 8}px`,
    'margin-top': '4px',
  });

  const dotStyle = (): JSX.CSSProperties => ({
    width: '6px',
    height: '6px',
    'border-radius': '50%',
    'background-color': getSubagentStatusColor(props.agent.status),
    'flex-shrink': '0',
  });

  const connector = () => (props.isLast ? '└──' : '├──');

  return (
    <>
      <div style={nodeStyle()}>
        <span style={{ color: 'var(--sk-border)' }}>
          {props.prefix}
          {connector()}
        </span>
        <span>{getModelIcon(props.agent.model)}</span>
        <div style={dotStyle()} />
        <span>{props.agent.description}</span>
      </div>
      <Show when={hasChildren()}>
        <For each={children()}>
          {(child, index) => (
            <SubagentTreeNode
              agent={child}
              tree={props.tree}
              isLast={index() === children().length - 1}
              prefix={props.prefix + (props.isLast ? '    ' : '│   ')}
            />
          )}
        </For>
      </Show>
    </>
  );
};
