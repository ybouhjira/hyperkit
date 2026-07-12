import { useState, type CSSProperties, type ReactNode } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import '@ybouhjira/hyperkit-styles/primitives/Tabs/Tabs.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items. */
  items: TabItem[];
  /** Controlled active tab value. */
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Tabs on @radix-ui/react-tabs rendering the same `sk-tabs` contract as the
 * SolidJS package ([data-selected] mirrored onto the active trigger).
 */
export function Tabs({ items, value, onChange, className, style }: TabsProps) {
  const [internal, setInternal] = useState(value ?? items[0]?.value ?? '');
  const active = value ?? internal;

  const handleChange = (next: string) => {
    setInternal(next);
    onChange?.(next);
  };

  return (
    <RadixTabs.Root
      className={`sk-tabs${className ? ` ${className}` : ''}`}
      style={style}
      value={active}
      onValueChange={handleChange}
    >
      <RadixTabs.List className="sk-tabs__list">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className="sk-tabs__trigger"
            disabled={item.disabled}
            data-selected={active === item.value ? '' : undefined}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value} className="sk-tabs__content">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
