import { createSignal } from 'solid-js';
import { inspectNavigables, dispatchAction } from '../../navigation/NavigableRegistry';
import type { CommandAction } from './CommandPalette';

/** Extended CommandAction that may require params before executing */
export interface NavigableCommandAction extends CommandAction {
  /** True when the underlying navigable action declares a params schema */
  needsParams?: boolean;
}

/**
 * SolidJS hook that auto-discovers all registered navigable actions and
 * converts them into {@link NavigableCommandAction} objects.
 *
 * Actions that declare a `params` schema are flagged with `needsParams: true`
 * so the host UI can open a param-collection form instead of auto-executing.
 *
 * The signal is refreshed every time `refresh()` is called (e.g. on palette
 * open) — not reactively, since the registry is not a SolidJS store.
 *
 * @returns A tuple `[actions, refresh]` where `actions` is a reactive getter
 *   and `refresh` re-reads the current registry state.
 */
export function useNavigableActions(): [() => NavigableCommandAction[], () => void] {
  const [actions, setActions] = createSignal<NavigableCommandAction[]>([]);

  function refresh(): void {
    const infos = inspectNavigables();

    const discovered: NavigableCommandAction[] = infos.flatMap((navigable) =>
      navigable.actions.map((actionSchema) => {
        const hasParams = actionSchema.params !== undefined;

        const action: NavigableCommandAction = {
          id: `${navigable.id}:${actionSchema.name}`,
          label: `${navigable.label} → ${actionSchema.name}`,
          category: navigable.category ?? 'Navigable Actions',
          keywords: [navigable.id, actionSchema.description],
          handler: () => {
            if (!hasParams) {
              void dispatchAction(navigable.id, actionSchema.name);
            }
          },
          ...(hasParams ? { needsParams: true } : {}),
        };

        return action;
      })
    );

    setActions(discovered);
  }

  return [actions, refresh];
}
