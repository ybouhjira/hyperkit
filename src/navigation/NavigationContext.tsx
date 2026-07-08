import { createContext, useContext, type ParentProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { ContentRef, NavigationContextValue, NavigationTarget } from './types';
import { getDefaultPanel } from './ContentRegistry';

// Internal store shape
interface NavigationState {
  /** Map of panelId -> active content */
  panelContent: Record<string, ContentRef | null>;
  /** Map of panelId -> content tabs */
  panelTabs: Record<string, ContentRef[]>;
  /** Map of panelId -> active tab content ID */
  activeTabId: Record<string, string | null>;
}

const NavigationCtx = createContext<NavigationContextValue>();

export interface NavigationProviderProps {
  /** Optional callback when content is opened (e.g., to add a panel to the layout) */
  onOpenPanel?: (panelId: string, position?: 'left' | 'center' | 'right' | 'bottom') => void;
}

export function NavigationProvider(props: ParentProps<NavigationProviderProps>) {
  const [state, setState] = createStore<NavigationState>({
    panelContent: {},
    panelTabs: {},
    activeTabId: {},
  });

  const setPanelContent = (panelId: string, ref: ContentRef | null): void => {
    setState('panelContent', panelId, ref);
    // If setting content and tabs exist, also set active tab
    if (ref) {
      setState('activeTabId', panelId, ref.id);
    }
  };

  const getPanelContent = (panelId: string): ContentRef | null => {
    const result = state.panelContent[panelId] ?? null;
    return result;
  };

  const getPanelTabs = (panelId: string): ContentRef[] => {
    return state.panelTabs[panelId] ?? [];
  };

  const addTab = (panelId: string, ref: ContentRef): void => {
    setState(
      produce((s) => {
        if (!s.panelTabs[panelId]) {
          s.panelTabs[panelId] = [];
        }
        // Don't add duplicate tabs
        const exists = s.panelTabs[panelId].some((t) => t.id === ref.id && t.type === ref.type);
        if (!exists) {
          s.panelTabs[panelId].push(ref);
        }
        // Set as active
        s.activeTabId[panelId] = ref.id;
        s.panelContent[panelId] = ref;
      })
    );
  };

  const removeTab = (panelId: string, contentId: string): void => {
    setState(
      produce((s) => {
        const tabs = s.panelTabs[panelId];
        if (!tabs) return;
        const idx = tabs.findIndex((t) => t.id === contentId);
        if (idx === -1) return;
        tabs.splice(idx, 1);
        // If removed tab was active, activate previous or next
        if (s.activeTabId[panelId] === contentId) {
          if (tabs.length > 0) {
            const newIdx = Math.min(idx, tabs.length - 1);
            const newTab = tabs[newIdx];
            if (newTab) {
              s.activeTabId[panelId] = newTab.id;
              s.panelContent[panelId] = newTab;
            }
          } else {
            s.activeTabId[panelId] = null;
            s.panelContent[panelId] = null;
          }
        }
      })
    );
  };

  const getActiveTab = (panelId: string): ContentRef | null => {
    const activeId = state.activeTabId[panelId];
    if (!activeId) return null;
    const tabs = state.panelTabs[panelId] ?? [];
    return tabs.find((t) => t.id === activeId) ?? null;
  };

  const setActiveTab = (panelId: string, contentId: string): void => {
    const tabs = state.panelTabs[panelId] ?? [];
    const tab = tabs.find((t) => t.id === contentId);
    if (tab) {
      setState('activeTabId', panelId, contentId);
      setState('panelContent', panelId, tab);
    }
  };

  const openContent = (ref: ContentRef, target?: NavigationTarget): void => {
    const t = target ?? { where: 'same' as const };

    switch (t.where) {
      case 'same': {
        const panelId = getDefaultPanel(ref.type);
        if (panelId) {
          setPanelContent(panelId, ref);
        }
        break;
      }
      case 'new-tab': {
        const panelId = t.panelId ?? getDefaultPanel(ref.type);
        if (panelId) {
          addTab(panelId, ref);
        }
        break;
      }
      case 'new-panel': {
        const panelId = getDefaultPanel(ref.type);
        if (panelId) {
          props.onOpenPanel?.(panelId, t.position);
          setPanelContent(panelId, ref);
        }
        break;
      }
      case 'new-mode': {
        // Mode switching is app-specific — just set content, app handles mode
        const panelId = getDefaultPanel(ref.type);
        if (panelId) {
          setPanelContent(panelId, ref);
        }
        break;
      }
    }
  };

  const value: NavigationContextValue = {
    openContent,
    getPanelContent,
    setPanelContent,
    getPanelTabs,
    addTab,
    removeTab,
    getActiveTab,
    setActiveTab,
  };

  return <NavigationCtx.Provider value={value}>{props.children}</NavigationCtx.Provider>;
}

/** Access the navigation context */
export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationCtx);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}
