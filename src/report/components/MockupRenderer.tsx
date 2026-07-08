import { type Component, type JSX, Show, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { MockupLayoutContent, MockupNode, MockupSlot, MockupTreeContent } from '../types';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Stack } from '../../primitives/Stack';
import { Grid } from '../../primitives/Grid';
import { Container } from '../../primitives/Container';
import { Center } from '../../primitives/Center';
import { Spacer } from '../../primitives/Spacer';
import { Section } from '../../primitives/Section';
import { ScrollArea } from '../../primitives/ScrollArea';
import { Text } from '../../primitives/Text';
import { Badge } from '../../primitives/Badge';
import { Card } from '../../primitives/Card';
import { CodeBlock } from '../../primitives/CodeBlock';
import { Skeleton } from '../../primitives/Skeleton';
import { Tooltip } from '../../primitives/Tooltip';
import { Kbd } from '../../primitives/Kbd';
import { StatusDot } from '../../primitives/StatusDot';
import { EmptyState } from '../../primitives/EmptyState';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { SearchInput } from '../../primitives/SearchInput';
import { Select } from '../../primitives/Select';
import { Checkbox } from '../../primitives/Checkbox';
import { Switch } from '../../primitives/Switch';
import { Slider } from '../../primitives/Slider';
import { TagInput } from '../../primitives/TagInput';
import { Tabs } from '../../primitives/Tabs';
import { Separator } from '../../primitives/Separator';
import { SegmentedBar } from '../../primitives/SegmentedBar';
import { Accordion } from '../../primitives/Accordion';
import { Collapsible } from '../../primitives/Collapsible';
import { Spinner } from '../../primitives/Spinner';
import { ProgressBar } from '../../primitives/ProgressBar';
import { ProgressRing } from '../../primitives/ProgressRing';
import { Table } from '../../primitives/Table';
import { DropZone } from '../../primitives/DropZone';
import { Sidebar } from '../../composites/Sidebar';
import { TabBar } from '../../composites/TabBar';
import { StatusBar } from '../../composites/StatusBar';
import { Breadcrumb } from '../../composites/Breadcrumb';
import { MenuBar } from '../../composites/MenuBar';
import { FileExplorer } from '../../composites/FileExplorer';
import { Timeline } from '../../primitives/Timeline';
import { Sparkline } from '../../primitives/Sparkline';
import { MetricCard } from '../../primitives/MetricCard';
import { ImagePreview } from '../../primitives/ImagePreview';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, Component<any>> = {
  // Layout
  Box,
  Flex,
  Stack,
  Grid,
  Container,
  Center,
  Spacer,
  Section,
  ScrollArea,
  // Display
  Text,
  Badge,
  Card,
  CodeBlock,
  Skeleton,
  Tooltip,
  Kbd,
  StatusDot,
  EmptyState,
  MetricCard,
  ImagePreview,
  Timeline,
  Sparkline,
  // Form
  Button,
  Input,
  SearchInput,
  Select,
  Checkbox,
  Switch,
  Slider,
  TagInput,
  // Navigation
  Tabs,
  Separator,
  SegmentedBar,
  Accordion,
  Collapsible,
  // Feedback
  Spinner,
  ProgressBar,
  ProgressRing,
  // Overlay
  Table,
  DropZone,
  // Composite
  Sidebar,
  TabBar,
  StatusBar,
  Breadcrumb,
  MenuBar,
  FileExplorer,
};

function isMockupNode(value: unknown): value is MockupNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'component' in value &&
    typeof (value as Record<string, unknown>)['component'] === 'string'
  );
}

function resolveValue(value: unknown): unknown {
  if (isMockupNode(value)) return renderNode(value);
  if (Array.isArray(value))
    return (value as unknown[]).map((v: unknown) => (isMockupNode(v) ? renderNode(v) : v));
  return value;
}

function renderNode(node: MockupNode): JSX.Element {
  const Comp = COMPONENT_MAP[node.component];

  if (!Comp) {
    return (
      <Box
        style={{
          border: '1px dashed var(--sk-border)',
          padding: 'var(--sk-space-sm)',
          'border-radius': 'var(--sk-radius-sm)',
          color: 'var(--sk-text-muted)',
          'font-size': 'var(--sk-font-size-xs)',
        }}
      >
        Unknown: {node.component}
      </Box>
    );
  }

  const rawProps = node.props ?? {};
  const props: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(rawProps)) {
    props[key] = resolveValue(val);
  }
  if (node.style) props['style'] = node.style;
  if (node.class) props['class'] = node.class;

  let children: JSX.Element | undefined;
  if (typeof node.children === 'string') {
    children = node.children;
  } else if (Array.isArray(node.children)) {
    children = (
      <For each={node.children}>
        {(child) => (typeof child === 'string' ? child : renderNode(child as MockupNode))}
      </For>
    );
  } else if (node.children) {
    children = renderNode(node.children);
  }

  return (
    <Dynamic component={Comp} {...props}>
      {children}
    </Dynamic>
  );
}

export interface MockupLayoutRendererProps {
  content: MockupLayoutContent;
}

export const MockupLayoutRenderer: Component<MockupLayoutRendererProps> = (props) => {
  return (
    <div class="sk-mockup">
      <Show when={props.content.title}>
        <div class="sk-mockup__header">
          <div class="sk-mockup__title">{props.content.title}</div>
          <Show when={props.content.description}>
            <div class="sk-mockup__description">{props.content.description}</div>
          </Show>
        </div>
      </Show>
      <div
        class="sk-mockup__body"
        style={{ width: props.content.width ?? '100%', height: props.content.height ?? '500px' }}
      >
        <div class={`sk-mockup-layout--${props.content.template}`}>
          <For each={Object.entries(props.content.slots) as [string, MockupSlot][]}>
            {([slotName, slot]: [string, MockupSlot]) => (
              <div data-slot={slotName}>
                {Array.isArray(slot.children) ? (
                  <For each={slot.children}>{(node) => renderNode(node)}</For>
                ) : (
                  renderNode(slot.children)
                )}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export interface MockupTreeRendererProps {
  content: MockupTreeContent;
}

export const MockupTreeRenderer: Component<MockupTreeRendererProps> = (props) => {
  return (
    <div class="sk-mockup">
      <Show when={props.content.title}>
        <div class="sk-mockup__header">
          <div class="sk-mockup__title">{props.content.title}</div>
          <Show when={props.content.description}>
            <div class="sk-mockup__description">{props.content.description}</div>
          </Show>
        </div>
      </Show>
      <div
        class="sk-mockup__body"
        style={{ width: props.content.width ?? '100%', height: props.content.height ?? '400px' }}
      >
        {renderNode(props.content.root)}
      </div>
    </div>
  );
};
