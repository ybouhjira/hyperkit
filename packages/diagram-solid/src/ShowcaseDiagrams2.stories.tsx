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
  PortId as PortIdBrand,
} from '@ybouhjira/diagram-core';
import { elkLayout } from '@ybouhjira/diagram-core/layout/hierarchical/elk';
import { DiagramProvider, Diagram, Controls, MiniMap } from './index';

// ── Shared container style (inherits active theme via --sk-* tokens) ─────────
const containerStyle = (w = 1000, h = 700) => ({
  position: 'relative' as const,
  width: `${w}px`,
  height: `${h}px`,
  border: '1px solid var(--sk-border)',
  'border-radius': '12px',
  overflow: 'hidden',
  background: 'var(--sk-bg-primary)',
});

// ── ELK LR layout preset ─────────────────────────────────────────────────────
const elkLR = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, {
      algorithm: 'layered', direction: 'LR', nodeSpacing: 60, rankSpacing: 120,
      edgeRouting: 'orthogonal', nodePlacement: 'NETWORK_SIMPLEX',
    }),
} as LayoutAlgorithm<unknown>;

// ── ELK TB layout preset ─────────────────────────────────────────────────────
const elkTB = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, {
      algorithm: 'layered', direction: 'TB', nodeSpacing: 60, rankSpacing: 100,
      edgeRouting: 'orthogonal', nodePlacement: 'NETWORK_SIMPLEX',
    }),
} as LayoutAlgorithm<unknown>;

// ── ELK mrtree layout preset (top-down tree) ─────────────────────────────────
const elkTree = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, { algorithm: 'mrtree', direction: 'TB', nodeSpacing: 60, rankSpacing: 120 }),
} as LayoutAlgorithm<unknown>;

// ── ELK layout for large tree catalogs (LR tree — compact width) ─────────────
const elkCatalog = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, {
      algorithm: 'mrtree',
      direction: 'LR',
      nodeSpacing: 12,
      rankSpacing: 70,
      edgeRouting: 'polyline',
      padding: 30,
    }),
} as LayoutAlgorithm<unknown>;

// ───────────────────────────────────────────────────────────────────────────
// Story 9 — Node Editor Pipeline (ComfyUI-style)
// ───────────────────────────────────────────────────────────────────────────

