import { onMount, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';
import { useKeyboard } from './useKeyboard';
import type { KeyboardScopeProps } from './types';

export const KeyboardScope: Component<KeyboardScopeProps> = (props) => {
  const { enterScope } = useKeyboard();

  onMount(() => {
    const leaveScope = enterScope(props.name, { exclusive: props.exclusive });
    onCleanup(leaveScope);
  });

  return <>{props.children}</>;
};
