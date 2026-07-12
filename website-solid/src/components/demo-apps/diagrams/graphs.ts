/**
 * Graph builders for the Architecture Studio demo — CLIENT-ONLY.
 *
 * `@ybouhjira/diagram-core` is a browser bundle; this module is imported
 * exclusively from the `clientOnly` canvas, never during SSR/prerender.
 * Each builder returns a laid-out-agnostic `Graph`; the chosen layout
 * algorithm is applied by the DiagramProvider.
 */
import { Effect } from 'effect';
import {
  emptyGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  type Graph,
  type LayoutAlgorithm,
} from '@ybouhjira/diagram-core';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { d3ForceLayout } from '@ybouhjira/diagram-core/layout/force/d3-force';
import type { LayoutKind } from './data';

interface NodeSpec {
  id: string;
  label: string;
  shape?: string;
  w?: number;
  h?: number;
  stroke?: string;
  fill?: string;
}
type EdgeSpec = [from: string, to: string, label?: string];

// Category palettes — colored strokes with a translucent fill of the same hue
// read clearly on both light and dark themes (the canvas background follows
// the active theme token).
const C = {
  blue: '#3b82f6',
  violet: '#8b5cf6',
  green: '#22c55e',
  amber: '#eab308',
  red: '#ef4444',
  orange: '#f97316',
  cyan: '#06b6d4',
  pink: '#ec4899',
  slate: '#64748b',
};

function build(id: string, nodes: NodeSpec[], edges: EdgeSpec[]): Graph {
  let g = emptyGraph(id);
  for (const nd of nodes) {
    const stroke = nd.stroke ?? C.slate;
    g = Effect.runSync(
      addNode(
        g,
        createNode(
          nd.id,
          {},
          {
            label: nd.label,
            shape: nd.shape ?? 'rectangle',
            size: { width: nd.w ?? 170, height: nd.h ?? 62 },
            style: { fill: nd.fill ?? `${stroke}22`, stroke },
          }
        )
      )
    );
  }
  edges.forEach(([from, to, label], i) => {
    g = Effect.runSync(
      addEdge(
        g,
        createEdge(
          `${id}-e${i}`,
          from,
          to,
          {},
          label ? { label: { text: label, position: 'center' } } : undefined
        )
      )
    );
  });
  return g;
}

// ── Flows ──────────────────────────────────────────────────────────────
const requestLifecycle = () =>
  build(
    'request-lifecycle',
    [
      { id: 'start', label: 'Request In', shape: 'ellipse', w: 130, h: 56, stroke: C.green },
      { id: 'auth', label: 'Authenticated?', shape: 'diamond', w: 150, h: 96, stroke: C.amber },
      { id: 'rate', label: 'Rate Limit', stroke: C.orange },
      { id: 'validate', label: 'Validate Payload', shape: 'diamond', w: 160, h: 96, stroke: C.amber },
      { id: 'process', label: 'Process', stroke: C.blue },
      { id: 'save', label: 'Persist', shape: 'cylinder', w: 150, h: 78, stroke: C.cyan },
      { id: 'err', label: 'Return 4xx', stroke: C.red },
      { id: 'resp', label: 'Return 200', shape: 'ellipse', w: 130, h: 56, stroke: C.green },
    ],
    [
      ['start', 'auth'],
      ['auth', 'rate', 'yes'],
      ['auth', 'err', 'no'],
      ['rate', 'validate'],
      ['validate', 'process', 'ok'],
      ['validate', 'err', 'invalid'],
      ['process', 'save'],
      ['save', 'resp'],
    ]
  );

const authFlow = () =>
  build(
    'auth-flow',
    [
      { id: 'user', label: 'User', shape: 'ellipse', w: 120, h: 54, stroke: C.green },
      { id: 'app', label: 'Client App', stroke: C.blue },
      { id: 'gw', label: 'Auth Gateway', shape: 'hexagon', w: 170, h: 70, stroke: C.violet },
      { id: 'idp', label: 'Identity Provider', stroke: C.violet },
      { id: 'consent', label: 'Grant Consent?', shape: 'diamond', w: 160, h: 96, stroke: C.amber },
      { id: 'token', label: 'Issue Tokens', stroke: C.blue },
      { id: 'store', label: 'Session Store', shape: 'cylinder', w: 160, h: 78, stroke: C.cyan },
      { id: 'deny', label: 'Access Denied', stroke: C.red },
    ],
    [
      ['user', 'app'],
      ['app', 'gw', 'login'],
      ['gw', 'idp', 'redirect'],
      ['idp', 'consent'],
      ['consent', 'token', 'yes'],
      ['consent', 'deny', 'no'],
      ['token', 'store'],
      ['store', 'app', 'session'],
    ]
  );

