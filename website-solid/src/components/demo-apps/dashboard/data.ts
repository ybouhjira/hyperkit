/**
 * Seed data for the Ops Dashboard demo. Three time ranges drive every KPI,
 * sparkline and table so the range selector visibly changes the whole surface.
 * All numbers are deterministic — no Math.random — so prerender and hydration
 * agree.
 */

export type RangeKey = '24h' | '7d' | '30d';

export interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly trendDirection: 'up' | 'down' | 'neutral';
  readonly variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  readonly spark: readonly number[];
}

export interface OpsEvent {
  readonly id: string;
  readonly time: string;
  readonly service: string;
  readonly event: string;
  readonly severity: 'info' | 'warning' | 'critical' | 'resolved';
  readonly durationMs: number;
}

export interface PageStat {
  readonly id: string;
  readonly path: string;
  readonly views: number;
  readonly avgTimeSec: number;
  readonly bouncePct: number;
}

export interface Transaction {
  readonly id: string;
  readonly customer: string;
  readonly plan: string;
  readonly amount: number;
  readonly status: 'paid' | 'pending' | 'failed';
}

export const OVERVIEW_KPIS: Readonly<Record<RangeKey, readonly Kpi[]>> = {
  '24h': [
    {
      label: 'Requests',
      value: '1.24M',
      trend: '+8.2% vs yesterday',
      trendDirection: 'up',
      variant: 'default',
      spark: [42, 48, 45, 52, 61, 58, 66, 71, 68, 75, 82, 79, 88, 92, 86, 94],
    },
    {
      label: 'Error rate',
      value: '0.42%',
      trend: '-0.11pt',
      trendDirection: 'down',
      variant: 'success',
      spark: [0.9, 0.8, 0.85, 0.7, 0.65, 0.6, 0.58, 0.52, 0.55, 0.49, 0.45, 0.42],
    },
    {
      label: 'P95 latency',
      value: '184ms',
      trend: '+12ms',
      trendDirection: 'up',
      variant: 'warning',
      spark: [150, 155, 148, 162, 158, 171, 165, 178, 172, 180, 176, 184],
    },
    {
      label: 'Active users',
      value: '8,412',
      trend: '+312',
      trendDirection: 'up',
      variant: 'accent',
      spark: [61, 64, 66, 63, 70, 74, 72, 78, 81, 79, 84, 88],
    },
  ],
  '7d': [
    {
      label: 'Requests',
      value: '8.61M',
      trend: '+4.6% vs last week',
      trendDirection: 'up',
      variant: 'default',
      spark: [58, 63, 61, 67, 72, 69, 76],
    },
    {
      label: 'Error rate',
      value: '0.51%',
      trend: '+0.06pt',
      trendDirection: 'up',
      variant: 'danger',
      spark: [0.42, 0.44, 0.47, 0.5, 0.46, 0.49, 0.51],
    },
    {
      label: 'P95 latency',
      value: '172ms',
      trend: '-9ms',
      trendDirection: 'down',
      variant: 'success',
      spark: [188, 182, 179, 176, 174, 175, 172],
    },
    {
      label: 'Active users',
      value: '31,209',
      trend: '+1,204',
      trendDirection: 'up',
      variant: 'accent',
      spark: [24, 26, 27, 29, 28, 31, 33],
    },
  ],
  '30d': [
    {
      label: 'Requests',
      value: '36.8M',
      trend: '+11.3% vs last month',
      trendDirection: 'up',
      variant: 'default',
      spark: [40, 44, 43, 47, 51, 49, 55, 58, 56, 62, 66, 64, 70, 74, 78],
    },
    {
      label: 'Error rate',
      value: '0.47%',
      trend: '-0.09pt',
      trendDirection: 'down',
      variant: 'success',
      spark: [0.61, 0.58, 0.6, 0.55, 0.52, 0.54, 0.5, 0.48, 0.49, 0.47],
    },
    {
      label: 'P95 latency',
      value: '178ms',
      trend: '±0ms',
      trendDirection: 'neutral',
      variant: 'default',
      spark: [176, 181, 178, 183, 177, 180, 175, 179, 178, 178],
    },
    {
      label: 'Active users',
      value: '112,540',
      trend: '+8,911',
      trendDirection: 'up',
      variant: 'accent',
      spark: [18, 20, 22, 21, 24, 26, 25, 28, 31, 30, 33, 36],
    },
  ],
};

