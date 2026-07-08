import { createSignal, onCleanup, For } from 'solid-js';
import { Text, Flex, Stack, Badge, Button } from '@ybouhjira/hyperkit';
import { sampleIssue } from '../helpers/data';
import { resolveVisibleFields } from '../../src';
import { blueprint } from '../helpers/state';
import type { Shape } from '../../src/types';
import { IssueCard } from '../components/IssueCard';
import { IssueRow } from '../components/IssueRow';
import { IssueTable } from '../components/IssueTable';
import { IssueDetail } from '../components/IssueDetail';
import { IssueBoard } from '../components/IssueBoard';
import { IssueTimeline } from '../components/IssueTimeline';
import { IssuePin } from '../components/IssuePin';
import { IssueCompactCard } from '../components/IssueCompactCard';

const SHAPES: Shape[] = ['card', 'row', 'table', 'detail', 'board', 'timeline', 'pin', 'compact-card'];

export const HeroDemo = (props: { onExploreClick?: () => void }) => {
  const [currentIndex, setCurrentIndex] = createSignal(0);

  // Auto-play carousel every 2 seconds
  const interval = setInterval(() => {
    setCurrentIndex((i) => (i + 1) % SHAPES.length);
  }, 2000);

  onCleanup(() => clearInterval(interval));

  const currentShape = () => SHAPES[currentIndex()];

  const ShapeView = () => {
    const shape = currentShape();
    const fields = resolveVisibleFields(blueprint(), shape, 'browse');

    switch (shape) {
      case 'card':
        return <IssueCard data={sampleIssue} fields={fields} />;
      case 'row':
        return <IssueRow data={sampleIssue} fields={fields} />;
      case 'table':
        return <IssueTable data={[sampleIssue]} fields={fields} />;
      case 'detail':
        return <IssueDetail data={sampleIssue} fields={fields} />;
      case 'board':
        return <IssueBoard data={[sampleIssue]} fields={fields} />;
      case 'timeline':
        return <IssueTimeline data={[sampleIssue]} fields={fields} />;
      case 'pin':
        return <IssuePin data={sampleIssue} fields={fields} />;
      case 'compact-card':
        return <IssueCompactCard data={sampleIssue} fields={fields} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '80px 32px', 'max-width': '1200px', margin: '0 auto' }}>
      <Stack gap="3xl" align="center">
        {/* Hero headline */}
        <Stack gap="lg" align="center" style={{ 'text-align': 'center' }}>
          <Text
            as="h1"
            size="4xl"
            weight="bold"
            style={{
              background: 'linear-gradient(135deg, #e94560, var(--sk-accent))',
              '-webkit-background-clip': 'text',
              '-webkit-text-fill-color': 'transparent',
              'background-clip': 'text',
            }}
          >
            Schema-Driven UI Generation
          </Text>
          <Text size="xl" color="secondary" style={{ 'max-width': '700px' }}>
            Write 10 lines of schema → Get 8 production-ready views
          </Text>
        </Stack>

        {/* Shape carousel with big badge */}
        <Stack gap="lg" align="center" style={{ width: '100%', 'max-width': '800px' }}>
          <Badge
            variant="primary"
            style={{
              'font-size': '18px',
              padding: '12px 24px',
              'text-transform': 'uppercase',
              'letter-spacing': '2px',
              'font-weight': '700',
            }}
          >
            {currentShape()}
          </Badge>

          <div
            class="shape-carousel"
            style={{
              width: '100%',
              'min-height': '300px',
              padding: '24px',
              background: 'var(--sk-bg-secondary)',
              border: '2px solid var(--sk-border)',
              'border-radius': 'var(--sk-radius-lg)',
            }}
          >
            <ShapeView />
          </div>

          {/* Progress dots */}
          <Flex gap="sm" justify="center">
            <For each={SHAPES}>
              {(_, i) => (
                <div
                  style={{
                    width: currentIndex() === i() ? '32px' : '8px',
                    height: '8px',
                    'border-radius': '4px',
                    background: currentIndex() === i() ? 'var(--sk-accent)' : 'var(--sk-border)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCurrentIndex(i())}
                />
              )}
            </For>
          </Flex>
        </Stack>

        {/* CTA button */}
        <Button
          variant="primary"
          size="lg"
          onClick={props.onExploreClick}
          style={{ 'font-size': '18px', padding: '16px 32px' }}
        >
          Explore Schema →
        </Button>
      </Stack>
    </div>
  );
};
