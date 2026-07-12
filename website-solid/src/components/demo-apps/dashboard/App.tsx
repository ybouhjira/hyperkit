/**
 * Ops Dashboard demo — a complete analytics product surface built from
 * HyperKit: tabbed sections (Overview / Traffic / Revenue), KPI MetricCards
 * with live Sparklines, WaterfallCharts, an activity Timeline, and sortable
 * Tables. The time-range selector swaps every dataset; refresh advances the
 * sparklines.
 */
import { createMemo, createSignal, For, type JSX } from 'solid-js';
import {
  Badge,
  Button,
  Card,
  MetricCard,
  Select,
  Sparkline,
  Table,
  Tabs,
  Text,
  Timeline,
  WaterfallChart,
} from '@ybouhjira/hyperkit';
import type { TableColumn } from '@ybouhjira/hyperkit';
import {
  ACTIVITY,
  EVENTS,
  OVERVIEW_KPIS,
  PIPELINE_STAGES,
  REVENUE_BRIDGE,
  REVENUE_KPIS,
  TOP_PAGES,
  TRAFFIC_KPIS,
  TRAFFIC_SERIES,
  TRANSACTIONS,
} from './data';
import type { Kpi, OpsEvent, PageStat, RangeKey, Transaction } from './data';
import './dashboard.css';

const RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
] as const;

const SEVERITY_VARIANT: Record<OpsEvent['severity'], 'info' | 'warning' | 'danger' | 'success'> = {
  info: 'info',
  warning: 'warning',
  critical: 'danger',
  resolved: 'success',
};

const STATUS_VARIANT: Record<Transaction['status'], 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
};

const rotate = (data: readonly number[], by: number): number[] => {
  const n = data.length;
  if (n === 0) return [];
  const shift = by % n;
  return [...data.slice(shift), ...data.slice(0, shift)];
};

