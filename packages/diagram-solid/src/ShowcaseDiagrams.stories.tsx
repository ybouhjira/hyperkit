import type { Meta, StoryObj } from 'storybook-solidjs';
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
import { elkLayout } from '@ybouhjira/diagram-core/layout/hierarchical/elk';
import { d3ForceLayout } from '@ybouhjira/diagram-core/layout/force/d3-force';
import { DiagramProvider, Diagram, Controls, MiniMap } from './index';

// ── Shared container style (dark theme) ─────────────────────────────────────
const containerStyle = (w = 1000, h = 700) => ({
  position: 'relative' as const,
  width: `${w}px`,
  height: `${h}px`,
  border: '1px solid var(--sk-border)',
  'border-radius': '12px',
  overflow: 'hidden',
  background: 'var(--sk-bg-primary)',
});

// ── ELK TB layout preset ─────────────────────────────────────────────────────
const elkTB = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, {
      algorithm: 'layered', direction: 'TB', nodeSpacing: 60, rankSpacing: 100,
      edgeRouting: 'orthogonal', nodePlacement: 'NETWORK_SIMPLEX',
    }),
} as LayoutAlgorithm<unknown>;

// ── ELK force layout preset ──────────────────────────────────────────────────
const elkForce = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, { algorithm: 'force', nodeSpacing: 80, rankSpacing: 120 }),
} as LayoutAlgorithm<unknown>;

// ── ELK mrtree layout preset (top-down tree) ─────────────────────────────────
const elkTree = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, { algorithm: 'mrtree', direction: 'TB', nodeSpacing: 60, rankSpacing: 120 }),
} as LayoutAlgorithm<unknown>;

// ── ELK radial layout preset ─────────────────────────────────────────────────
const elkRadial = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, { algorithm: 'radial', nodeSpacing: 60, rankSpacing: 120 }),
} as LayoutAlgorithm<unknown>;

// ───────────────────────────────────────────────────────────────────────────
// Story 1 — Business Process Flowchart
// ───────────────────────────────────────────────────────────────────────────

