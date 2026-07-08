import { For, createSignal, onCleanup, Show } from 'solid-js';
import { Text, Flex, Stack, Badge, Switch } from '@ybouhjira/hyperkit';
import { sampleIssue, allIssues } from '../helpers/data';
import { blueprint } from '../helpers/state';
import { resolveVisibleFields } from '../../src';
import { IssueCard } from '../components/IssueCard';
import { IssueRow } from '../components/IssueRow';
import { IssueTable } from '../components/IssueTable';
import { IssueDetail } from '../components/IssueDetail';
import { IssueBoard } from '../components/IssueBoard';
import { IssueTimeline } from '../components/IssueTimeline';
import { IssuePin } from '../components/IssuePin';
import { IssueCompactCard } from '../components/IssueCompactCard';
import type { Shape } from '../../src/types';

const ALL_SHAPES: { shape: Shape; label: string }[] = [
  { shape: 'card', label: 'Card' },
  { shape: 'row', label: 'Row' },
  { shape: 'table', label: 'Table' },
  { shape: 'detail', label: 'Detail' },
  { shape: 'board', label: 'Board' },
  { shape: 'timeline', label: 'Timeline' },
  { shape: 'pin', label: 'Pin' },
  { shape: 'compact-card', label: 'Compact Card' },
];

export const ShapeGallery = () => {
  const [autoPlayEnabled, setAutoPlayEnabled] = createSignal(false);
  const [currentShapeIndex, setCurrentShapeIndex] = createSignal(0);

  // Auto-play logic
  let interval: number | undefined;

  const startAutoPlay = () => {
    interval = setInterval(() => {
      setCurrentShapeIndex((i) => (i + 1) % ALL_SHAPES.length);
    }, 2000) as unknown as number;
  };

  const stopAutoPlay = () => {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };

  const toggleAutoPlay = (enabled: boolean) => {
    setAutoPlayEnabled(enabled);
    if (enabled) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  };

  onCleanup(() => stopAutoPlay());

  const ShapeComponent = (props: { shape: Shape }) => {
    const fields = resolveVisibleFields(blueprint(), props.shape, 'browse');

    switch (props.shape) {
      case 'card':
        return <IssueCard data={sampleIssue} fields={fields} />;
      case 'row':
        return <IssueRow data={sampleIssue} fields={fields} />;
      case 'table':
        return <IssueTable data={allIssues} fields={fields} />;
      case 'detail':
        return <IssueDetail data={sampleIssue} fields={fields} />;
      case 'board':
        return <IssueBoard data={allIssues} fields={fields} />;
      case 'timeline':
        return <IssueTimeline data={allIssues} fields={fields} />;
      case 'pin':
        return <IssuePin data={sampleIssue} fields={fields} />;
      case 'compact-card':
        return <IssueCompactCard data={sampleIssue} fields={fields} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Flex justify="between" align="center">
          <Stack gap="sm">
            <Text as="h2" size="2xl" weight="bold">Shape Gallery</Text>
            <Text size="base" color="secondary">
              Same data, different visual presentations
            </Text>
          </Stack>

          {/* Auto-play toggle */}
          <Flex gap="sm" align="center">
            <Text size="sm" weight="medium">Auto-play carousel</Text>
            <Switch checked={autoPlayEnabled()} onChange={toggleAutoPlay} />
          </Flex>
        </Flex>

        {/* Carousel mode */}
        <Show when={autoPlayEnabled()}>
          <Stack gap="lg" align="center" style={{ padding: '40px 0' }}>
            <Badge
              variant="primary"
              style={{
                'font-size': '24px',
                padding: '16px 32px',
                'text-transform': 'uppercase',
                'letter-spacing': '2px',
                'font-weight': '700',
              }}
            >
              {ALL_SHAPES[currentShapeIndex()].label}
            </Badge>

            <div style={{ width: '100%', 'max-width': '800px', 'min-height': '400px' }}>
              <ShapeComponent shape={ALL_SHAPES[currentShapeIndex()].shape} />
            </div>
          </Stack>
        </Show>

        {/* Grid mode */}
        <Show when={!autoPlayEnabled()}>
          <div style={{
            display: 'grid',
            'grid-template-columns': 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px',
          }}>
            <For each={ALL_SHAPES}>
              {(item) => (
                <Stack gap="sm">
                  <Text
                    as="h3"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    style={{ 'text-transform': 'uppercase', 'letter-spacing': '1px' }}
                  >
                    {item.label}
                  </Text>
                  <ShapeComponent shape={item.shape} />
                </Stack>
              )}
            </For>
          </div>
        </Show>
      </Stack>
    </div>
  );
};