const checkout = () =>
  build(
    'checkout',
    [
      { id: 'cart', label: 'Cart', shape: 'ellipse', w: 110, h: 54, stroke: C.green },
      { id: 'address', label: 'Shipping Info', stroke: C.blue },
      { id: 'stock', label: 'In Stock?', shape: 'diamond', w: 150, h: 92, stroke: C.amber },
      { id: 'pay', label: 'Payment', stroke: C.blue },
      { id: 'fraud', label: 'Fraud Check', shape: 'hexagon', w: 160, h: 70, stroke: C.violet },
      { id: 'backorder', label: 'Back-order', stroke: C.orange },
      { id: 'decline', label: 'Declined', stroke: C.red },
      { id: 'order', label: 'Create Order', shape: 'cylinder', w: 160, h: 78, stroke: C.cyan },
      { id: 'done', label: 'Confirmation', shape: 'ellipse', w: 140, h: 54, stroke: C.green },
    ],
    [
      ['cart', 'address'],
      ['address', 'stock'],
      ['stock', 'pay', 'yes'],
      ['stock', 'backorder', 'no'],
      ['pay', 'fraud'],
      ['fraud', 'order', 'pass'],
      ['fraud', 'decline', 'flagged'],
      ['order', 'done'],
    ]
  );

// ── Architecture ───────────────────────────────────────────────────────
const microservices = () =>
  build(
    'microservices',
    [
      { id: 'web', label: 'Web App', stroke: C.green },
      { id: 'mobile', label: 'Mobile App', stroke: C.green },
      { id: 'gw', label: 'API Gateway', shape: 'hexagon', w: 170, h: 70, stroke: C.violet },
      { id: 'users', label: 'Users Service', stroke: C.blue },
      { id: 'orders', label: 'Orders Service', stroke: C.blue },
      { id: 'catalog', label: 'Catalog Service', stroke: C.blue },
      { id: 'payments', label: 'Payments Service', stroke: C.blue },
      { id: 'udb', label: 'Users DB', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
      { id: 'odb', label: 'Orders DB', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
      { id: 'cdb', label: 'Catalog DB', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
      { id: 'bus', label: 'Event Bus', shape: 'parallelogram', w: 170, h: 66, stroke: C.pink },
    ],
    [
      ['web', 'gw'],
      ['mobile', 'gw'],
      ['gw', 'users'],
      ['gw', 'orders'],
      ['gw', 'catalog'],
      ['gw', 'payments'],
      ['users', 'udb'],
      ['orders', 'odb'],
      ['catalog', 'cdb'],
      ['orders', 'bus'],
      ['payments', 'bus'],
      ['bus', 'users'],
    ]
  );

const eventDriven = () =>
  build(
    'event-driven',
    [
      { id: 'api', label: 'API', shape: 'hexagon', w: 130, h: 64, stroke: C.violet },
      { id: 'orderp', label: 'Order Producer', stroke: C.blue },
      { id: 'stockp', label: 'Stock Producer', stroke: C.blue },
      { id: 'bus', label: 'Message Bus', shape: 'parallelogram', w: 180, h: 66, stroke: C.pink },
      { id: 'email', label: 'Email Consumer', stroke: C.orange },
      { id: 'ship', label: 'Shipping Consumer', stroke: C.orange },
      { id: 'analytics', label: 'Analytics Consumer', stroke: C.orange },
      { id: 'warehouse', label: 'Warehouse', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
    ],
    [
      ['api', 'orderp'],
      ['api', 'stockp'],
      ['orderp', 'bus'],
      ['stockp', 'bus'],
      ['bus', 'email'],
      ['bus', 'ship'],
      ['bus', 'analytics'],
      ['analytics', 'warehouse'],
    ]
  );

// ── Networks ───────────────────────────────────────────────────────────
const networkTopology = () =>
  build(
    'network-topology',
    [
      { id: 'fw', label: 'Firewall', shape: 'hexagon', w: 150, h: 66, stroke: C.red },
      { id: 'lb', label: 'Load Balancer', shape: 'diamond', w: 160, h: 92, stroke: C.orange },
      { id: 'web1', label: 'Web 1', stroke: C.blue },
      { id: 'web2', label: 'Web 2', stroke: C.blue },
      { id: 'web3', label: 'Web 3', stroke: C.blue },
      { id: 'cache', label: 'Redis Cache', shape: 'diamond', w: 150, h: 88, stroke: C.green },
      { id: 'db1', label: 'Primary DB', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
      { id: 'db2', label: 'Replica DB', shape: 'cylinder', w: 150, h: 76, stroke: C.cyan },
    ],
    [
      ['fw', 'lb'],
      ['lb', 'web1'],
      ['lb', 'web2'],
      ['lb', 'web3'],
      ['web1', 'cache'],
      ['web2', 'cache'],
      ['web3', 'cache'],
      ['web1', 'db1'],
      ['web2', 'db1'],
      ['web3', 'db1'],
      ['db1', 'db2', 'replicate'],
    ]
  );

const serviceMesh = () =>
  build(
    'service-mesh',
    [
      { id: 'cp', label: 'Control Plane', shape: 'hexagon', w: 170, h: 70, stroke: C.violet },
      { id: 'ingress', label: 'Ingress', stroke: C.green },
      { id: 'sa', label: 'Service A', stroke: C.blue },
      { id: 'sb', label: 'Service B', stroke: C.blue },
      { id: 'sc', label: 'Service C', stroke: C.blue },
      { id: 'sd', label: 'Service D', stroke: C.blue },
      { id: 'pa', label: 'Proxy A', shape: 'diamond', w: 120, h: 76, stroke: C.orange },
      { id: 'pb', label: 'Proxy B', shape: 'diamond', w: 120, h: 76, stroke: C.orange },
      { id: 'pc', label: 'Proxy C', shape: 'diamond', w: 120, h: 76, stroke: C.orange },
      { id: 'pd', label: 'Proxy D', shape: 'diamond', w: 120, h: 76, stroke: C.orange },
    ],
    [
      ['ingress', 'pa'],
      ['pa', 'sa'],
      ['pb', 'sb'],
      ['pc', 'sc'],
      ['pd', 'sd'],
      ['pa', 'pb', 'mTLS'],
      ['pb', 'pc', 'mTLS'],
      ['pc', 'pd', 'mTLS'],
      ['cp', 'pa'],
      ['cp', 'pb'],
      ['cp', 'pc'],
      ['cp', 'pd'],
    ]
  );

// ── Pipelines ──────────────────────────────────────────────────────────
const cicd = () =>
  build(
    'cicd',
    [
      { id: 'commit', label: 'Commit', shape: 'ellipse', w: 120, h: 54, stroke: C.green },
      { id: 'build', label: 'Build', stroke: C.blue },
      { id: 'unit', label: 'Unit Tests', stroke: C.blue },
      { id: 'scan', label: 'Security Scan', shape: 'hexagon', w: 160, h: 66, stroke: C.violet },
      { id: 'gate', label: 'Quality Gate', shape: 'diamond', w: 150, h: 92, stroke: C.amber },
      { id: 'stage', label: 'Deploy Staging', stroke: C.orange },
      { id: 'e2e', label: 'E2E Tests', stroke: C.blue },
      { id: 'prod', label: 'Deploy Prod', shape: 'cylinder', w: 160, h: 76, stroke: C.cyan },
      { id: 'fail', label: 'Fail Build', shape: 'ellipse', w: 130, h: 54, stroke: C.red },
    ],
    [
      ['commit', 'build'],
      ['build', 'unit'],
      ['unit', 'scan'],
      ['scan', 'gate'],
      ['gate', 'stage', 'pass'],
      ['gate', 'fail', 'block'],
      ['stage', 'e2e'],
      ['e2e', 'prod', 'green'],
    ]
  );

const etl = () =>
  build(
    'etl',
    [
      { id: 'src1', label: 'Postgres', shape: 'cylinder', w: 140, h: 74, stroke: C.cyan },
      { id: 'src2', label: 'Events API', stroke: C.green },
      { id: 'src3', label: 'CSV Drops', shape: 'parallelogram', w: 150, h: 62, stroke: C.pink },
      { id: 'ingest', label: 'Ingest', stroke: C.blue },
      { id: 'clean', label: 'Clean & Dedupe', stroke: C.blue },
      { id: 'transform', label: 'Transform', stroke: C.blue },
      { id: 'validate', label: 'Quality?', shape: 'diamond', w: 140, h: 88, stroke: C.amber },
      { id: 'quarantine', label: 'Quarantine', stroke: C.red },
      { id: 'warehouse', label: 'Warehouse', shape: 'cylinder', w: 160, h: 78, stroke: C.cyan },
      { id: 'lake', label: 'Data Lake', shape: 'cylinder', w: 150, h: 78, stroke: C.cyan },
    ],
    [
      ['src1', 'ingest'],
      ['src2', 'ingest'],
      ['src3', 'ingest'],
      ['ingest', 'clean'],
      ['clean', 'transform'],
      ['transform', 'validate'],
      ['validate', 'warehouse', 'pass'],
      ['validate', 'quarantine', 'fail'],
      ['transform', 'lake', 'raw'],
    ]
  );

// ── Org & State ────────────────────────────────────────────────────────
const orgChart = () =>
  build(
    'org-chart',
    [
      { id: 'cto', label: 'CTO', shape: 'hexagon', w: 130, h: 64, stroke: C.violet },
      { id: 'veng', label: 'VP Engineering', stroke: C.blue },
      { id: 'vdesign', label: 'VP Design', stroke: C.pink },
      { id: 'vprod', label: 'VP Product', stroke: C.green },
      { id: 'plat', label: 'Platform Lead', stroke: C.blue },
      { id: 'apps', label: 'Apps Lead', stroke: C.blue },
      { id: 'ux', label: 'UX Lead', stroke: C.pink },
      { id: 'pm1', label: 'PM — Growth', stroke: C.green },
      { id: 'pm2', label: 'PM — Core', stroke: C.green },
    ],
    [
      ['cto', 'veng'],
      ['cto', 'vdesign'],
      ['cto', 'vprod'],
      ['veng', 'plat'],
      ['veng', 'apps'],
      ['vdesign', 'ux'],
      ['vprod', 'pm1'],
      ['vprod', 'pm2'],
    ]
  );

const orderState = () =>
  build(
    'order-state',
    [
      { id: 'placed', label: 'Placed', shape: 'ellipse', w: 120, h: 54, stroke: C.green },
      { id: 'paid', label: 'Paid', stroke: C.blue },
      { id: 'packed', label: 'Packed', stroke: C.blue },
      { id: 'shipped', label: 'Shipped', stroke: C.orange },
      { id: 'delivered', label: 'Delivered', shape: 'ellipse', w: 130, h: 54, stroke: C.green },
      { id: 'cancelled', label: 'Cancelled', shape: 'ellipse', w: 130, h: 54, stroke: C.red },
      { id: 'refunded', label: 'Refunded', shape: 'ellipse', w: 130, h: 54, stroke: C.red },
    ],
    [
      ['placed', 'paid', 'pay'],
      ['placed', 'cancelled', 'cancel'],
      ['paid', 'packed'],
      ['paid', 'refunded', 'refund'],
      ['packed', 'shipped'],
      ['shipped', 'delivered'],
      ['delivered', 'refunded', 'return'],
    ]
  );

const BUILDERS: Record<string, () => Graph> = {
  'request-lifecycle': requestLifecycle,
  'auth-flow': authFlow,
  checkout,
  microservices,
  'event-driven': eventDriven,
  'network-topology': networkTopology,
  'service-mesh': serviceMesh,
  cicd,
  etl,
  'org-chart': orgChart,
  'order-state': orderState,
};

export function buildGraph(id: string): Graph {
  return (BUILDERS[id] ?? requestLifecycle)();
}

export function graphStats(g: Graph): { nodes: number; edges: number } {
  return { nodes: g.nodes.size, edges: g.edges.size };
}

/** Map a layout kind to a configured diagram-core algorithm. */
export function layoutFor(kind: LayoutKind): LayoutAlgorithm<unknown> {
  if (kind === 'force') return d3ForceLayout as LayoutAlgorithm<unknown>;
  const direction = kind === 'LR' ? 'LR' : 'TB';
  const dagre = dagreLayout as LayoutAlgorithm<unknown>;
  return {
    ...dagre,
    layout: (g, _opts) =>
      dagre.layout(g, { direction, nodeSpacing: 55, rankSpacing: 90 }),
  };
}