/** Deploy pipeline stage timings (seconds from pipeline start). */
export const PIPELINE_STAGES = [
  { id: 'checkout', label: 'Checkout', start: 0, end: 14 },
  { id: 'install', label: 'pnpm install', start: 14, end: 66 },
  { id: 'build', label: 'Build packages', start: 66, end: 158 },
  { id: 'test', label: 'Test (2,185)', start: 96, end: 214 },
  { id: 'prerender', label: 'Prerender site', start: 214, end: 262 },
  { id: 'deploy', label: 'Deploy + purge CDN', start: 262, end: 291 },
] as const;

export interface ActivityStep {
  readonly title: string;
  readonly description: string;
  readonly meta: string;
  readonly status: 'completed' | 'active' | 'pending';
}

export const ACTIVITY: readonly ActivityStep[] = [
  {
    title: 'v3.4.1 deployed to production',
    description: 'Rollout finished across all 6 regions, error budget untouched.',
    meta: '09:41 · deploy-bot',
    status: 'completed',
  },
  {
    title: 'P95 alert acknowledged',
    description: 'eu-west-1 latency spike traced to a cold Redis replica.',
    meta: '10:12 · sara',
    status: 'completed',
  },
  {
    title: 'Database migration running',
    description: 'Backfilling issue_events partition 14/22 — throttled to 2k rows/s.',
    meta: '10:58 · migration-runner',
    status: 'active',
  },
  {
    title: 'Canary: search-index v2',
    description: 'Waiting on 30d error-rate gate before ramping past 5%.',
    meta: 'scheduled 14:00',
    status: 'pending',
  },
];

export const EVENTS: Readonly<Record<RangeKey, readonly OpsEvent[]>> = {
  '24h': [
    { id: 'e1', time: '11:02', service: 'api-gateway', event: 'Deploy v3.4.1 completed', severity: 'info', durationMs: 291_000 },
    { id: 'e2', time: '10:47', service: 'search', event: 'Index rebuild finished', severity: 'resolved', durationMs: 512_000 },
    { id: 'e3', time: '10:12', service: 'redis-eu', event: 'P95 latency above 250ms', severity: 'warning', durationMs: 840_000 },
    { id: 'e4', time: '09:38', service: 'billing', event: 'Webhook retries exhausted (stripe)', severity: 'critical', durationMs: 45_000 },
    { id: 'e5', time: '08:55', service: 'auth', event: 'Token rotation completed', severity: 'info', durationMs: 12_000 },
    { id: 'e6', time: '07:21', service: 'workers', event: 'Queue depth back under 1k', severity: 'resolved', durationMs: 1_260_000 },
  ],
  '7d': [
    { id: 'e7', time: 'Fri 16:40', service: 'api-gateway', event: 'Rate-limit rule shipped', severity: 'info', durationMs: 30_000 },
    { id: 'e8', time: 'Thu 03:12', service: 'postgres', event: 'Failover drill completed', severity: 'resolved', durationMs: 424_000 },
    { id: 'e9', time: 'Wed 11:05', service: 'cdn', event: 'Cache hit ratio below 90%', severity: 'warning', durationMs: 7_200_000 },
    { id: 'e10', time: 'Tue 22:47', service: 'billing', event: 'Invoice run: 4,112 invoices', severity: 'info', durationMs: 1_800_000 },
    { id: 'e11', time: 'Mon 09:15', service: 'search', event: 'OOM on index shard 3', severity: 'critical', durationMs: 300_000 },
    { id: 'e12', time: 'Mon 09:44', service: 'search', event: 'Shard 3 rebalanced', severity: 'resolved', durationMs: 1_740_000 },
  ],
  '30d': [
    { id: 'e13', time: 'Jul 08', service: 'platform', event: 'Kubernetes 1.31 upgrade', severity: 'info', durationMs: 10_800_000 },
    { id: 'e14', time: 'Jul 03', service: 'postgres', event: 'Storage autoscaled to 2TB', severity: 'info', durationMs: 60_000 },
    { id: 'e15', time: 'Jun 27', service: 'api-gateway', event: 'Regional outage eu-central', severity: 'critical', durationMs: 2_520_000 },
    { id: 'e16', time: 'Jun 27', service: 'api-gateway', event: 'Traffic rerouted, recovered', severity: 'resolved', durationMs: 2_520_000 },
    { id: 'e17', time: 'Jun 21', service: 'auth', event: 'MFA enforcement enabled', severity: 'info', durationMs: 5_000 },
    { id: 'e18', time: 'Jun 15', service: 'cdn', event: 'Image pipeline v2 rollout', severity: 'info', durationMs: 3_600_000 },
  ],
};

