import type { Component } from 'solid-js';
import { ActionForm, type ActionFormProps } from './ActionForm';

/**
 * Returns a SolidJS component pre-bound to a specific navigable target and
 * action name. The returned component accepts all {@link ActionFormProps}
 * except `target` and `action`, which are fixed at factory time.
 *
 * @param target - The navigable ID to target
 * @param action - The action name to dispatch
 * @returns A `Component` bound to `target` and `action`
 *
 * @example
 * ```tsx
 * const SelectForm = createActionForm('reports-list', 'select');
 *
 * // Later in JSX:
 * <SelectForm onSubmit={(result) => console.log(result)} />
 * ```
 */
export function createActionForm(
  target: string,
  action: string
): Component<Omit<ActionFormProps, 'target' | 'action'>> {
  return (props: Omit<ActionFormProps, 'target' | 'action'>) => (
    <ActionForm {...props} target={target} action={action} />
  );
}
