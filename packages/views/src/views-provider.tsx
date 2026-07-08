import { createContext, useContext, type ParentProps } from 'solid-js';
import type { ViewKit } from './view-kit';
import { defaultViewKit } from './view-kit';
import type { Intent } from './types';
import type { CanFn } from './field-state';
import type { ViewsTheme } from './theme';
import { defaultTheme as defaultViewsTheme } from './theme';

/** Props for the ViewsProvider component */
export interface ViewsProviderProps {
  /** ViewKit configuration — defines kinds, shapes, slot map, registry */
  readonly viewKit?: ViewKit;
  /** Theme configuration */
  readonly theme?: ViewsTheme;
  /** Current user intent */
  readonly intent?: Intent;
  /** Permission resolver */
  readonly can?: CanFn;
  /** Per-field overrides by component name */
  readonly overrides?: Record<string, Record<string, unknown>>;
}

/** The context value supplied to all children */
export interface ViewsContextValue {
  readonly viewKit: ViewKit;
  readonly theme: ViewsTheme;
  readonly intent: Intent;
  readonly can: CanFn;
  readonly overrides: Record<string, Record<string, unknown>>;
}

const defaultCan: CanFn = () => true;

const ViewsContext = createContext<ViewsContextValue>({
  viewKit: defaultViewKit,
  theme: defaultViewsTheme,
  intent: 'browse',
  can: defaultCan,
  overrides: {},
});

/**
 * Provider component that supplies view configuration to children.
 * Supports nesting — inner providers merge with outer.
 */
export const ViewsProvider = (props: ParentProps<ViewsProviderProps>) => {
  const parent = useContext(ViewsContext);

  const value = (): ViewsContextValue => ({
    viewKit: props.viewKit ?? parent.viewKit,
    theme: props.theme ?? parent.theme,
    intent: props.intent ?? parent.intent,
    can: props.can ?? parent.can,
    overrides: props.overrides
      ? { ...parent.overrides, ...props.overrides }
      : parent.overrides,
  });

  return (
    <ViewsContext.Provider value={value()}>
      {props.children}
    </ViewsContext.Provider>
  );
};

/**
 * Hook to access the nearest ViewsProvider context.
 */
export const useViews = (): ViewsContextValue => {
  return useContext(ViewsContext);
};
