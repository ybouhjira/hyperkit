import { For, createSignal } from 'solid-js';
import { Text, Flex, Stack, Badge, Button, Card, CardContent } from '@ybouhjira/hyperkit';
import { blueprint } from '../helpers/state';
import { sampleIssue } from '../helpers/data';
import { KIND_COLORS } from '../helpers/utils';
import { resolveVisibleFields } from '../../src';
import { IssueCard } from '../components/IssueCard';
import { IssueRow } from '../components/IssueRow';
import { IssueTable } from '../components/IssueTable';
import { IssueDetail } from '../components/IssueDetail';
import type { Shape } from '../../src/types';

export const SchemaBuilder = () => {
  const [previewShape, setPreviewShape] = createSignal<Shape>('card');
  const [showSchemaCode, setShowSchemaCode] = createSignal(false);

  const PreviewComponent = () => {
    const shape = previewShape();
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
      default:
        return <IssueCard data={sampleIssue} fields={fields} />;
    }
  };

  return (
    <div style={{ padding: '32px', 'max-width': '1400px', margin: '0 auto' }}>
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Text as="h2" size="2xl" weight="bold">Schema Builder</Text>
          <Text size="base" color="secondary">
            Define fields with semantic kinds and priority levels
          </Text>
        </Stack>

        {/* Two-column layout */}
        <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '32px' }}>
          {/* Left: Field list */}
          <Stack gap="md">
            <Text size="lg" weight="semibold">Blueprint Fields</Text>
            <Stack gap="sm">
              <For each={blueprint()}>
                {(field) => (
                  <Card variant="outlined" padding="sm">
                    <Flex justify="between" align="center">
                      <Flex gap="sm" align="center">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            'border-radius': '50%',
                            background: KIND_COLORS[field.annotation.kind],
                          }}
                        />
                        <Text size="sm" weight="medium">{field.name}</Text>
                        <Badge variant="default" style={{ 'font-size': '11px' }}>
                          {field.annotation.kind}
                        </Badge>
                      </Flex>
                      <Badge variant="info" style={{ 'font-size': '11px' }}>
                        P{field.annotation.priority}
                      </Badge>
                    </Flex>
                  </Card>
                )}
              </For>
            </Stack>
          </Stack>

          {/* Right: Live preview */}
          <Stack gap="md">
            <Flex justify="between" align="center">
              <Text size="lg" weight="semibold">Live Preview</Text>
              <Flex gap="xs">
                <For each={['card', 'row', 'table', 'detail'] as Shape[]}>
                  {(shape) => (
                    <Button
                      variant={previewShape() === shape ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewShape(shape)}
                    >
                      {shape}
                    </Button>
                  )}
                </For>
              </Flex>
            </Flex>

            <div style={{ 'min-height': '300px' }}>
              <PreviewComponent />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSchemaCode(!showSchemaCode())}
            >
              {showSchemaCode() ? 'Hide' : 'Show'} Schema Code
            </Button>

            {showSchemaCode() && (
              <Card variant="outlined">
                <CardContent>
                  <pre style={{
                    'font-family': 'var(--sk-font-mono)',
                    'font-size': '12px',
                    'white-space': 'pre-wrap',
                    color: 'var(--sk-text-secondary)',
                  }}>
{`import { Schema as S } from 'effect';
import { ui } from '@hyperkit/views';

export const Issue = S.Struct({
  title: S.String.pipe(ui('title', 1)),
  status: S.Literal('open', 'closed', 'in_progress')
    .pipe(ui('status', 1)),
  number: S.Number.pipe(ui('identifier', 2)),
  labels: S.Array(S.Struct({
    name: S.String,
    color: S.String,
  })).pipe(ui('tag', 2)),
  commentCount: S.Number.pipe(ui('metric', 2)),
  assignee: S.optional(S.Struct({
    username: S.String,
    avatar: S.String,
    name: S.String,
  }).pipe(ui('person', 3))),
  updatedAt: S.Date.pipe(ui('timestamp', 3)),
  body: S.String.pipe(ui('content', 4)),
});`}
                  </pre>
                </CardContent>
              </Card>
            )}
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