const buildBusinessFlowchart = () => {
  let g = emptyGraph('biz-flow');

  // Start / End terminators
  g = Effect.runSync(addNode(g, createNode('start', {}, {
    label: 'Start',
    shape: 'ellipse',
    size: { width: 120, height: 56 },
    style: { fill: '#14532d', stroke: '#22c55e', strokeWidth: 2 },
  })));

  // Process nodes
  g = Effect.runSync(addNode(g, createNode('receive', {}, {
    label: 'Receive Order',
    shape: 'rectangle',
    size: { width: 180, height: 64 },
    style: { fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 1.5 },
  })));

  // Decision: Validate
  g = Effect.runSync(addNode(g, createNode('validate', {}, {
    label: 'Validate\nOrder?',
    shape: 'diamond',
    size: { width: 150, height: 100 },
    style: { fill: '#422006', stroke: '#f97316', strokeWidth: 2 },
  })));

  // Rejection path
  g = Effect.runSync(addNode(g, createNode('reject', {}, {
    label: 'Reject Order',
    shape: 'rectangle',
    size: { width: 165, height: 60 },
    style: { fill: '#450a0a', stroke: '#ef4444', strokeWidth: 1.5 },
  })));

  g = Effect.runSync(addNode(g, createNode('notify-reject', {}, {
    label: 'Notify Customer\n(Rejection)',
    shape: 'rectangle',
    size: { width: 185, height: 64 },
    style: { fill: '#450a0a', stroke: '#f87171', strokeWidth: 1.5 },
  })));

  // Inventory check
  g = Effect.runSync(addNode(g, createNode('check-inv', {}, {
    label: 'Check\nInventory',
    shape: 'rectangle',
    size: { width: 165, height: 64 },
    style: { fill: '#1e293b', stroke: '#64748b', strokeWidth: 1.5 },
  })));

  // Decision: In Stock
  g = Effect.runSync(addNode(g, createNode('in-stock', {}, {
    label: 'In Stock?',
    shape: 'diamond',
    size: { width: 140, height: 90 },
    style: { fill: '#422006', stroke: '#f97316', strokeWidth: 2 },
  })));

  // Backorder path
  g = Effect.runSync(addNode(g, createNode('backorder', {}, {
    label: 'Create Backorder',
    shape: 'rectangle',
    size: { width: 175, height: 60 },
    style: { fill: '#2d1d00', stroke: '#d97706', strokeWidth: 1.5 },
  })));

  // Main fulfillment path
  g = Effect.runSync(addNode(g, createNode('payment', {}, {
    label: 'Process Payment',
    shape: 'rectangle',
    size: { width: 175, height: 64 },
    style: { fill: '#1a1a2e', stroke: '#818cf8', strokeWidth: 1.5 },
  })));

  g = Effect.runSync(addNode(g, createNode('ship', {}, {
    label: 'Ship Order',
    shape: 'rectangle',
    size: { width: 165, height: 64 },
    style: { fill: '#0d2d1e', stroke: '#34d399', strokeWidth: 1.5 },
  })));

  g = Effect.runSync(addNode(g, createNode('notify-ok', {}, {
    label: 'Notify Customer\n(Shipped)',
    shape: 'rectangle',
    size: { width: 185, height: 64 },
    style: { fill: '#0d2d1e', stroke: '#6ee7b7', strokeWidth: 1.5 },
  })));

  g = Effect.runSync(addNode(g, createNode('end', {}, {
    label: 'End',
    shape: 'ellipse',
    size: { width: 120, height: 56 },
    style: { fill: '#450a0a', stroke: '#dc2626', strokeWidth: 2 },
  })));

  // Edges — main happy path
  g = Effect.runSync(addEdge(g, createEdge('e1', 'start', 'receive', {})));
  g = Effect.runSync(addEdge(g, createEdge('e2', 'receive', 'validate', {})));
  g = Effect.runSync(addEdge(g, createEdge('e3', 'validate', 'check-inv', {}, {
    label: { text: 'Valid', position: 'center' },
    style: { stroke: '#22c55e' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e4', 'check-inv', 'in-stock', {})));
  g = Effect.runSync(addEdge(g, createEdge('e5', 'in-stock', 'payment', {}, {
    label: { text: 'Yes', position: 'center' },
    style: { stroke: '#22c55e' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e6', 'payment', 'ship', {})));
  g = Effect.runSync(addEdge(g, createEdge('e7', 'ship', 'notify-ok', {})));
  g = Effect.runSync(addEdge(g, createEdge('e8', 'notify-ok', 'end', {})));

  // Edges — validation failure path (dashed)
  g = Effect.runSync(addEdge(g, createEdge('e9', 'validate', 'reject', {}, {
    label: { text: 'Invalid', position: 'center' },
    style: { strokeDasharray: '6,4', stroke: '#ef4444' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e10', 'reject', 'notify-reject', {}, {
    style: { strokeDasharray: '6,4', stroke: '#ef4444' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e11', 'notify-reject', 'end', {}, {
    style: { strokeDasharray: '6,4', stroke: '#f87171' },
  })));

  // Edges — out of stock path (dashed/amber)
  g = Effect.runSync(addEdge(g, createEdge('e12', 'in-stock', 'backorder', {}, {
    label: { text: 'Out of Stock', position: 'center' },
    style: { strokeDasharray: '6,4', stroke: '#f59e0b' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e13', 'backorder', 'notify-ok', {}, {
    style: { strokeDasharray: '6,4', stroke: '#f59e0b' },
  })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 2 — Multi-Tier Architecture Diagram
// ───────────────────────────────────────────────────────────────────────────

const buildMultiTierArchitecture = () => {
  let g = emptyGraph('arch-multi-tier');

  // ── Tier 1: Clients ──────────────────────────────────────────────────────
  const clientColor = '#3b82f6';
  g = Effect.runSync(addNode(g, createNode('web-browser', {}, {
    label: 'Web Browser',
    shape: 'rectangle',
    size: { width: 150, height: 58 },
    style: { fill: clientColor + '18', stroke: clientColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('mobile-app', {}, {
    label: 'Mobile App',
    shape: 'rectangle',
    size: { width: 150, height: 58 },
    style: { fill: clientColor + '18', stroke: clientColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('cli-tool', {}, {
    label: 'CLI Tool',
    shape: 'rectangle',
    size: { width: 140, height: 58 },
    style: { fill: clientColor + '18', stroke: clientColor, strokeWidth: 1.5 },
  })));

  // ── Tier 2: Gateway ──────────────────────────────────────────────────────
  const gatewayColor = '#f97316';
  g = Effect.runSync(addNode(g, createNode('cdn', {}, {
    label: 'CDN',
    shape: 'cloud',
    size: { width: 140, height: 70 },
    style: { fill: gatewayColor + '18', stroke: gatewayColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('waf', {}, {
    label: 'WAF',
    shape: 'hexagon',
    size: { width: 130, height: 64 },
    style: { fill: '#450a0a', stroke: '#ef4444', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('lb', {}, {
    label: 'Load Balancer',
    shape: 'diamond',
    size: { width: 155, height: 90 },
    style: { fill: gatewayColor + '20', stroke: gatewayColor, strokeWidth: 2 },
  })));
  g = Effect.runSync(addNode(g, createNode('api-gw', {}, {
    label: 'API Gateway',
    shape: 'hexagon',
    size: { width: 150, height: 64 },
    style: { fill: '#0d2d1e', stroke: '#10b981', strokeWidth: 2 },
  })));

  // ── Tier 3: Services ─────────────────────────────────────────────────────
  const svcColor = '#a855f7';
  const svcNodes = [
    { id: 'auth-svc', label: 'Auth Service' },
    { id: 'user-svc', label: 'User Service' },
    { id: 'order-svc', label: 'Order Service' },
    { id: 'payment-svc', label: 'Payment Service' },
    { id: 'notif-svc', label: 'Notification Service' },
    { id: 'search-svc', label: 'Search Service' },
  ];
  for (const { id, label } of svcNodes) {
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label,
      shape: 'rectangle',
      size: { width: 165, height: 58 },
      style: { fill: svcColor + '18', stroke: svcColor, strokeWidth: 1.5 },
    })));
  }

  // ── Tier 4: Data ─────────────────────────────────────────────────────────
  g = Effect.runSync(addNode(g, createNode('postgres', {}, {
    label: 'PostgreSQL',
    shape: 'cylinder',
    size: { width: 150, height: 72 },
    style: { fill: '#0c2340', stroke: '#0ea5e9', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('redis', {}, {
    label: 'Redis',
    shape: 'diamond',
    size: { width: 130, height: 80 },
    style: { fill: '#300a0a', stroke: '#dc2626', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('elasticsearch', {}, {
    label: 'Elasticsearch',
    shape: 'cylinder',
    size: { width: 160, height: 72 },
    style: { fill: '#2d1a00', stroke: '#f59e0b', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('s3', {}, {
    label: 'S3 Storage',
    shape: 'cylinder',
    size: { width: 140, height: 72 },
    style: { fill: '#1a1600', stroke: '#facc15', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('rabbitmq', {}, {
    label: 'RabbitMQ',
    shape: 'parallelogram',
    size: { width: 155, height: 60 },
    style: { fill: '#1a0d2e', stroke: '#d946ef', strokeWidth: 1.5 },
  })));

  // ── Tier 5: Infra / Observability ────────────────────────────────────────
  const infraColor = '#64748b';
  g = Effect.runSync(addNode(g, createNode('prometheus', {}, {
    label: 'Prometheus',
    shape: 'rectangle',
    size: { width: 150, height: 58 },
    style: { fill: infraColor + '18', stroke: infraColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('grafana', {}, {
    label: 'Grafana',
    shape: 'rectangle',
    size: { width: 140, height: 58 },
    style: { fill: infraColor + '18', stroke: infraColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('elk-stack', {}, {
    label: 'ELK Stack',
    shape: 'rectangle',
    size: { width: 140, height: 58 },
    style: { fill: infraColor + '18', stroke: infraColor, strokeWidth: 1.5 },
  })));

  // ── Edges: Clients → Gateway ─────────────────────────────────────────────
  g = Effect.runSync(addEdge(g, createEdge('a1', 'web-browser', 'cdn', {})));
  g = Effect.runSync(addEdge(g, createEdge('a2', 'web-browser', 'waf', {})));
  g = Effect.runSync(addEdge(g, createEdge('a3', 'mobile-app', 'waf', {})));
  g = Effect.runSync(addEdge(g, createEdge('a4', 'cli-tool', 'waf', {})));
  g = Effect.runSync(addEdge(g, createEdge('a5', 'cdn', 'lb', {}, { label: { text: 'HTTPS', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('a6', 'waf', 'lb', {})));
  g = Effect.runSync(addEdge(g, createEdge('a7', 'lb', 'api-gw', {}, { label: { text: 'HTTP/2', position: 'center' } })));

  // ── Edges: Gateway → Services ────────────────────────────────────────────
  g = Effect.runSync(addEdge(g, createEdge('b1', 'api-gw', 'auth-svc', {}, { label: { text: 'REST', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('b2', 'api-gw', 'user-svc', {}, { label: { text: 'REST', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('b3', 'api-gw', 'order-svc', {}, { label: { text: 'REST', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('b4', 'api-gw', 'payment-svc', {}, { label: { text: 'REST', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('b5', 'api-gw', 'search-svc', {}, { label: { text: 'REST', position: 'center' } })));

  // ── Edges: Services → Data ───────────────────────────────────────────────
  g = Effect.runSync(addEdge(g, createEdge('c1', 'auth-svc', 'redis', {}, { label: { text: 'cache', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c2', 'user-svc', 'postgres', {}, { label: { text: 'SQL', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c3', 'order-svc', 'postgres', {}, { label: { text: 'SQL', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c4', 'order-svc', 'rabbitmq', {}, { label: { text: 'AMQP', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c5', 'payment-svc', 'postgres', {}, { label: { text: 'SQL', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c6', 'search-svc', 'elasticsearch', {}, { label: { text: 'HTTP', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c7', 'rabbitmq', 'notif-svc', {}, { label: { text: 'AMQP', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('c8', 'notif-svc', 's3', {}, { label: { text: 'PUT', position: 'center' } })));

  // ── Edges: Services → Observability ─────────────────────────────────────
  g = Effect.runSync(addEdge(g, createEdge('d1', 'auth-svc', 'prometheus', {}, { style: { strokeDasharray: '4,3', stroke: '#475569' } })));
  g = Effect.runSync(addEdge(g, createEdge('d2', 'order-svc', 'prometheus', {}, { style: { strokeDasharray: '4,3', stroke: '#475569' } })));
  g = Effect.runSync(addEdge(g, createEdge('d3', 'prometheus', 'grafana', {})));
  g = Effect.runSync(addEdge(g, createEdge('d4', 'user-svc', 'elk-stack', {}, { style: { strokeDasharray: '4,3', stroke: '#475569' } })));
  g = Effect.runSync(addEdge(g, createEdge('d5', 'order-svc', 'elk-stack', {}, { style: { strokeDasharray: '4,3', stroke: '#475569' } })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 3 — Network Topology
// ───────────────────────────────────────────────────────────────────────────

const buildNetworkTopology = () => {
  let g = emptyGraph('net-topo');

  // Internet entry point
  g = Effect.runSync(addNode(g, createNode('internet', {}, {
    label: 'Internet',
    shape: 'cloud',
    size: { width: 150, height: 80 },
    style: { fill: '#1e293b', stroke: '#94a3b8', strokeWidth: 2 },
  })));

  // Perimeter
  g = Effect.runSync(addNode(g, createNode('firewall', {}, {
    label: 'Firewall',
    shape: 'hexagon',
    size: { width: 140, height: 70 },
    style: { fill: '#450a0a', stroke: '#ef4444', strokeWidth: 2 },
  })));

  g = Effect.runSync(addNode(g, createNode('load-balancer', {}, {
    label: 'Load Balancer',
    shape: 'diamond',
    size: { width: 160, height: 95 },
    style: { fill: '#422006', stroke: '#f97316', strokeWidth: 2 },
  })));

  // Web tier
  const webColor = '#3b82f6';
  g = Effect.runSync(addNode(g, createNode('web1', {}, {
    label: 'Web Server 1',
    shape: 'rectangle',
    size: { width: 155, height: 60 },
    style: { fill: webColor + '18', stroke: webColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('web2', {}, {
    label: 'Web Server 2',
    shape: 'rectangle',
    size: { width: 155, height: 60 },
    style: { fill: webColor + '18', stroke: webColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('web3', {}, {
    label: 'Web Server 3',
    shape: 'rectangle',
    size: { width: 155, height: 60 },
    style: { fill: webColor + '18', stroke: webColor, strokeWidth: 1.5 },
  })));

  // API layer
  g = Effect.runSync(addNode(g, createNode('api-gateway', {}, {
    label: 'API Gateway',
    shape: 'hexagon',
    size: { width: 155, height: 68 },
    style: { fill: '#0d2d1e', stroke: '#10b981', strokeWidth: 2 },
  })));

  // Microservices
  const msColor = '#8b5cf6';
  g = Effect.runSync(addNode(g, createNode('ms-auth', {}, {
    label: 'Auth μService',
    shape: 'rectangle',
    size: { width: 155, height: 58 },
    style: { fill: msColor + '18', stroke: msColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('ms-data', {}, {
    label: 'Data μService',
    shape: 'rectangle',
    size: { width: 155, height: 58 },
    style: { fill: msColor + '18', stroke: msColor, strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('ms-notify', {}, {
    label: 'Notify μService',
    shape: 'rectangle',
    size: { width: 165, height: 58 },
    style: { fill: msColor + '18', stroke: msColor, strokeWidth: 1.5 },
  })));

  // Database cluster
  g = Effect.runSync(addNode(g, createNode('db-primary', {}, {
    label: 'DB Primary',
    shape: 'cylinder',
    size: { width: 145, height: 70 },
    style: { fill: '#0c2340', stroke: '#0ea5e9', strokeWidth: 1.5 },
  })));
  g = Effect.runSync(addNode(g, createNode('db-replica', {}, {
    label: 'DB Replica',
    shape: 'cylinder',
    size: { width: 145, height: 70 },
    style: { fill: '#0c2340', stroke: '#38bdf8', strokeWidth: 1.5 },
  })));

  // Cache
  g = Effect.runSync(addNode(g, createNode('cache', {}, {
    label: 'Redis Cache',
    shape: 'diamond',
    size: { width: 140, height: 82 },
    style: { fill: '#300a0a', stroke: '#dc2626', strokeWidth: 1.5 },
  })));

  // Message queue
  g = Effect.runSync(addNode(g, createNode('queue', {}, {
    label: 'Message Queue',
    shape: 'parallelogram',
    size: { width: 160, height: 58 },
    style: { fill: '#1a0d2e', stroke: '#a855f7', strokeWidth: 1.5 },
  })));

  // Edges — network flow
  g = Effect.runSync(addEdge(g, createEdge('n1', 'internet', 'firewall', {})));
  g = Effect.runSync(addEdge(g, createEdge('n2', 'firewall', 'load-balancer', {})));
  g = Effect.runSync(addEdge(g, createEdge('n3', 'load-balancer', 'web1', {})));
  g = Effect.runSync(addEdge(g, createEdge('n4', 'load-balancer', 'web2', {})));
  g = Effect.runSync(addEdge(g, createEdge('n5', 'load-balancer', 'web3', {})));
  g = Effect.runSync(addEdge(g, createEdge('n6', 'web1', 'api-gateway', {})));
  g = Effect.runSync(addEdge(g, createEdge('n7', 'web2', 'api-gateway', {})));
  g = Effect.runSync(addEdge(g, createEdge('n8', 'web3', 'api-gateway', {})));
  g = Effect.runSync(addEdge(g, createEdge('n9', 'api-gateway', 'ms-auth', {})));
  g = Effect.runSync(addEdge(g, createEdge('n10', 'api-gateway', 'ms-data', {})));
  g = Effect.runSync(addEdge(g, createEdge('n11', 'api-gateway', 'ms-notify', {})));
  g = Effect.runSync(addEdge(g, createEdge('n12', 'ms-auth', 'cache', {})));
  g = Effect.runSync(addEdge(g, createEdge('n13', 'ms-data', 'db-primary', {})));
  g = Effect.runSync(addEdge(g, createEdge('n14', 'db-primary', 'db-replica', {}, {
    label: { text: 'replication', position: 'center' },
    style: { strokeDasharray: '5,3', stroke: '#38bdf8' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('n15', 'ms-notify', 'queue', {})));
  g = Effect.runSync(addEdge(g, createEdge('n16', 'ms-data', 'cache', {}, {
    style: { strokeDasharray: '4,3', stroke: '#dc2626' },
  })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 4 — Organization Chart
// ───────────────────────────────────────────────────────────────────────────

const buildOrgChart = () => {
  let g = emptyGraph('org-chart');

  const node = (
    id: string,
    label: string,
    fill: string,
    stroke: string,
    w = 180,
    h = 60,
  ) => createNode(id, {}, {
    label,
    shape: 'rectangle',
    size: { width: w, height: h },
    style: { fill, stroke, strokeWidth: 1.5 },
  });

  // C-suite
  g = Effect.runSync(addNode(g, node('ceo', 'CEO', '#1e1b4b', '#818cf8', 200, 64)));

  // VPs
  g = Effect.runSync(addNode(g, node('vp-eng', 'VP Engineering', '#1e3a5f', '#3b82f6')));
  g = Effect.runSync(addNode(g, node('vp-prod', 'VP Product', '#14532d', '#22c55e')));
  g = Effect.runSync(addNode(g, node('vp-sales', 'VP Sales', '#431407', '#f97316')));

  // Engineering directors
  g = Effect.runSync(addNode(g, node('dir-fe', 'Dir Frontend', '#1e293b', '#60a5fa', 170, 56)));
  g = Effect.runSync(addNode(g, node('dir-be', 'Dir Backend', '#1e293b', '#60a5fa', 170, 56)));
  g = Effect.runSync(addNode(g, node('dir-ops', 'Dir DevOps', '#1e293b', '#60a5fa', 170, 56)));

  // Frontend leads
  g = Effect.runSync(addNode(g, node('lead-react', 'Lead React', '#0f2744', '#93c5fd', 155, 52)));
  g = Effect.runSync(addNode(g, node('lead-mobile', 'Lead Mobile', '#0f2744', '#93c5fd', 155, 52)));

  // Backend leads
  g = Effect.runSync(addNode(g, node('lead-api', 'Lead API', '#0f2744', '#93c5fd', 155, 52)));
  g = Effect.runSync(addNode(g, node('lead-data', 'Lead Data', '#0f2744', '#93c5fd', 155, 52)));

  // DevOps leads
  g = Effect.runSync(addNode(g, node('lead-cloud', 'Lead Cloud', '#0f2744', '#93c5fd', 155, 52)));
  g = Effect.runSync(addNode(g, node('lead-sre', 'Lead SRE', '#0f2744', '#93c5fd', 155, 52)));

  // Product PMs
  g = Effect.runSync(addNode(g, node('pm-core', 'PM Core', '#0d2d1e', '#4ade80', 155, 52)));
  g = Effect.runSync(addNode(g, node('pm-growth', 'PM Growth', '#0d2d1e', '#4ade80', 155, 52)));
  g = Effect.runSync(addNode(g, node('pm-ent', 'PM Enterprise', '#0d2d1e', '#4ade80', 155, 52)));

  // Sales ICs
  g = Effect.runSync(addNode(g, node('sales-mgr', 'Sales Manager', '#1c0a00', '#fb923c', 160, 52)));
  g = Effect.runSync(addNode(g, node('account-exec', 'Account Executive', '#1c0a00', '#fb923c', 175, 52)));

  // Edges
  const edge = (id: string, src: string, tgt: string) => createEdge(id, src, tgt, {});

  g = Effect.runSync(addEdge(g, edge('o1', 'ceo', 'vp-eng')));
  g = Effect.runSync(addEdge(g, edge('o2', 'ceo', 'vp-prod')));
  g = Effect.runSync(addEdge(g, edge('o3', 'ceo', 'vp-sales')));

  g = Effect.runSync(addEdge(g, edge('o4', 'vp-eng', 'dir-fe')));
  g = Effect.runSync(addEdge(g, edge('o5', 'vp-eng', 'dir-be')));
  g = Effect.runSync(addEdge(g, edge('o6', 'vp-eng', 'dir-ops')));

  g = Effect.runSync(addEdge(g, edge('o7', 'dir-fe', 'lead-react')));
  g = Effect.runSync(addEdge(g, edge('o8', 'dir-fe', 'lead-mobile')));
  g = Effect.runSync(addEdge(g, edge('o9', 'dir-be', 'lead-api')));
  g = Effect.runSync(addEdge(g, edge('o10', 'dir-be', 'lead-data')));
  g = Effect.runSync(addEdge(g, edge('o11', 'dir-ops', 'lead-cloud')));
  g = Effect.runSync(addEdge(g, edge('o12', 'dir-ops', 'lead-sre')));

  g = Effect.runSync(addEdge(g, edge('o13', 'vp-prod', 'pm-core')));
  g = Effect.runSync(addEdge(g, edge('o14', 'vp-prod', 'pm-growth')));
  g = Effect.runSync(addEdge(g, edge('o15', 'vp-prod', 'pm-ent')));

  g = Effect.runSync(addEdge(g, edge('o16', 'vp-sales', 'sales-mgr')));
  g = Effect.runSync(addEdge(g, edge('o17', 'vp-sales', 'account-exec')));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 5 — Order Processing State Machine
// ───────────────────────────────────────────────────────────────────────────

const buildStateMachine = () => {
  let g = emptyGraph('state-machine');

  const state = (
    id: string,
    label: string,
    fill: string,
    stroke: string,
    w = 160,
    h = 60,
  ) => createNode(id, {}, {
    label,
    shape: 'ellipse',
    size: { width: w, height: h },
    style: { fill, stroke, strokeWidth: 2 },
  });

  // Happy path states (green tones)
  g = Effect.runSync(addNode(g, state('created', 'Created', '#052e16', '#22c55e', 140, 60)));
  g = Effect.runSync(addNode(g, state('validating', 'Validating', '#14532d', '#4ade80')));
  g = Effect.runSync(addNode(g, state('validated', 'Validated', '#14532d', '#4ade80')));
  g = Effect.runSync(addNode(g, state('processing', 'Processing', '#0d2d1e', '#34d399')));
  g = Effect.runSync(addNode(g, state('shipped', 'Shipped', '#0d2d1e', '#6ee7b7')));
  g = Effect.runSync(addNode(g, state('delivered', 'Delivered', '#052e16', '#bbf7d0', 160, 60)));

  // Error states (red tones)
  g = Effect.runSync(addNode(g, state('failed', 'Failed', '#450a0a', '#ef4444')));
  g = Effect.runSync(addNode(g, state('cancelled', 'Cancelled', '#3b0764', '#a855f7')));

  const labeled = (
    id: string,
    src: string,
    tgt: string,
    text: string,
    strokeColor = '#475569',
    dashed = false,
  ) => createEdge(id, src, tgt, {}, {
    label: { text, position: 'center' as const },
    style: {
      stroke: strokeColor,
      ...(dashed ? { strokeDasharray: '6,4' } : {}),
    },
  });

  // Happy path transitions
  g = Effect.runSync(addEdge(g, labeled('s1', 'created', 'validating', 'submit', '#22c55e')));
  g = Effect.runSync(addEdge(g, labeled('s2', 'validating', 'validated', 'validate', '#22c55e')));
  g = Effect.runSync(addEdge(g, labeled('s3', 'validated', 'processing', 'pay', '#22c55e')));
  g = Effect.runSync(addEdge(g, labeled('s4', 'processing', 'shipped', 'ship', '#22c55e')));
  g = Effect.runSync(addEdge(g, labeled('s5', 'shipped', 'delivered', 'deliver', '#22c55e')));

  // Error transitions (dashed, red)
  g = Effect.runSync(addEdge(g, labeled('s6', 'validating', 'failed', 'error', '#ef4444', true)));
  g = Effect.runSync(addEdge(g, labeled('s7', 'processing', 'cancelled', 'cancel', '#a855f7', true)));

  // Retry loop: Failed → Validating
  g = Effect.runSync(addEdge(g, labeled('s8', 'failed', 'validating', 'retry', '#f59e0b', true)));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 6 — ER Diagram (Blog Schema)
// ───────────────────────────────────────────────────────────────────────────

const buildERDiagram = () => {
  let g = emptyGraph('er-diagram');

  const entity = (id: string, label: string, w = 180, h = 60) =>
    createNode(id, {}, {
      label,
      shape: 'rectangle',
      size: { width: w, height: h },
      style: { fill: '#1e293b', stroke: '#64748b', strokeWidth: 1.5 },
    });

  g = Effect.runSync(addNode(g, entity('user', 'User\nid · username · email\npasswordHash · createdAt', 220, 84)));
  g = Effect.runSync(addNode(g, entity('post', 'Post\nid · title · content\npublishedAt · authorId FK', 220, 84)));
  g = Effect.runSync(addNode(g, entity('comment', 'Comment\nid · body · createdAt\npostId FK · authorId FK', 230, 84)));
  g = Effect.runSync(addNode(g, entity('category', 'Category\nid · name · slug', 200, 72)));
  g = Effect.runSync(addNode(g, entity('tag', 'Tag\nid · name', 160, 60)));
  g = Effect.runSync(addNode(g, entity('post-tag', 'PostTag\nid · postId FK · tagId FK', 210, 72)));
  g = Effect.runSync(addNode(g, entity('media', 'Media\nid · url · type · postId FK', 220, 72)));
  g = Effect.runSync(addNode(g, entity('like', 'Like\nid · userId FK · postId FK\ncreatedAt', 210, 80)));

  const rel = (
    id: string,
    src: string,
    tgt: string,
    label: string,
    strokeColor = '#475569',
  ) => createEdge(id, src, tgt, {}, {
    label: { text: label, position: 'center' as const },
    style: { stroke: strokeColor },
  });

  g = Effect.runSync(addEdge(g, rel('r1', 'user', 'post', '1:N', '#3b82f6')));
  g = Effect.runSync(addEdge(g, rel('r2', 'user', 'comment', '1:N', '#3b82f6')));
  g = Effect.runSync(addEdge(g, rel('r3', 'post', 'comment', '1:N', '#8b5cf6')));
  g = Effect.runSync(addEdge(g, rel('r4', 'post', 'media', '1:N', '#8b5cf6')));
  g = Effect.runSync(addEdge(g, rel('r5', 'post', 'like', '1:N', '#8b5cf6')));
  g = Effect.runSync(addEdge(g, rel('r6', 'user', 'like', '1:N', '#3b82f6')));
  g = Effect.runSync(addEdge(g, rel('r7', 'post', 'post-tag', '1:N', '#8b5cf6')));
  g = Effect.runSync(addEdge(g, rel('r8', 'tag', 'post-tag', '1:N', '#10b981')));
  g = Effect.runSync(addEdge(g, rel('r9', 'post', 'category', 'N:M', '#f59e0b')));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 7 — Package Dependency Graph
// ───────────────────────────────────────────────────────────────────────────

const buildPackageDeps = () => {
  let g = emptyGraph('pkg-deps');

  const internal = (id: string, label: string) =>
    createNode(id, {}, {
      label,
      shape: 'rectangle',
      size: { width: 180, height: 58 },
      style: { fill: '#2e1065', stroke: '#a855f7', strokeWidth: 2 },
    });

  const external = (id: string, label: string) =>
    createNode(id, {}, {
      label,
      shape: 'rectangle',
      size: { width: 165, height: 52 },
      style: { fill: '#1e293b', stroke: '#475569', strokeWidth: 1.5 },
    });

  // Internal packages
  g = Effect.runSync(addNode(g, internal('hyperkit', 'hyperkit')));
  g = Effect.runSync(addNode(g, internal('diagram-core', 'diagram-core')));
  g = Effect.runSync(addNode(g, internal('diagram-svg', 'diagram-svg')));
  g = Effect.runSync(addNode(g, internal('diagram-solid', 'diagram-solid')));
  g = Effect.runSync(addNode(g, internal('explorer', 'explorer')));
  g = Effect.runSync(addNode(g, internal('devtools', 'devtools')));
  g = Effect.runSync(addNode(g, internal('views', 'views')));
  g = Effect.runSync(addNode(g, internal('eslint-plugin', 'eslint-plugin')));

  // External deps
  g = Effect.runSync(addNode(g, external('solid-js', 'solid-js')));
  g = Effect.runSync(addNode(g, external('kobalte', '@kobalte/core')));
  g = Effect.runSync(addNode(g, external('effect', 'effect')));
  g = Effect.runSync(addNode(g, external('dagre', 'dagre')));
  g = Effect.runSync(addNode(g, external('elkjs', 'elkjs')));
  g = Effect.runSync(addNode(g, external('d3-force', 'd3-force')));
  g = Effect.runSync(addNode(g, external('eslint', 'eslint')));

  const dep = (id: string, from: string, to: string) =>
    createEdge(id, from, to, {}, { style: { stroke: '#475569' } });

  // hyperkit → external
  g = Effect.runSync(addEdge(g, dep('p1', 'hyperkit', 'solid-js')));
  g = Effect.runSync(addEdge(g, dep('p2', 'hyperkit', 'kobalte')));
  g = Effect.runSync(addEdge(g, dep('p3', 'hyperkit', 'effect')));

  // diagram-core → external
  g = Effect.runSync(addEdge(g, dep('p4', 'diagram-core', 'dagre')));
  g = Effect.runSync(addEdge(g, dep('p5', 'diagram-core', 'elkjs')));
  g = Effect.runSync(addEdge(g, dep('p6', 'diagram-core', 'd3-force')));
  g = Effect.runSync(addEdge(g, dep('p7', 'diagram-core', 'effect')));

  // diagram-svg → diagram-core, effect
  g = Effect.runSync(addEdge(g, dep('p8', 'diagram-svg', 'diagram-core')));
  g = Effect.runSync(addEdge(g, dep('p9', 'diagram-svg', 'effect')));

  // diagram-solid → diagram-core, diagram-svg, solid-js, effect
  g = Effect.runSync(addEdge(g, dep('p10', 'diagram-solid', 'diagram-core')));
  g = Effect.runSync(addEdge(g, dep('p11', 'diagram-solid', 'diagram-svg')));
  g = Effect.runSync(addEdge(g, dep('p12', 'diagram-solid', 'solid-js')));
  g = Effect.runSync(addEdge(g, dep('p13', 'diagram-solid', 'effect')));

  // explorer → hyperkit, diagram-*
  g = Effect.runSync(addEdge(g, dep('p14', 'explorer', 'hyperkit')));
  g = Effect.runSync(addEdge(g, dep('p15', 'explorer', 'diagram-core')));
  g = Effect.runSync(addEdge(g, dep('p16', 'explorer', 'diagram-svg')));
  g = Effect.runSync(addEdge(g, dep('p17', 'explorer', 'diagram-solid')));

  // devtools → hyperkit, solid-js
  g = Effect.runSync(addEdge(g, dep('p18', 'devtools', 'hyperkit')));
  g = Effect.runSync(addEdge(g, dep('p19', 'devtools', 'solid-js')));

  // views → hyperkit, effect, solid-js
  g = Effect.runSync(addEdge(g, dep('p20', 'views', 'hyperkit')));
  g = Effect.runSync(addEdge(g, dep('p21', 'views', 'effect')));
  g = Effect.runSync(addEdge(g, dep('p22', 'views', 'solid-js')));

  // eslint-plugin → eslint
  g = Effect.runSync(addEdge(g, dep('p23', 'eslint-plugin', 'eslint')));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 8 — Mindmap: SolidKit Platform
// ───────────────────────────────────────────────────────────────────────────

const buildMindmap = () => {
  let g = emptyGraph('mindmap');

  const center = createNode('center', {}, {
    label: 'SolidKit Platform',
    shape: 'ellipse',
    size: { width: 200, height: 70 },
    style: { fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 3 },
  });
  g = Effect.runSync(addNode(g, center));

  // Branch roots + colors
  const branches: Array<{
    id: string;
    label: string;
    fill: string;
    stroke: string;
    children: Array<{ id: string; label: string }>;
  }> = [
    {
      id: 'components',
      label: 'Components',
      fill: '#1e3a5f',
      stroke: '#3b82f6',
      children: [
        { id: 'primitives', label: 'Primitives (68)' },
        { id: 'composites', label: 'Composites (44)' },
        { id: 'panels', label: 'Panels (4)' },
        { id: 'report', label: 'Report (15)' },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      fill: '#14532d',
      stroke: '#22c55e',
      children: [
        { id: 'svc-effect', label: 'Effect' },
        { id: 'svc-ws', label: 'WebSocket' },
        { id: 'svc-session', label: 'Session' },
        { id: 'svc-fs', label: 'FileSystem' },
        { id: 'svc-log', label: 'Logging' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      fill: '#431407',
      stroke: '#f97316',
      children: [
        { id: 'tool-devtools', label: 'DevTools' },
        { id: 'tool-explorer', label: 'Explorer' },
        { id: 'tool-eslint', label: 'ESLint' },
        { id: 'tool-mcp', label: 'MCP Server' },
      ],
    },
    {
      id: 'packages',
      label: 'Packages',
      fill: '#2e1065',
      stroke: '#a855f7',
      children: [
        { id: 'pkg-dcore', label: 'diagram-core' },
        { id: 'pkg-dsvg', label: 'diagram-svg' },
        { id: 'pkg-dsolid', label: 'diagram-solid' },
        { id: 'pkg-views', label: 'views' },
      ],
    },
    {
      id: 'targets',
      label: 'Targets',
      fill: '#0c2340',
      stroke: '#0ea5e9',
      children: [
        { id: 'tgt-web', label: 'Web' },
        { id: 'tgt-desktop', label: 'Desktop (Tauri)' },
        { id: 'tgt-mobile', label: 'Mobile' },
      ],
    },
  ];

  for (const branch of branches) {
    g = Effect.runSync(addNode(g, createNode(branch.id, {}, {
      label: branch.label,
      shape: 'ellipse',
      size: { width: 160, height: 56 },
      style: { fill: branch.fill, stroke: branch.stroke, strokeWidth: 2 },
    })));
    g = Effect.runSync(addEdge(g, createEdge(`m-${branch.id}`, 'center', branch.id, {}, {
      style: { stroke: branch.stroke, strokeWidth: 2 },
    })));

    for (const child of branch.children) {
      g = Effect.runSync(addNode(g, createNode(child.id, {}, {
        label: child.label,
        shape: 'rectangle',
        size: { width: 155, height: 50 },
        style: { fill: branch.fill + '88', stroke: branch.stroke + 'aa', strokeWidth: 1.5 },
      })));
      g = Effect.runSync(addEdge(g, createEdge(`m-${branch.id}-${child.id}`, branch.id, child.id, {}, {
        style: { stroke: branch.stroke + 'aa', strokeDasharray: '4,3' },
      })));
    }
  }

  return g;
};

// ── Stories Meta ─────────────────────────────────────────────────────────────
const meta: Meta = {
  title: 'Diagram/Showcase',
  tags: ['autodocs'],
};
export default meta;

// ── Story 1: Business Process Flowchart ─────────────────────────────────────
export const BusinessProcessFlowchart: StoryObj = {
  name: 'Business Process Flowchart',
  render: () => {
    const graph = buildBusinessFlowchart();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1000, 720)}>
          <Diagram width={1000} height={720} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 2: Multi-Tier Architecture ────────────────────────────────────────
export const MultiTierArchitecture: StoryObj = {
  name: 'Multi-Tier Architecture',
  render: () => {
    const graph = buildMultiTierArchitecture();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1100, 760)}>
          <Diagram width={1100} height={760} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 3: Network Topology ────────────────────────────────────────────────
export const NetworkTopology: StoryObj = {
  name: 'Network Topology',
  render: () => {
    const graph = buildNetworkTopology();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={d3ForceLayout as LayoutAlgorithm<unknown>}>
        <div style={containerStyle(1000, 700)}>
          <Diagram width={1000} height={700} autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 4: Organization Chart ──────────────────────────────────────────────
export const OrganizationChart: StoryObj = {
  name: 'Organization Chart',
  render: () => {
    const graph = buildOrgChart();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTree}>
        <div style={containerStyle(1100, 760)}>
          <Diagram width={1100} height={760} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 5: Order Processing State Machine ──────────────────────────────────
export const OrderStateMachine: StoryObj = {
  name: 'Order Processing State Machine',
  render: () => {
    const graph = buildStateMachine();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1000, 600)}>
          <Diagram width={1000} height={600} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 6: ER Diagram ──────────────────────────────────────────────────────
export const BlogERDiagram: StoryObj = {
  name: 'Blog ER Diagram',
  render: () => {
    const graph = buildERDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1000, 720)}>
          <Diagram width={1000} height={720} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 7: Package Dependency Graph ────────────────────────────────────────
export const PackageDependencies: StoryObj = {
  name: 'Package Dependencies',
  render: () => {
    const graph = buildPackageDeps();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1100, 760)}>
          <Diagram width={1100} height={760} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 8: SolidKit Platform Mindmap ───────────────────────────────────────
export const PlatformMindmap: StoryObj = {
  name: 'SolidKit Platform Mindmap',
  render: () => {
    const graph = buildMindmap();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkRadial}>
        <div style={containerStyle(1100, 760)}>
          <Diagram width={1100} height={760} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};
