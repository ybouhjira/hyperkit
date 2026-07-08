/**
 * Self-contained D3-force simulation as an inline worker source string.
 *
 * Derived from d3-force v3 source (MIT, Copyright 2010-2021 Mike Bostock).
 * The many-body force uses a direct O(n²) loop instead of a Barnes-Hut
 * quadtree so that no additional package is required inside the worker.
 *
 * Because diagram-core is a library package (d3-force is externalized in the
 * Vite build), we cannot import d3-force inside a Worker blob. Instead we
 * ship this self-contained simulation that receives WorkerInput and responds
 * with WorkerOutput — both plain-JSON-serializable for structured-clone transfer.
 */

/**
 * Returns a string that is the complete source of the worker, suitable for
 * passing to `new Blob([src], { type: 'text/javascript' })`.
 *
 * The function is written as a string-returning factory so that TypeScript
 * can type-check the surrounding module while the inner code remains plain JS
 * (no TS-only syntax) for the runtime blob.
 */
export const buildWorkerSource = (): string => /* js */ `
'use strict';

// ── LCG random (d3-force lcg.js) ──────────────────────────────────────────────
const A = 1664525;
const C = 1013904223;
const M = 4294967296; // 2^32
function lcg() {
  let s = 1;
  return () => ((s = (A * s + C) % M) / M);
}

function jiggle(rng) {
  return (rng() - 0.5) * 1e-6;
}

// ── Simulation (d3-force simulation.js, stripped of event dispatch) ────────────
function createSimulation(nodes) {
  const initialRadius = 10;
  const initialAngle  = Math.PI * (3 - Math.sqrt(5));

  let alpha        = 1;
  const alphaMin   = 0.001;
  const alphaDecay = 1 - Math.pow(alphaMin, 1 / 300);
  const alphaTarget  = 0;
  const velocityDecay = 0.6;
  const forces = [];
  const random  = lcg();

  // initialise nodes
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    node.index = i;
    if (node.fx != null) node.x = node.fx;
    if (node.fy != null) node.y = node.fy;
    if (isNaN(node.x) || isNaN(node.y)) {
      const radius = initialRadius * Math.sqrt(0.5 + i);
      const angle  = i * initialAngle;
      node.x = radius * Math.cos(angle);
      node.y = radius * Math.sin(angle);
    }
    if (isNaN(node.vx) || isNaN(node.vy)) {
      node.vx = node.vy = 0;
    }
  }

  // initialise forces
  for (const f of forces) {
    if (f.initialize) f.initialize(nodes, random);
  }

  function addForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    forces.push(force);
  }

  function tick() {
    alpha += (alphaTarget - alpha) * alphaDecay;
    for (const f of forces) f(alpha);
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      if (node.fx == null) node.x += node.vx *= velocityDecay;
      else                 node.x = node.fx, node.vx = 0;
      if (node.fy == null) node.y += node.vy *= velocityDecay;
      else                 node.y = node.fy, node.vy = 0;
    }
  }

  return { addForce, tick };
}

// ── Link force (d3-force link.js) ─────────────────────────────────────────────
function createLinkForce(links, distanceVal, strengthVal) {
  let nodes;
  let random;
  let count, bias, strengths, distances;

  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }

  function initialize(_nodes, _random) {
    nodes  = _nodes;
    random = _random;

    const n = nodes.length;
    const m = links.length;
    const nodeById = new Map(nodes.map((d, i) => [d.id, d]));

    count = new Array(n).fill(0);
    for (let i = 0; i < m; ++i) {
      const link = links[i];
      link.index = i;
      if (typeof link.source !== 'object') link.source = nodeById.get(link.source);
      if (typeof link.target !== 'object') link.target = nodeById.get(link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }

    bias = new Array(m);
    for (let i = 0; i < m; ++i) {
      const link = links[i];
      bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }

    strengths = new Array(m);
    for (let i = 0; i < m; ++i) {
      strengths[i] = typeof strengthVal === 'function'
        ? +strengthVal(links[i], i, links)
        : (strengthVal != null ? strengthVal : +defaultStrength(links[i]));
    }

    distances = new Array(m);
    for (let i = 0; i < m; ++i) {
      distances[i] = typeof distanceVal === 'function'
        ? +distanceVal(links[i], i, links)
        : +distanceVal;
    }
  }

  function force(alpha) {
    for (let i = 0, n = links.length; i < n; ++i) {
      const link   = links[i];
      const source = link.source;
      const target = link.target;
      let x = target.x + target.vx - source.x - source.vx || jiggle(random);
      let y = target.y + target.vy - source.y - source.vy || jiggle(random);
      let l = Math.sqrt(x * x + y * y);
      l = (l - distances[i]) / l * alpha * strengths[i];
      x *= l; y *= l;
      const b = bias[i];
      target.vx -= x * b;
      target.vy -= y * b;
      source.vx += x * (1 - b);
      source.vy += y * (1 - b);
    }
  }

  force.initialize = initialize;
  return force;
}

// ── Many-body force — direct O(n²) (no quadtree) ──────────────────────────────
function createManyBodyForce(chargeStrength) {
  let nodes, strengths, random;
  const distanceMin2 = 1;
  const distanceMax2 = Infinity;

  function initialize(_nodes, _random) {
    nodes    = _nodes;
    random   = _random;
    const n  = nodes.length;
    strengths = new Array(n);
    for (let i = 0; i < n; ++i) strengths[i] = +chargeStrength;
  }

  function force(alpha) {
    const n = nodes.length;
    for (let i = 0; i < n; ++i) {
      const ni = nodes[i];
      for (let j = i + 1; j < n; ++j) {
        const nj = nodes[j];
        let dx = nj.x - ni.x || jiggle(random);
        let dy = nj.y - ni.y || jiggle(random);
        let l2 = dx * dx + dy * dy;
        if (l2 >= distanceMax2) continue;
        if (l2 < distanceMin2) l2 = Math.sqrt(distanceMin2 * l2);
        const w = strengths[i] * alpha / l2;
        ni.vx += dx * w;
        ni.vy += dy * w;
        const w2 = strengths[j] * alpha / l2;
        nj.vx -= dx * w2;
        nj.vy -= dy * w2;
      }
    }
  }

  force.initialize = initialize;
  return force;
}

// ── Center force (d3-force center.js) ─────────────────────────────────────────
function createCenterForce(cx, cy) {
  let nodes;

  function initialize(_nodes) { nodes = _nodes; }

  function force() {
    const n = nodes.length;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; ++i) { sx += nodes[i].x; sy += nodes[i].y; }
    const ox = sx / n - cx;
    const oy = sy / n - cy;
    for (let i = 0; i < n; ++i) { nodes[i].x -= ox; nodes[i].y -= oy; }
  }

  force.initialize = initialize;
  return force;
}

// ── Collide force (d3-force collide.js, simplified — no quadtree) ─────────────
function createCollideForce(radiusFn, iterations) {
  let nodes, radii, random;
  const strength = 1;

  function initialize(_nodes, _random) {
    nodes  = _nodes;
    random = _random;
    const n = nodes.length;
    radii = new Array(n);
    for (let i = 0; i < n; ++i) radii[i] = +radiusFn(nodes[i]);
  }

  function force() {
    const n = nodes.length;
    for (let k = 0; k < iterations; ++k) {
      for (let i = 0; i < n; ++i) {
        const ni = nodes[i];
        const ri = radii[i];
        const xi = ni.x + ni.vx;
        const yi = ni.y + ni.vy;
        for (let j = i + 1; j < n; ++j) {
          const nj = nodes[j];
          const rj = radii[j];
          const r  = ri + rj;
          let dx = xi - nj.x - nj.vx || jiggle(random);
          let dy = yi - nj.y - nj.vy || jiggle(random);
          let l2 = dx * dx + dy * dy;
          if (l2 < r * r) {
            let l = Math.sqrt(l2);
            if (l === 0) { l = 1e-6; }
            const overlap = (r - l) / l * strength;
            dx *= overlap;
            dy *= overlap;
            const wj = rj * rj / (ri * ri + rj * rj);
            const wi = 1 - wj;
            ni.vx += dx * wi;
            ni.vy += dy * wi;
            nj.vx -= dx * wj;
            nj.vy -= dy * wj;
          }
        }
      }
    }
  }

  force.initialize = initialize;
  return force;
}

// ── Worker message handler ─────────────────────────────────────────────────────
self.onmessage = function(event) {
  const { nodes: inputNodes, edges: inputEdges, options } = event.data;

  try {
    // Build mutable simulation nodes
    const simNodes = inputNodes.map(function(n) {
      return {
        id:     n.id,
        x:      n.x,
        y:      n.y,
        vx:     0,
        vy:     0,
        width:  n.width,
        height: n.height,
        index:  0,
        fx:     null,
        fy:     null,
      };
    });

    // Build mutable simulation links (source/target are id strings; link force resolves them)
    const simLinks = inputEdges.map(function(e) {
      return { id: e.id, source: e.source, target: e.target, index: 0 };
    });

    const sim = createSimulation(simNodes);

    sim.addForce(createLinkForce(simLinks, options.distance, options.strength));
    sim.addForce(createManyBodyForce(options.charge));
    sim.addForce(createCenterForce(options.centerX, options.centerY));
    sim.addForce(createCollideForce(
      function(d) { return Math.max(d.width, d.height) / 2 + 10; },
      1
    ));

    for (let i = 0; i < options.iterations; i++) {
      sim.tick();
    }

    // Extract positions (top-left, not centre)
    const positions = simNodes.map(function(n) {
      return {
        id: n.id,
        x: (n.x || 0) - n.width / 2,
        y: (n.y || 0) - n.height / 2,
      };
    });

    // Build id->simNode lookup for edge extraction
    const nodeMap = new Map(simNodes.map(function(n) { return [n.id, n]; }));

    // Extract raw centre-to-centre edge endpoints (adjustEdgeEndpoints runs on main thread)
    const edges = simLinks.map(function(link) {
      const src = typeof link.source === 'object' ? link.source : nodeMap.get(link.source);
      const tgt = typeof link.target === 'object' ? link.target : nodeMap.get(link.target);
      return {
        id: link.id,
        sx: src ? (src.x || 0) : 0,
        sy: src ? (src.y || 0) : 0,
        tx: tgt ? (tgt.x || 0) : 0,
        ty: tgt ? (tgt.y || 0) : 0,
      };
    });

    // Compute bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < positions.length; i++) {
      const pos  = positions[i];
      const node = simNodes[i];
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + node.width);
      maxY = Math.max(maxY, pos.y + node.height);
    }

    const pad = options.padding;
    const bounds = {
      x:      minX - pad,
      y:      minY - pad,
      width:  (maxX - minX) + pad * 2,
      height: (maxY - minY) + pad * 2,
    };

    self.postMessage({ ok: true, positions, edges, bounds });
  } catch (err) {
    self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
`;
