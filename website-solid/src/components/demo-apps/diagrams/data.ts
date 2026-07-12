/**
 * Catalog metadata for the Architecture Studio demo.
 *
 * SSR-safe on purpose: this module never imports `@ybouhjira/diagram-core`
 * (which is a browser-only bundle). The sidebar renders from this list during
 * prerender; the actual graphs are built client-side in `graphs.ts`, loaded
 * only through the `clientOnly` canvas.
 */
export type LayoutKind = 'TB' | 'LR' | 'force';

export interface DiagramMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Layout the diagram reads best in; the toolbar can override it. */
  defaultLayout: LayoutKind;
}

/** Sidebar category order. */
export const CATEGORIES = [
  'Flows',
  'Architecture',
  'Networks',
  'Pipelines',
  'Org & State',
] as const;

export const DIAGRAMS: DiagramMeta[] = [
  {
    id: 'request-lifecycle',
    name: 'Request Lifecycle',
    category: 'Flows',
    description: 'How an inbound API request is validated, processed, and persisted.',
    defaultLayout: 'TB',
  },
  {
    id: 'auth-flow',
    name: 'Auth & Session',
    category: 'Flows',
    description: 'OAuth login, token exchange, and refresh across the gateway.',
    defaultLayout: 'TB',
  },
  {
    id: 'checkout',
    name: 'Checkout Flow',
    category: 'Flows',
    description: 'Cart to confirmation with payment, fraud, and inventory branches.',
    defaultLayout: 'LR',
  },
  {
    id: 'microservices',
    name: 'Microservices Map',
    category: 'Architecture',
    description: 'Service boundaries, gateways, and datastores for the platform.',
    defaultLayout: 'LR',
  },
  {
    id: 'event-driven',
    name: 'Event-Driven System',
    category: 'Architecture',
    description: 'Producers, topics, and consumers wired through a message bus.',
    defaultLayout: 'force',
  },
  {
    id: 'network-topology',
    name: 'Network Topology',
    category: 'Networks',
    description: 'Edge, load balancers, app tier, cache, and replicated database.',
    defaultLayout: 'force',
  },
  {
    id: 'service-mesh',
    name: 'Service Mesh',
    category: 'Networks',
    description: 'Sidecar proxies and control plane across a mesh of services.',
    defaultLayout: 'force',
  },
  {
    id: 'cicd',
    name: 'CI/CD Pipeline',
    category: 'Pipelines',
    description: 'Commit to production through build, test, scan, and deploy gates.',
    defaultLayout: 'LR',
  },
  {
    id: 'etl',
    name: 'ETL Data Pipeline',
    category: 'Pipelines',
    description: 'Ingest, clean, transform, and load into the warehouse and lake.',
    defaultLayout: 'LR',
  },
  {
    id: 'org-chart',
    name: 'Team Org Chart',
    category: 'Org & State',
    description: 'Reporting structure across engineering, design, and product.',
    defaultLayout: 'TB',
  },
  {
    id: 'order-state',
    name: 'Order State Machine',
    category: 'Org & State',
    description: 'Order status transitions from placed through delivered or refunded.',
    defaultLayout: 'LR',
  },
];
