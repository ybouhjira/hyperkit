import { createContext, useContext, type ParentProps } from 'solid-js';
import type { IconStyle } from './types';

interface IconContextValue {
  style: IconStyle;
}

const IconContext = createContext<IconContextValue>({ style: 'fluent' });

export interface IconProviderProps extends ParentProps {
  style: IconStyle;
}

export function IconProvider(props: IconProviderProps) {
  return (
    <IconContext.Provider value={{ style: props.style }}>
      {props.children}
    </IconContext.Provider>
  );
}

export function useIconStyle(): IconStyle {
  return useContext(IconContext).style;
}