export const TRAFFIC_KPIS: Readonly<Record<RangeKey, readonly Kpi[]>> = {
  '24h': [
    {
      label: 'Page views',
      value: '412K',
      trend: '+6.1%',
      trendDirection: 'up',
      variant: 'default',
      spark: [20, 24, 22, 28, 32, 30, 36, 41, 38, 45, 43, 48],
    },
    {
      label: 'Unique visitors',
      value: '96,204',
      trend: '+2.4%',
      trendDirection: 'up',
      variant: 'accent',
      spark: [12, 13, 15, 14, 17, 19, 18, 21, 23, 22, 25, 27],
    },
    {
      label: 'Bounce rate',
      value: '38.2%',
      trend: '-1.9pt',
      trendDirection: 'down',
      variant: 'success',
      spark: [44, 43, 42, 43, 41, 40, 41, 39, 40, 39, 38, 38],
    },
  ],
  '7d': [
    {
      label: 'Page views',
      value: '2.86M',
      trend: '+9.8%',
      trendDirection: 'up',
      variant: 'default',
      spark: [31, 34, 33, 38, 41, 39, 46],
    },
    {
      label: 'Unique visitors',
      value: '541K',
      trend: '+4.0%',
      trendDirection: 'up',
      variant: 'accent',
      spark: [18, 19, 21, 20, 23, 24, 26],
    },
    {
      label: 'Bounce rate',
      value: '39.7%',
      trend: '+0.4pt',
      trendDirection: 'up',
      variant: 'warning',
      spark: [39, 38, 40, 39, 41, 40, 40],
    },
  ],
  '30d': [
    {
      label: 'Page views',
      value: '11.9M',
      trend: '+14.2%',
      trendDirection: 'up',
      variant: 'default',
      spark: [22, 25, 24, 28, 31, 30, 35, 38, 36, 42, 45, 44, 49, 52, 56],
    },
    {
      label: 'Unique visitors',
      value: '2.21M',
      trend: '+7.7%',
      trendDirection: 'up',
      variant: 'accent',
      spark: [14, 15, 17, 16, 19, 21, 20, 23, 25, 24, 27, 29],
    },
    {
      label: 'Bounce rate',
      value: '37.5%',
      trend: '-2.6pt',
      trendDirection: 'down',
      variant: 'success',
      spark: [43, 42, 41, 42, 40, 39, 40, 38, 39, 38, 37, 38],
    },
  ],
};

/** Hourly request series for the big traffic chart, per range. */
export const TRAFFIC_SERIES: Readonly<Record<RangeKey, readonly number[]>> = {
  '24h': [
    3.1, 2.4, 1.9, 1.6, 1.4, 1.8, 2.6, 4.2, 6.8, 8.4, 9.2, 9.8, 10.4, 10.1, 9.6, 9.9, 10.8, 11.4,
    10.6, 9.2, 7.8, 6.4, 5.1, 4.2,
  ],
  '7d': [64, 71, 69, 78, 84, 52, 47, 66, 74, 72, 81, 88, 55, 49],
  '30d': [
    41, 44, 43, 47, 45, 39, 36, 46, 49, 48, 52, 50, 42, 38, 51, 54, 53, 57, 55, 46, 43, 56, 59,
    58, 62, 60, 49, 47, 63, 66,
  ],
};

export const TOP_PAGES: Readonly<Record<RangeKey, readonly PageStat[]>> = {
  '24h': [
    { id: 'p1', path: '/docs/components', views: 48_211, avgTimeSec: 164, bouncePct: 22 },
    { id: 'p2', path: '/', views: 39_402, avgTimeSec: 48, bouncePct: 51 },
    { id: 'p3', path: '/docs/getting-started/installation', views: 21_876, avgTimeSec: 201, bouncePct: 18 },
    { id: 'p4', path: '/demos', views: 18_344, avgTimeSec: 312, bouncePct: 12 },
    { id: 'p5', path: '/docs/theming', views: 9_921, avgTimeSec: 246, bouncePct: 15 },
  ],
  '7d': [
    { id: 'p1', path: '/docs/components', views: 322_480, avgTimeSec: 158, bouncePct: 24 },
    { id: 'p2', path: '/', views: 268_119, avgTimeSec: 52, bouncePct: 49 },
    { id: 'p4', path: '/demos', views: 141_202, avgTimeSec: 298, bouncePct: 13 },
    { id: 'p3', path: '/docs/getting-started/installation', views: 132_665, avgTimeSec: 194, bouncePct: 19 },
    { id: 'p6', path: '/docs/effect-services', views: 61_040, avgTimeSec: 274, bouncePct: 16 },
  ],
  '30d': [
    { id: 'p1', path: '/docs/components', views: 1_301_224, avgTimeSec: 149, bouncePct: 26 },
    { id: 'p2', path: '/', views: 1_106_478, avgTimeSec: 55, bouncePct: 48 },
    { id: 'p4', path: '/demos', views: 588_960, avgTimeSec: 288, bouncePct: 14 },
    { id: 'p3', path: '/docs/getting-started/installation', views: 512_330, avgTimeSec: 189, bouncePct: 20 },
    { id: 'p7', path: '/docs/navigation-framework', views: 244_781, avgTimeSec: 331, bouncePct: 11 },
  ],
};

