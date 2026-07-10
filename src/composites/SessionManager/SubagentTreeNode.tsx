import { For, Show } from 'solid-js';
import type { SessionSubagentInfo } from './SessionManager';
import { getModelIcon } from './sessionManagerUtils';

export const SubagentTreeNode = (props: {
  readonly agent: SessionSubagentInfo;
  readonly tree: Map<string, readonly SessionSubagentInfo[]>;
  readonly isLast: boolean;
  readonly prefix: string;
}) => {
  const children = () => props.tree.get(props.agent.id) || [];
  const hasChildren = () => children().length > 0;

  const connector = () => (props.isLast ? '└──' : '├──');

  return (
    <>
      <div class="sk-subagent" style={{ '--sk-subagent-depth': props.prefix.length }}>
        <span class="sk-subagent__connector">
          {props.prefix}
          {connector()}
        </span>
        <span>{getModelIcon(props.agent.model)}</span>
        <div
          class={`sk-subagent__dot sk-subagent__dot--${props.agent.status}`}
          role="img"
          aria-label={props.agent.status}
        />
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
