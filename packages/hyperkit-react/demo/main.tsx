/** Dev playground — every Phase-1 component on one page for visual checks. */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@ybouhjira/hyperkit-styles/styles.css';
import {
  ThemeProvider,
  useTheme,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Input,
  ProgressBar,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Tooltip,
  fjordTheme,
  type TableColumn,
} from '../src';

interface Run {
  id: string;
  pipeline: string;
  status: string;
  duration: string;
}
const RUNS: Run[] = [
  { id: '1', pipeline: 'build', status: 'passed', duration: '2m 14s' },
  { id: '2', pipeline: 'test', status: 'passed', duration: '4m 02s' },
  { id: '3', pipeline: 'deploy', status: 'failed', duration: '0m 41s' },
];
const COLUMNS: TableColumn<Run>[] = [
  { key: 'pipeline', header: 'Pipeline', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <Badge variant={r.status === 'passed' ? 'success' : 'danger'}>{r.status}</Badge>,
  },
  { key: 'duration', header: 'Duration' },
];

function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <Select
      options={themes.map((t) => ({ value: t.id, label: t.name }))}
      value={theme.id}
      onChange={setTheme}
    />
  );
}

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progress, setProgress] = useState(62);
  const [selectedRow, setSelectedRow] = useState<string | null>('2');

  return (
    <Box p="xl" bg="primary" style={{ minHeight: '100vh' }}>
      <Stack gap="lg">
        <Flex justify="between" align="center" gap="md">
          <Text as="h1" size="2xl" weight="semibold">
            hyperkit-react playground
          </Text>
          <Flex gap="sm" align="center">
            <Text color="muted">Theme</Text>
            <ThemeSwitcher />
          </Flex>
        </Flex>
        <Separator />

        <Grid columns={2} gap="lg">
          <Card variant="outlined">
            <Stack gap="md">
              <Text weight="semibold">Buttons & badges</Text>
              <Flex gap="sm" wrap="wrap">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button loading>Loading</Button>
              </Flex>
              <Flex gap="sm" align="center">
                <Badge>default</Badge>
                <Badge variant="success">success</Badge>
                <Badge variant="warning">warning</Badge>
                <Badge variant="danger">danger</Badge>
                <Badge type="count" count={120} />
                <Badge type="dot" variant="success" />
                <Tooltip content="Tokens power everything">
                  <Badge variant="outline">hover me</Badge>
                </Tooltip>
              </Flex>
            </Stack>
          </Card>

          <Card variant="outlined">
            <Stack gap="md">
              <Text weight="semibold">Inputs</Text>
              <Input placeholder="Email address" />
              <Input placeholder="Broken field" error="This field is required" />
              <Flex gap="lg" align="center">
                <Checkbox label="Remember me" defaultChecked />
                <Checkbox label="Partial" indeterminate />
                <Switch label="Auto-save" defaultChecked />
              </Flex>
            </Stack>
          </Card>

          <Card variant="outlined">
            <Stack gap="md">
              <Text weight="semibold">Feedback</Text>
              <Flex gap="md" align="center">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" color="muted" />
                <Skeleton variant="circle" size={32} />
                <Skeleton width={120} height={16} />
              </Flex>
              <ProgressBar value={progress} />
              <ProgressBar indeterminate />
              <Flex gap="sm">
                <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
                  +10%
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                  Open dialog
                </Button>
              </Flex>
            </Stack>
          </Card>

          <Card variant="outlined">
            <Stack gap="md">
              <Text weight="semibold">Tabs</Text>
              <Tabs
                items={[
                  { value: 'overview', label: 'Overview', content: <Text color="secondary">All systems nominal.</Text> },
                  { value: 'logs', label: 'Logs', content: <Text color="muted" font="mono">[00:12] deploy ok</Text> },
                  { value: 'settings', label: 'Settings', content: <Switch label="Notifications" /> },
                ]}
              />
            </Stack>
          </Card>
        </Grid>

        <Card variant="outlined" padding="none">
          <Table
            columns={COLUMNS}
            data={RUNS}
            getRowKey={(r) => r.id}
            selectedKey={selectedRow}
            onRowClick={(r) => setSelectedRow(r.id)}
            sortColumn="pipeline"
            sortDirection="asc"
          />
        </Card>
      </Stack>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm deploy"
        description="This ships the current build to production."
      >
        <Flex gap="sm" justify="end">
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Deploy</Button>
        </Flex>
      </Dialog>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={fjordTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