const formatDuration = (ms: number): string => {
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  if (mins < 60) return `${mins}m ${totalSec % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const formatViews = (n: number): string =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString('en-US');

/** Small helper wiring HyperKit's controlled Table sorting to local signals. */
function createTableSort<T>(defaultColumn: string, defaultDirection: 'asc' | 'desc' = 'desc') {
  const [column, setColumn] = createSignal(defaultColumn);
  const [direction, setDirection] = createSignal<'asc' | 'desc'>(defaultDirection);
  const sort = (rows: readonly T[], accessors: Record<string, (row: T) => string | number>) => {
    const accessor = accessors[column()];
    if (!accessor) return [...rows];
    const dir = direction() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  };
  const onSort = (col: string, dir: 'asc' | 'desc') => {
    setColumn(col);
    setDirection(dir);
  };
  return { column, direction, sort, onSort };
}

export function DashboardApp() {
  const [tab, setTab] = createSignal('overview');
  const [range, setRange] = createSignal<RangeKey>('24h');
  const [tick, setTick] = createSignal(0);
  const [refreshedAt, setRefreshedAt] = createSignal('2 min ago');

  const refresh = () => {
    setTick((t) => t + 1);
    setRefreshedAt('just now');
  };

  const kpiCard = (kpi: Kpi) => {
    // Evaluate the sparkline ONCE and pass the instance. MetricCard reads
    // `children` both in its <Show when> and in the render slot; a fresh
    // element per access desynchronizes hydration keys on prerendered pages
    // ("Unable to find DOM nodes for hydration key" on load).
    const spark = (
      <Sparkline data={rotate(kpi.spark, tick())} width={220} height={36} filled class="dash-spark" />
    );
    return (
      <MetricCard
        label={kpi.label}
        value={kpi.value}
        trend={kpi.trend}
        trendDirection={kpi.trendDirection}
        variant={kpi.variant}
      >
        {spark}
      </MetricCard>
    );
  };

  // ── Overview: recent events table ────────────────────────────────────────
  const eventSort = createTableSort<OpsEvent>('time', 'asc');
  const sortedEvents = createMemo(() =>
    eventSort.sort(EVENTS[range()], {
      time: (e) => e.time,
      service: (e) => e.service,
      severity: (e) => e.severity,
      durationMs: (e) => e.durationMs,
    })
  );
  const eventColumns: TableColumn<OpsEvent>[] = [
    { key: 'time', header: 'Time', sortable: true, width: '110px' },
    {
      key: 'service',
      header: 'Service',
      sortable: true,
      width: '140px',
      render: (e) => (
        <Text size="sm" font="mono">
          {e.service}
        </Text>
      ),
    },
    { key: 'event', header: 'Event' },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      width: '120px',
      render: (e) => <Badge variant={SEVERITY_VARIANT[e.severity]}>{e.severity}</Badge>,
    },
    {
      key: 'durationMs',
      header: 'Duration',
      sortable: true,
      width: '110px',
      render: (e) => (
        <Text size="sm" font="mono">
          {formatDuration(e.durationMs)}
        </Text>
      ),
    },
  ];

  // ── Traffic: top pages table ─────────────────────────────────────────────
  const pageSort = createTableSort<PageStat>('views');
  const sortedPages = createMemo(() =>
    pageSort.sort(TOP_PAGES[range()], {
      path: (p) => p.path,
      views: (p) => p.views,
      avgTimeSec: (p) => p.avgTimeSec,
      bouncePct: (p) => p.bouncePct,
    })
  );
  const pageColumns: TableColumn<PageStat>[] = [
    {
      key: 'path',
      header: 'Page',
      sortable: true,
      render: (p) => (
        <Text size="sm" font="mono">
          {p.path}
        </Text>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      width: '110px',
      render: (p) => <span>{formatViews(p.views)}</span>,
    },
    {
      key: 'avgTimeSec',
      header: 'Avg time',
      sortable: true,
      width: '110px',
      render: (p) => <span>{`${Math.floor(p.avgTimeSec / 60)}m ${p.avgTimeSec % 60}s`}</span>,
    },
    {
      key: 'bouncePct',
      header: 'Bounce',
      sortable: true,
      width: '100px',
      render: (p) => (
        <Badge variant={p.bouncePct > 40 ? 'warning' : 'success'}>{p.bouncePct}%</Badge>
      ),
    },
  ];

  // ── Revenue: transactions table ──────────────────────────────────────────
  const txSort = createTableSort<Transaction>('amount');
  const sortedTx = createMemo(() =>
    txSort.sort(TRANSACTIONS, {
      customer: (t) => t.customer,
      plan: (t) => t.plan,
      amount: (t) => t.amount,
      status: (t) => t.status,
    })
  );
  const txColumns: TableColumn<Transaction>[] = [
    { key: 'customer', header: 'Customer', sortable: true },
    { key: 'plan', header: 'Plan', width: '190px' },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      width: '120px',
      render: (t) => (
        <Text size="sm" font="mono">
          ${t.amount.toLocaleString('en-US')}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '110px',
      render: (t) => <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>,
    },
  ];

  const overviewTab = () => (
    <div class="dash-stack">
      <div class="dash-kpis">
        <For each={OVERVIEW_KPIS[range()]}>{kpiCard}</For>
      </div>

      <div class="dash-cols">
        <Card padding="md" class="dash-panel">
          <div class="dash-panel__head">
            <Text weight="semibold">Deploy pipeline — v3.4.1</Text>
            <Badge variant="success">passed · 4m 51s</Badge>
          </div>
          <WaterfallChart
            items={PIPELINE_STAGES.map((s) => ({ ...s }))}
            height={28}
            labelWidth={140}
          />
        </Card>

        <Card padding="md" class="dash-panel">
          <div class="dash-panel__head">
            <Text weight="semibold">Activity</Text>
            <Badge variant="info">live</Badge>
          </div>
          <Timeline
            size="sm"
            steps={ACTIVITY.map((s) => ({
              title: s.title,
              description: s.description,
              meta: s.meta,
              status: s.status,
            }))}
          />
        </Card>
      </div>

      <Card padding="md" class="dash-panel">
        <div class="dash-panel__head">
          <Text weight="semibold">Recent events</Text>
          <Text size="sm" color="muted">
            click a column to sort
          </Text>
        </div>
        <Table
          data={sortedEvents()}
          columns={eventColumns}
          getRowKey={(e) => e.id}
          sortColumn={eventSort.column()}
          sortDirection={eventSort.direction()}
          onSort={eventSort.onSort}
          emptyState="No events in this range"
        />
      </Card>
    </div>
  );

  const trafficTab = () => (
    <div class="dash-stack">
      <div class="dash-kpis dash-kpis--three">
        <For each={TRAFFIC_KPIS[range()]}>{kpiCard}</For>
      </div>

      <Card padding="md" class="dash-panel">
        <div class="dash-panel__head">
          <Text weight="semibold">Requests over time</Text>
          <Text size="sm" color="muted">
            {range() === '24h' ? 'per hour · k req' : 'per day · k req'}
          </Text>
        </div>
        <Sparkline
          data={rotate(TRAFFIC_SERIES[range()], tick())}
          width={800}
          height={140}
          strokeWidth={2}
          filled
          class="dash-spark-lg"
        />
      </Card>

      <Card padding="md" class="dash-panel">
        <div class="dash-panel__head">
          <Text weight="semibold">Top pages</Text>
        </div>
        <Table
          data={sortedPages()}
          columns={pageColumns}
          getRowKey={(p) => p.id}
          sortColumn={pageSort.column()}
          sortDirection={pageSort.direction()}
          onSort={pageSort.onSort}
        />
      </Card>
    </div>
  );

  const revenueTab = () => (
    <div class="dash-stack">
      <div class="dash-kpis dash-kpis--three">
        <For each={REVENUE_KPIS[range()]}>{kpiCard}</For>
      </div>

      <Card padding="md" class="dash-panel">
        <div class="dash-panel__head">
          <Text weight="semibold">MRR bridge — June → July ($K)</Text>
        </div>
        <WaterfallChart
          items={REVENUE_BRIDGE.map((item) => ({
            ...item,
            color:
              item.id === 'churn' || item.id === 'contraction'
                ? 'var(--sk-error)'
                : item.id === 'new' || item.id === 'expansion'
                  ? 'var(--sk-success)'
                  : 'var(--sk-accent)',
          }))}
          height={28}
          labelWidth={140}
        />
      </Card>

      <Card padding="md" class="dash-panel">
        <div class="dash-panel__head">
          <Text weight="semibold">Recent transactions</Text>
        </div>
        <Table
          data={sortedTx()}
          columns={txColumns}
          getRowKey={(t) => t.id}
          sortColumn={txSort.column()}
          sortDirection={txSort.direction()}
          onSort={txSort.onSort}
        />
      </Card>
    </div>
  );

  return (
    <div class="dash-app">
      <header class="dash-header">
        <div class="dash-header__title">
          <Text as="h1" size="xl" weight="semibold">
            Atlas Ops
          </Text>
          <Badge variant="success">production</Badge>
          <Text size="sm" color="muted">
            updated {refreshedAt()}
          </Text>
        </div>
        <div class="dash-header__controls">
          <Select
            options={[...RANGE_OPTIONS]}
            value={range()}
            onChange={(value) => setRange(value as RangeKey)}
          />
          <Button size="sm" variant="secondary" onClick={refresh}>
            ↻ Refresh
          </Button>
        </div>
      </header>

      <Tabs
        value={tab()}
        onChange={setTab}
        class="dash-tabs"
        items={[
          // Contents are passed as lazy function elements (Solid renders them
          // on insert) so unselected tab trees are never created during
          // hydration — eagerly-created-but-not-inserted elements desync
          // hydration keys on prerendered pages. Solid supports function
          // elements at runtime; its JSX.Element type just doesn't name them.
          { value: 'overview', label: 'Overview', content: overviewTab as unknown as JSX.Element },
          { value: 'traffic', label: 'Traffic', content: trafficTab as unknown as JSX.Element },
          { value: 'revenue', label: 'Revenue', content: revenueTab as unknown as JSX.Element },
        ]}
      />
    </div>
  );
}