const buildNodeEditorPipeline = () => {
  let g = emptyGraph('comfyui-pipeline');

  // Port color constants
  const imageFill = '#0c3a4a';   // cyan tint
  const imageStroke = '#06b6d4'; // cyan
  const numberFill = '#0d1f3a';  // blue tint
  const numberStroke = '#3b82f6'; // blue
  const stringFill = '#0d2e1a';  // green tint
  const stringStroke = '#22c55e'; // green

  // ── Load Image ──
  g = Effect.runSync(addNode(g, createNode('load-img', { path: '/images/photo.jpg' }, {
    label: 'Load Image',
    size: { width: 200, height: 140 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#0c3a4a',
    ports: [
      {
        id: PortIdBrand('load_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'input' as const, id: 'path', label: 'Path', value: '/images/photo.jpg', placeholder: '/path/to/image' },
    ],
  })));

  // ── Number Constant (feeds resize width) ──
  g = Effect.runSync(addNode(g, createNode('num-const', { value: 512 }, {
    label: 'Number Constant',
    size: { width: 180, height: 100 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: numberFill,
    ports: [
      {
        id: PortIdBrand('num_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'number',
        label: 'value',
      },
    ],
    widgets: [
      { type: 'slider' as const, id: 'value', label: 'Value', min: 64, max: 2048, step: 64, value: 512 },
    ],
  })));

  // ── Resize ──
  g = Effect.runSync(addNode(g, createNode('resize', { width: 512, height: 512 }, {
    label: 'Resize',
    size: { width: 220, height: 180 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: imageFill,
    ports: [
      {
        id: PortIdBrand('resize_img_in'),
        direction: 'west' as const,
        offset: 0.33,
        dataType: 'image',
        label: 'image',
      },
      {
        id: PortIdBrand('resize_w_in'),
        direction: 'west' as const,
        offset: 0.6,
        dataType: 'number',
        label: 'width',
      },
      {
        id: PortIdBrand('resize_h_in'),
        direction: 'west' as const,
        offset: 0.8,
        dataType: 'number',
        label: 'height',
      },
      {
        id: PortIdBrand('resize_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'slider' as const, id: 'width', label: 'Width', min: 64, max: 2048, step: 64, value: 512 },
      { type: 'slider' as const, id: 'height', label: 'Height', min: 64, max: 2048, step: 64, value: 512 },
    ],
  })));

  // ── Color Adjust ──
  g = Effect.runSync(addNode(g, createNode('color-adj', { brightness: 10 }, {
    label: 'Color Adjust',
    size: { width: 220, height: 160 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a2d1a',
    ports: [
      {
        id: PortIdBrand('color_img_in'),
        direction: 'west' as const,
        offset: 0.35,
        dataType: 'image',
        label: 'image',
      },
      {
        id: PortIdBrand('color_br_in'),
        direction: 'west' as const,
        offset: 0.7,
        dataType: 'number',
        label: 'brightness',
      },
      {
        id: PortIdBrand('color_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'slider' as const, id: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, value: 10 },
    ],
  })));

  // ── Blur ──
  g = Effect.runSync(addNode(g, createNode('blur', { radius: 3 }, {
    label: 'Blur',
    size: { width: 200, height: 140 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a1a3d',
    ports: [
      {
        id: PortIdBrand('blur_img_in'),
        direction: 'west' as const,
        offset: 0.33,
        dataType: 'image',
        label: 'image',
      },
      {
        id: PortIdBrand('blur_r_in'),
        direction: 'west' as const,
        offset: 0.67,
        dataType: 'number',
        label: 'radius',
      },
      {
        id: PortIdBrand('blur_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'slider' as const, id: 'radius', label: 'Radius', min: 0, max: 50, step: 1, value: 3 },
    ],
  })));

  // ── Merge ──
  g = Effect.runSync(addNode(g, createNode('merge', {}, {
    label: 'Merge',
    size: { width: 180, height: 140 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#2d1a00',
    ports: [
      {
        id: PortIdBrand('merge_in1'),
        direction: 'west' as const,
        offset: 0.33,
        dataType: 'image',
        label: 'image1',
      },
      {
        id: PortIdBrand('merge_in2'),
        direction: 'west' as const,
        offset: 0.66,
        dataType: 'image',
        label: 'image2',
      },
      {
        id: PortIdBrand('merge_out'),
        direction: 'east' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'dropdown' as const, id: 'mode', label: 'Mode', options: [
        { label: 'Add', value: 'add' },
        { label: 'Overlay', value: 'overlay' },
        { label: 'Multiply', value: 'multiply' },
      ] },
    ],
  })));

  // ── Preview ──
  g = Effect.runSync(addNode(g, createNode('preview', {}, {
    label: 'Preview',
    size: { width: 180, height: 100 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#2d2d00',
    ports: [
      {
        id: PortIdBrand('preview_in'),
        direction: 'west' as const,
        offset: 0.5,
        dataType: 'image',
        label: 'image',
      },
    ],
    widgets: [
      { type: 'label' as const, id: 'status', label: 'Status', value: 'Ready' },
    ],
  })));

  // ── Save ──
  g = Effect.runSync(addNode(g, createNode('save', { path: '/output/result.png' }, {
    label: 'Save',
    size: { width: 200, height: 140 },
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a4d2e',
    ports: [
      {
        id: PortIdBrand('save_img_in'),
        direction: 'west' as const,
        offset: 0.33,
        dataType: 'image',
        label: 'image',
      },
      {
        id: PortIdBrand('save_path_in'),
        direction: 'west' as const,
        offset: 0.67,
        dataType: 'string',
        label: 'path',
      },
    ],
    widgets: [
      { type: 'input' as const, id: 'path', label: 'Path', value: '/output/result.png', placeholder: '/output/file.png' },
    ],
  })));

  // ── Edges ──
  // Load Image → Resize (image)
  g = Effect.runSync(addEdge(g, createEdge('e1', 'load-img', 'resize', {}, {
    sourcePort: PortIdBrand('load_out'),
    targetPort: PortIdBrand('resize_img_in'),
    style: { stroke: imageStroke },
  })));

  // Number Constant → Resize width
  g = Effect.runSync(addEdge(g, createEdge('e2', 'num-const', 'resize', {}, {
    sourcePort: PortIdBrand('num_out'),
    targetPort: PortIdBrand('resize_w_in'),
    style: { stroke: numberStroke },
  })));

  // Resize → Color Adjust
  g = Effect.runSync(addEdge(g, createEdge('e3', 'resize', 'color-adj', {}, {
    sourcePort: PortIdBrand('resize_out'),
    targetPort: PortIdBrand('color_img_in'),
    style: { stroke: imageStroke },
  })));

  // Color Adjust → Blur
  g = Effect.runSync(addEdge(g, createEdge('e4', 'color-adj', 'blur', {}, {
    sourcePort: PortIdBrand('color_out'),
    targetPort: PortIdBrand('blur_img_in'),
    style: { stroke: imageStroke },
  })));

  // Blur → Merge input1
  g = Effect.runSync(addEdge(g, createEdge('e5', 'blur', 'merge', {}, {
    sourcePort: PortIdBrand('blur_out'),
    targetPort: PortIdBrand('merge_in1'),
    style: { stroke: imageStroke },
  })));

  // Load Image → Merge input2 (original branch)
  g = Effect.runSync(addEdge(g, createEdge('e6', 'load-img', 'merge', {}, {
    sourcePort: PortIdBrand('load_out'),
    targetPort: PortIdBrand('merge_in2'),
    style: { stroke: imageStroke, strokeDasharray: '6,3' },
  })));

  // Merge → Preview
  g = Effect.runSync(addEdge(g, createEdge('e7', 'merge', 'preview', {}, {
    sourcePort: PortIdBrand('merge_out'),
    targetPort: PortIdBrand('preview_in'),
    style: { stroke: imageStroke },
  })));

  // Merge → Save
  g = Effect.runSync(addEdge(g, createEdge('e8', 'merge', 'save', {}, {
    sourcePort: PortIdBrand('merge_out'),
    targetPort: PortIdBrand('save_img_in'),
    style: { stroke: imageStroke },
  })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 10 — UML Class Diagram (DDD e-commerce domain)
// ───────────────────────────────────────────────────────────────────────────

const buildUmlClassDiagram = () => {
  let g = emptyGraph('uml-class');

  // Colors per stereotype
  const aggregateColor = { fill: '#0d1f3a', stroke: '#3b82f6' };   // blue
  const entityColor    = { fill: '#0d2e2e', stroke: '#14b8a6' };    // teal
  const valueObjColor  = { fill: '#1a0d2e', stroke: '#a855f7' };    // purple
  const serviceColor   = { fill: '#2d1a00', stroke: '#f97316' };    // orange
  const repoColor      = { fill: '#0d2e1a', stroke: '#22c55e' };    // green
  const infraColor     = { fill: '#1e293b', stroke: '#64748b' };    // gray
  const portColor      = { fill: '#2d0d1a', stroke: '#f43f5e' };    // rose

  const makeClassLabel = (
    stereotype: string,
    name: string,
    fields: string[],
    methods: string[]
  ) => {
    const stereotypeLine = `<<${stereotype}>>`;
    const allLines = [stereotypeLine, name, '---', ...fields, '---', ...methods];
    return allLines.join('\n');
  };

  // ── Order (Aggregate Root) ──
  g = Effect.runSync(addNode(g, createNode('order', {}, {
    label: makeClassLabel('Aggregate Root', 'Order',
      ['id: OrderId', 'status: OrderStatus', 'total: Money'],
      ['addItem()', 'removeItem()', 'submit()']
    ),
    shape: 'rectangle',
    size: { width: 220, height: 170 },
    style: aggregateColor,
  })));

  // ── OrderLine (Entity) ──
  g = Effect.runSync(addNode(g, createNode('order-line', {}, {
    label: makeClassLabel('Entity', 'OrderLine',
      ['quantity: Int', 'unitPrice: Money'],
      ['calculateTotal(): Money']
    ),
    shape: 'rectangle',
    size: { width: 210, height: 140 },
    style: entityColor,
  })));

  // ── Product (Entity) ──
  g = Effect.runSync(addNode(g, createNode('product', {}, {
    label: makeClassLabel('Entity', 'Product',
      ['name: String', 'price: Money', 'sku: Sku'],
      []
    ),
    shape: 'rectangle',
    size: { width: 200, height: 130 },
    style: entityColor,
  })));

  // ── Customer (Entity) ──
  g = Effect.runSync(addNode(g, createNode('customer', {}, {
    label: makeClassLabel('Entity', 'Customer',
      ['name: String', 'email: Email'],
      []
    ),
    shape: 'rectangle',
    size: { width: 200, height: 120 },
    style: entityColor,
  })));

  // ── Money (Value Object) ──
  g = Effect.runSync(addNode(g, createNode('money', {}, {
    label: makeClassLabel('Value Object', 'Money',
      ['amount: Decimal', 'currency: Currency'],
      []
    ),
    shape: 'rectangle',
    size: { width: 200, height: 120 },
    style: valueObjColor,
  })));

  // ── Address (Value Object) ──
  g = Effect.runSync(addNode(g, createNode('address', {}, {
    label: makeClassLabel('Value Object', 'Address',
      ['street: String', 'city: String', 'zip: String', 'country: String'],
      []
    ),
    shape: 'rectangle',
    size: { width: 200, height: 140 },
    style: valueObjColor,
  })));

  // ── OrderRepository (Repository) ──
  g = Effect.runSync(addNode(g, createNode('order-repo', {}, {
    label: makeClassLabel('Repository', 'OrderRepository',
      [],
      ['save(order: Order)', 'findById(id: OrderId): Order']
    ),
    shape: 'rectangle',
    size: { width: 230, height: 120 },
    style: repoColor,
  })));

  // ── PricingService (Domain Service) ──
  g = Effect.runSync(addNode(g, createNode('pricing-svc', {}, {
    label: makeClassLabel('Domain Service', 'PricingService',
      [],
      ['calculateDiscount(order: Order): Money']
    ),
    shape: 'rectangle',
    size: { width: 240, height: 110 },
    style: serviceColor,
  })));

  // ── PaymentGateway (Port Interface) ──
  g = Effect.runSync(addNode(g, createNode('payment-gw', {}, {
    label: makeClassLabel('Port', 'PaymentGateway',
      [],
      ['charge(amount: Money): Receipt']
    ),
    shape: 'rectangle',
    size: { width: 220, height: 110 },
    style: portColor,
  })));

  // ── StripeAdapter (Infrastructure) ──
  g = Effect.runSync(addNode(g, createNode('stripe', {}, {
    label: makeClassLabel('Infrastructure', 'StripeAdapter',
      ['apiKey: String'],
      ['charge(amount: Money): Receipt']
    ),
    shape: 'rectangle',
    size: { width: 220, height: 130 },
    style: infraColor,
  })));

  // ── Edges ──

  // Order *-- OrderLine (composition)
  g = Effect.runSync(addEdge(g, createEdge('r1', 'order', 'order-line', {}, {
    label: { text: '1  *--  *', position: 'center' },
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  })));

  // Order --> Customer (association)
  g = Effect.runSync(addEdge(g, createEdge('r2', 'order', 'customer', {}, {
    label: { text: 'placedBy', position: 'center' },
    style: { stroke: '#14b8a6' },
  })));

  // OrderLine --> Product (association)
  g = Effect.runSync(addEdge(g, createEdge('r3', 'order-line', 'product', {}, {
    label: { text: 'refers to', position: 'center' },
    style: { stroke: '#14b8a6' },
  })));

  // Order --> Money (uses value object)
  g = Effect.runSync(addEdge(g, createEdge('r4', 'order', 'money', {}, {
    label: { text: 'total', position: 'center' },
    style: { stroke: '#a855f7', strokeDasharray: '5,3' },
  })));

  // Customer --> Address (has)
  g = Effect.runSync(addEdge(g, createEdge('r5', 'customer', 'address', {}, {
    label: { text: 'deliveryAddress', position: 'center' },
    style: { stroke: '#a855f7', strokeDasharray: '5,3' },
  })));

  // OrderRepository ..> Order (dependency)
  g = Effect.runSync(addEdge(g, createEdge('r6', 'order-repo', 'order', {}, {
    label: { text: '«uses»', position: 'center' },
    style: { stroke: '#22c55e', strokeDasharray: '6,4' },
  })));

  // PricingService ..> Order (dependency)
  g = Effect.runSync(addEdge(g, createEdge('r7', 'pricing-svc', 'order', {}, {
    label: { text: '«uses»', position: 'center' },
    style: { stroke: '#f97316', strokeDasharray: '6,4' },
  })));

  // StripeAdapter ..|> PaymentGateway (implements)
  g = Effect.runSync(addEdge(g, createEdge('r8', 'stripe', 'payment-gw', {}, {
    label: { text: '«implements»', position: 'center' },
    style: { stroke: '#f43f5e', strokeDasharray: '6,4' },
  })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 11 — Sequence-like Message Flow (Auth service)
// ───────────────────────────────────────────────────────────────────────────

const buildAuthMessageFlow = () => {
  let g = emptyGraph('auth-message-flow');

  // Participant colors
  const clientColor   = { fill: '#0d1f3a', stroke: '#3b82f6' };
  const gatewayColor  = { fill: '#1a0d1a', stroke: '#a855f7' };
  const authColor     = { fill: '#0d2e1a', stroke: '#22c55e' };
  const dbColor       = { fill: '#2d1a00', stroke: '#f97316' };
  const tokenColor    = { fill: '#2d0d1a', stroke: '#f43f5e' };

  // ── Participant nodes (laid out horizontally) ──
  g = Effect.runSync(addNode(g, createNode('client', {}, {
    label: 'Client\n(Browser / App)',
    shape: 'rectangle',
    size: { width: 160, height: 70 },
    style: clientColor,
  })));

  g = Effect.runSync(addNode(g, createNode('api-gw', {}, {
    label: 'API Gateway',
    shape: 'hexagon',
    size: { width: 155, height: 70 },
    style: gatewayColor,
  })));

  g = Effect.runSync(addNode(g, createNode('auth-svc', {}, {
    label: 'Auth Service',
    shape: 'rectangle',
    size: { width: 155, height: 70 },
    style: authColor,
  })));

  g = Effect.runSync(addNode(g, createNode('user-db', {}, {
    label: 'User DB',
    shape: 'cylinder',
    size: { width: 145, height: 70 },
    style: dbColor,
  })));

  g = Effect.runSync(addNode(g, createNode('token-store', {}, {
    label: 'Token Store\n(Redis)',
    shape: 'diamond',
    size: { width: 155, height: 90 },
    style: tokenColor,
  })));

  // ── Message edges with sequence labels ──

  // 1. Client → API Gateway: POST /login
  g = Effect.runSync(addEdge(g, createEdge('m1', 'client', 'api-gw', {}, {
    label: { text: '① POST /login', position: 'center' },
    style: { stroke: '#3b82f6', strokeWidth: 1.5 },
  })));

  // 2. API Gateway → Auth Service: validateCredentials
  g = Effect.runSync(addEdge(g, createEdge('m2', 'api-gw', 'auth-svc', {}, {
    label: { text: '② validateCredentials', position: 'center' },
    style: { stroke: '#a855f7', strokeWidth: 1.5 },
  })));

  // 3. Auth Service → User DB: SELECT user
  g = Effect.runSync(addEdge(g, createEdge('m3', 'auth-svc', 'user-db', {}, {
    label: { text: '③ SELECT user', position: 'center' },
    style: { stroke: '#22c55e', strokeWidth: 1.5 },
  })));

  // 4. User DB → Auth Service: user record
  g = Effect.runSync(addEdge(g, createEdge('m4', 'user-db', 'auth-svc', {}, {
    label: { text: '④ user record', position: 'center' },
    style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '5,3' },
  })));

  // 5. Auth Service → Token Store: generateToken
  g = Effect.runSync(addEdge(g, createEdge('m5', 'auth-svc', 'token-store', {}, {
    label: { text: '⑤ generateToken', position: 'center' },
    style: { stroke: '#22c55e', strokeWidth: 1.5 },
  })));

  // 6. Token Store → Auth Service: JWT
  g = Effect.runSync(addEdge(g, createEdge('m6', 'token-store', 'auth-svc', {}, {
    label: { text: '⑥ JWT', position: 'center' },
    style: { stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '5,3' },
  })));

  // 7. Auth Service → API Gateway: authResult
  g = Effect.runSync(addEdge(g, createEdge('m7', 'auth-svc', 'api-gw', {}, {
    label: { text: '⑦ authResult', position: 'center' },
    style: { stroke: '#22c55e', strokeWidth: 1.5, strokeDasharray: '5,3' },
  })));

  // 8. API Gateway → Client: 200 + token
  g = Effect.runSync(addEdge(g, createEdge('m8', 'api-gw', 'client', {}, {
    label: { text: '⑧ 200 + token', position: 'center' },
    style: { stroke: '#a855f7', strokeWidth: 1.5, strokeDasharray: '5,3' },
  })));

  return g;
};

// ───────────────────────────────────────────────────────────────────────────
// Story 12 — SolidKit Component Catalog (~50 nodes)
// ───────────────────────────────────────────────────────────────────────────

const buildSolidKitCatalog = () => {
  let g = emptyGraph('hyperkit-catalog');

  // Color palette per category
  const rootColor    = { fill: '#1a1040', stroke: '#818cf8', strokeWidth: 2.5 };
  const primColor    = { fill: '#0d2e1a', stroke: '#22c55e', strokeWidth: 2 };
  const compColor    = { fill: '#0d1f3a', stroke: '#3b82f6', strokeWidth: 2 };
  const sysColor     = { fill: '#2d1a00', stroke: '#f97316', strokeWidth: 2 };
  const pkgColor     = { fill: '#2d0d1a', stroke: '#f43f5e', strokeWidth: 2 };

  const layoutColor  = { fill: '#0d3a0d', stroke: '#4ade80' };
  const inputColor   = { fill: '#0a2a10', stroke: '#86efac' };
  const displayColor = { fill: '#0d3030', stroke: '#67e8f9' };
  const feedbackColor= { fill: '#1a2d00', stroke: '#bef264' };
  const navColor     = { fill: '#0d2010', stroke: '#6ee7b7' };

  const chatColor    = { fill: '#0d1a30', stroke: '#60a5fa' };
  const layoutCompColor = { fill: '#0d1835', stroke: '#7dd3fc' };
  const dataColor    = { fill: '#0d0d2e', stroke: '#a78bfa' };
  const utilColor    = { fill: '#1a0d2e', stroke: '#c4b5fd' };

  const leafSize = { width: 150, height: 44 };
  const catSize  = { width: 175, height: 52 };
  const rootSize = { width: 200, height: 62 };

  // ── Root ──
  g = Effect.runSync(addNode(g, createNode('hyperkit', {}, {
    label: 'SolidKit\n133+ Components',
    shape: 'rectangle',
    size: rootSize,
    style: rootColor,
  })));

  // ── Tier 1: Major branches ──
  g = Effect.runSync(addNode(g, createNode('primitives', {}, {
    label: 'Primitives',
    shape: 'rectangle',
    size: catSize,
    style: primColor,
  })));
  g = Effect.runSync(addNode(g, createNode('composites', {}, {
    label: 'Composites',
    shape: 'rectangle',
    size: catSize,
    style: compColor,
  })));
  g = Effect.runSync(addNode(g, createNode('systems', {}, {
    label: 'Systems',
    shape: 'rectangle',
    size: catSize,
    style: sysColor,
  })));
  g = Effect.runSync(addNode(g, createNode('packages', {}, {
    label: 'Packages',
    shape: 'rectangle',
    size: catSize,
    style: pkgColor,
  })));

  // Root → branches
  for (const id of ['primitives', 'composites', 'systems', 'packages']) {
    g = Effect.runSync(addEdge(g, createEdge(`r-${id}`, 'hyperkit', id, {})));
  }

  // ── Primitives sub-categories ──
  g = Effect.runSync(addNode(g, createNode('prim-layout', {}, {
    label: 'Layout (14)',
    shape: 'rectangle',
    size: catSize,
    style: layoutColor,
  })));
  g = Effect.runSync(addNode(g, createNode('prim-input', {}, {
    label: 'Input (16)',
    shape: 'rectangle',
    size: catSize,
    style: inputColor,
  })));
  g = Effect.runSync(addNode(g, createNode('prim-display', {}, {
    label: 'Display (19)',
    shape: 'rectangle',
    size: catSize,
    style: displayColor,
  })));
  g = Effect.runSync(addNode(g, createNode('prim-feedback', {}, {
    label: 'Feedback (6)',
    shape: 'rectangle',
    size: catSize,
    style: feedbackColor,
  })));
  g = Effect.runSync(addNode(g, createNode('prim-nav', {}, {
    label: 'Navigation (13)',
    shape: 'rectangle',
    size: catSize,
    style: navColor,
  })));

  for (const id of ['prim-layout', 'prim-input', 'prim-display', 'prim-feedback', 'prim-nav']) {
    g = Effect.runSync(addEdge(g, createEdge(`p-${id}`, 'primitives', id, {})));
  }

  // ── Layout leaf nodes ──
  const layoutLeaves = [
    'Box', 'Flex', 'Stack', 'Grid', 'Center', 'Container',
    'Section', 'Spacer', 'Wrap', 'AspectRatio', 'ScrollArea',
    'MasonryGrid', 'MediaGrid', 'DocumentPage',
  ];
  for (const name of layoutLeaves) {
    const id = `layout-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: layoutColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'prim-layout', id, {})));
  }

  // ── Input leaf nodes ──
  const inputLeaves = [
    'Button', 'Input', 'NumberInput', 'SearchInput', 'Select',
    'Checkbox', 'Switch', 'Slider', 'RangeSlider', 'TagInput',
    'DateInput', 'ColorInput', 'FileInput', 'AudioInput', 'VideoInput', 'ImageInput',
  ];
  for (const name of inputLeaves) {
    const id = `input-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: inputColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'prim-input', id, {})));
  }

  // ── Display leaf nodes ──
  const displayLeaves = [
    'Text', 'Badge', 'Card', 'MetricCard', 'ProjectCard',
    'CodeBlock', 'Markdown', 'ImagePreview', 'Skeleton', 'Tooltip',
    'Kbd', 'StatusDot', 'ColorDot', 'StreamingText', 'TerminalOutput',
    'Timeline', 'Sparkline', 'WaterfallChart', 'SignalGrid',
  ];
  for (const name of displayLeaves) {
    const id = `display-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: displayColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'prim-display', id, {})));
  }

  // ── Feedback leaf nodes ──
  const feedbackLeaves = [
    'Spinner', 'ProgressBar', 'ProgressRing',
    'StreamingIndicator', 'ErrorBanner', 'EmptyState',
  ];
  for (const name of feedbackLeaves) {
    const id = `feedback-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: feedbackColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'prim-feedback', id, {})));
  }

  // ── Navigation leaf nodes ──
  const navLeaves = [
    'Accordion', 'Collapsible', 'Dialog', 'Dropdown', 'Popover',
    'Tabs', 'Separator', 'FilterChip', 'SuggestionChips', 'SegmentedBar',
    'RecordButton', 'DropZone', 'Table',
  ];
  for (const name of navLeaves) {
    const id = `nav-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: navColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'prim-nav', id, {})));
  }

  // ── Composites sub-categories ──
  g = Effect.runSync(addNode(g, createNode('comp-chat', {}, {
    label: 'Chat & AI (15)',
    shape: 'rectangle',
    size: catSize,
    style: chatColor,
  })));
  g = Effect.runSync(addNode(g, createNode('comp-layout', {}, {
    label: 'Layout (8)',
    shape: 'rectangle',
    size: catSize,
    style: layoutCompColor,
  })));
  g = Effect.runSync(addNode(g, createNode('comp-data', {}, {
    label: 'Data & Content (12)',
    shape: 'rectangle',
    size: catSize,
    style: dataColor,
  })));
  g = Effect.runSync(addNode(g, createNode('comp-util', {}, {
    label: 'UI Utilities (10)',
    shape: 'rectangle',
    size: catSize,
    style: utilColor,
  })));

  for (const id of ['comp-chat', 'comp-layout', 'comp-data', 'comp-util']) {
    g = Effect.runSync(addEdge(g, createEdge(`c-${id}`, 'composites', id, {})));
  }

  // ── Chat leaf nodes ──
  for (const name of [
    'ChatWindow', 'LLMChatBox', 'MessageBubble', 'MessageList', 'MessageInput',
    'SessionTabs', 'SessionManager', 'SessionSearch', 'SessionIndicator',
    'ToolApproval', 'ToolExecution', 'SubagentTracker', 'CostTracker',
    'ModelSelector', 'PromptQueue',
  ]) {
    const id = `chat-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: chatColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'comp-chat', id, {})));
  }

  // ── Composite Layout leaf nodes ──
  for (const name of [
    'Sidebar', 'MobileNav', 'MenuBar', 'TabBar',
    'Breadcrumb', 'MobilePanelView', 'ModeSwitcher', 'StatusBar',
  ]) {
    const id = `clayout-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: layoutCompColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'comp-layout', id, {})));
  }

  // ── Data leaf nodes ──
  for (const name of [
    'FileExplorer', 'KanbanBoard', 'IssueBoard', 'DashboardContainer', 'DashboardGrid',
    'ProjectDashboard', 'ExamBuilder', 'ActionForm', 'DirectoryPicker',
    'RepoCard', 'StatBar', 'MediaTrimmer',
  ]) {
    const id = `data-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: dataColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'comp-data', id, {})));
  }

  // ── Utility leaf nodes ──
  for (const name of [
    'CommandPalette', 'ContextMenu', 'ConfirmDialog', 'Toast', 'SettingsPanel',
    'ThemeBuilder', 'ThemePickerModal', 'GuidedTour', 'SplitButton', 'ConnectionStatus',
  ]) {
    const id = `util-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: utilColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'comp-util', id, {})));
  }

  // ── Systems leaf nodes ──
  for (const name of ['Panels', 'Report', 'Navigation', 'Theme', 'Keyboard', 'Animation']) {
    const id = `sys-${name.toLowerCase()}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: name,
      shape: 'rectangle',
      size: leafSize,
      style: sysColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'systems', id, {})));
  }

  // ── Packages leaf nodes ──
  const pkgLeaves = [
    'diagram-core',
    'diagram-svg',
    'diagram-solid',
    'explorer',
    'devtools',
    'views',
    'eslint-plugin',
    'exam-generator',
  ];
  for (const name of pkgLeaves) {
    const id = `pkg-${name}`;
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label: `@ybouhjira/${name}`,
      shape: 'rectangle',
      size: { width: 190, height: 44 },
      style: pkgColor,
    })));
    g = Effect.runSync(addEdge(g, createEdge(`e-${id}`, 'packages', id, {})));
  }

  return g;
};

// ── Stories Meta ─────────────────────────────────────────────────────────────
const meta: Meta = {
  title: 'Diagram/Showcase2',
  tags: ['autodocs'],
};
export default meta;

// ── Story 9: Node Editor Pipeline (ComfyUI-style) ───────────────────────────
export const NodeEditorPipeline: StoryObj = {
  name: 'Node Editor Pipeline (ComfyUI-style)',
  render: () => {
    const graph = buildNodeEditorPipeline();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkLR}>
        <div style={containerStyle(1200, 720)}>
          <Diagram width={1200} height={720} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 10: UML Class Diagram (DDD) ───────────────────────────────────────
export const UmlClassDiagram: StoryObj = {
  name: 'UML Class Diagram (DDD)',
  render: () => {
    const graph = buildUmlClassDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <div style={containerStyle(1100, 780)}>
          <Diagram width={1100} height={780} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 11: Authentication Message Flow ────────────────────────────────────
export const AuthenticationMessageFlow: StoryObj = {
  name: 'Authentication Message Flow',
  render: () => {
    const graph = buildAuthMessageFlow();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkLR}>
        <div style={containerStyle(1100, 520)}>
          <Diagram width={1100} height={520} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 12: SolidKit Component Catalog ────────────────────────────────────
export const SolidKitComponentCatalog: StoryObj = {
  name: 'SolidKit Component Catalog',
  render: () => {
    const graph = buildSolidKitCatalog();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkCatalog}>
        <div style={containerStyle(2000, 1600)}>
          <Diagram width={2000} height={1600} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};