export const REVENUE_KPIS: Readonly<Record<RangeKey, readonly Kpi[]>> = {
  '24h': [
    {
      label: 'Revenue today',
      value: '$18,204',
      trend: '+$1,890',
      trendDirection: 'up',
      variant: 'success',
      spark: [4, 5, 4, 6, 7, 6, 8, 9, 8, 10, 11, 12],
    },
    {
      label: 'New subscriptions',
      value: '61',
      trend: '+9',
      trendDirection: 'up',
      variant: 'accent',
      spark: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8],
    },
    {
      label: 'Failed payments',
      value: '4',
      trend: '+2',
      trendDirection: 'up',
      variant: 'danger',
      spark: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    },
  ],
  '7d': [
    {
      label: 'Revenue (7d)',
      value: '$121,660',
      trend: '+5.2%',
      trendDirection: 'up',
      variant: 'success',
      spark: [14, 16, 15, 18, 19, 17, 21],
    },
    {
      label: 'New subscriptions',
      value: '388',
      trend: '+41',
      trendDirection: 'up',
      variant: 'accent',
      spark: [48, 52, 50, 57, 61, 55, 65],
    },
    {
      label: 'Churned seats',
      value: '57',
      trend: '-12',
      trendDirection: 'down',
      variant: 'success',
      spark: [12, 11, 10, 9, 8, 9, 8],
    },
  ],
  '30d': [
    {
      label: 'MRR',
      value: '$486,210',
      trend: '+3.9%',
      trendDirection: 'up',
      variant: 'success',
      spark: [40, 41, 42, 41, 43, 44, 45, 44, 46, 47, 48, 49],
    },
    {
      label: 'Net new ARR',
      value: '$212K',
      trend: '+18%',
      trendDirection: 'up',
      variant: 'accent',
      spark: [10, 12, 11, 14, 15, 13, 17, 18, 16, 19, 21, 22],
    },
    {
      label: 'Churn',
      value: '1.8%',
      trend: '-0.3pt',
      trendDirection: 'down',
      variant: 'success',
      spark: [2.6, 2.5, 2.4, 2.5, 2.3, 2.2, 2.1, 2.2, 2.0, 1.9, 1.9, 1.8],
    },
  ],
};

/** Monthly revenue bridge ($K) rendered as a waterfall. */
export const REVENUE_BRIDGE = [
  { id: 'start', label: 'MRR (June)', start: 0, end: 468 },
  { id: 'new', label: 'New business', start: 468, end: 496 },
  { id: 'expansion', label: 'Expansion', start: 496, end: 511 },
  { id: 'contraction', label: 'Contraction', start: 502, end: 511 },
  { id: 'churn', label: 'Churn', start: 486, end: 502 },
  { id: 'end', label: 'MRR (July)', start: 0, end: 486 },
] as const;

export const TRANSACTIONS: readonly Transaction[] = [
  { id: 't1', customer: 'Northwind Robotics', plan: 'Enterprise · annual', amount: 28_800, status: 'paid' },
  { id: 't2', customer: 'Fjord Analytics', plan: 'Team · monthly', amount: 1_140, status: 'paid' },
  { id: 't3', customer: 'Casablanca Cloud', plan: 'Team · annual', amount: 11_400, status: 'pending' },
  { id: 't4', customer: 'Beacon Health', plan: 'Enterprise · annual', amount: 43_200, status: 'paid' },
  { id: 't5', customer: 'Playa Games', plan: 'Starter · monthly', amount: 190, status: 'failed' },
  { id: 't6', customer: 'Atlas Freight', plan: 'Team · monthly', amount: 1_520, status: 'paid' },
];
