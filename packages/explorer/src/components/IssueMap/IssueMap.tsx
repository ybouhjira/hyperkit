import { createSignal, createMemo, onMount, onCleanup, Show, For } from 'solid-js';
import type { JSX } from 'solid-js';
import type { Graph, LayoutAlgorithm, Node, NodeId } from '@ybouhjira/diagram-core';
import { registerNodeRenderer } from '@ybouhjira/diagram-core';
import { DiagramProvider, Diagram, useDiagramContext } from '@ybouhjira/diagram-solid';
import { applyDiagramTheme, darkTheme } from '@ybouhjira/diagram-svg';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import type { IssueData, IssueStatus, IssueMapBehavior, IssueMapConfig } from './types';
import { DEFAULT_BEHAVIOR } from './types';
import { buildIssueGraph } from './buildGraph';
import type { PartsConfig, ResolvedPart, ComponentPreset } from './parts';
import { resolveParts } from './parts';
import type { IssueMapPartName } from './presets';
import { issueMapAnatomy, issueMapPresets } from './presets';
import type { IssueMapPresetName } from './presets';

// Map status to semantic theme variable names
const STATUS_VAR: Record<IssueStatus, string> = {
  active: 'var(--sk-success, #4caf50)',
  ready: 'var(--sk-accent, #4fc3f7)',
  blocked: 'var(--sk-error, #ef5350)',
  pending: 'var(--sk-text-muted, #666)',
  closed: 'var(--sk-text-muted, #888)',
};

// Layer colors - visually distinct, works on dark backgrounds
const LAYER_COLORS: Record<string, string> = {
  Vision: '#a855f7', // purple
  Products: '#f97316', // orange
  Dashboard: '#3b82f6', // blue
  Features: '#06b6d4', // cyan
  Explorer: '#14b8a6', // teal
  Core: '#22c55e', // green
  Infrastructure: '#6b7280', // gray
  Document: '#ec4899', // pink
  Apps: '#f59e0b', // amber
};

function createIssueNodeElement(node: Node<IssueData>, parts: Record<IssueMapPartName, ResolvedPart>): HTMLElement {
  const issue = node.data;
  const pct =
    issue.progress.total > 0
      ? Math.round((issue.progress.done / issue.progress.total) * 100)
      : 0;
  const statusColor = STATUS_VAR[issue.status];

  const el = document.createElement('div');
  el.style.cssText = `
    width: 100%; height: 100%;
    padding: 10px 14px;
    background: var(--sk-bg-elevated);
    border: 2px solid ${statusColor};
    border-radius: var(--sk-radius-md);
    font-family: var(--sk-font-ui);
    color: var(--sk-text-primary);
    display: flex; flex-direction: column; justify-content: center; gap: 6px;
    box-sizing: border-box; overflow: hidden;
    ${issue.status === 'active' ? 'box-shadow: var(--sk-shadow-md);' : ''}
  `;

  // Header: issue number + status badge
  const header = document.createElement('div');
  header.style.cssText =
    'display: flex; align-items: center; justify-content: space-between; gap: 8px;';

  if (parts.nodeNumber.enabled) {
    const num = document.createElement('span');
    num.style.cssText = `
      font-family: var(--sk-font-mono);
      font-size: var(--sk-font-size-sm);
      font-weight: var(--sk-font-weight-bold);
      color: var(--sk-accent);
    `;
    // Apply part style overrides
    Object.entries(parts.nodeNumber.style).forEach(([k, v]) => {
      num.style.setProperty(k, v as string);
    });
    num.textContent = `#${issue.number}`;
    header.appendChild(num);
  }

  if (parts.nodeBadge.enabled) {
    const badge = document.createElement('span');
    badge.style.cssText = `
      font-size: var(--sk-font-size-xs);
      padding: 2px 8px;
      border-radius: var(--sk-radius-sm);
      border: 1px solid ${statusColor};
      color: ${statusColor};
      font-weight: var(--sk-font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    Object.entries(parts.nodeBadge.style).forEach(([k, v]) => {
      badge.style.setProperty(k, v as string);
    });
    badge.textContent = issue.status;
    header.appendChild(badge);
  }

  // Only add header if it has children
  if (header.childElementCount > 0) {
    el.appendChild(header);
  }

  if (parts.nodeTitle.enabled) {
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: var(--sk-font-size-sm);
      color: var(--sk-text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.3;
    `;
    Object.entries(parts.nodeTitle.style).forEach(([k, v]) => {
      title.style.setProperty(k, v as string);
    });
    title.textContent = issue.title.replace(/^\[.*?\]\s*/, '');
    el.appendChild(title);
  }

  if (parts.nodeProjectLabel.enabled) {
    const projectLabel = document.createElement('div');
    projectLabel.style.cssText = `
      font-size: 10px;
      color: var(--sk-text-muted);
      font-family: var(--sk-font-mono);
      opacity: 0.7;
    `;
    Object.entries(parts.nodeProjectLabel.style).forEach(([k, v]) => {
      projectLabel.style.setProperty(k, v as string);
    });
    projectLabel.textContent = issue.project;
    el.appendChild(projectLabel);
  }

  if (parts.nodeProgressBar.enabled && issue.progress.total > 0) {
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      height: 4px;
      background: var(--sk-bg-tertiary);
      border-radius: var(--sk-radius-sm);
      overflow: hidden;
      margin-top: 2px;
    `;
    const fill = document.createElement('div');
    fill.style.cssText = `
      height: 100%; width: ${pct}%;
      background: ${statusColor};
      border-radius: var(--sk-radius-sm);
    `;
    barContainer.appendChild(fill);
    el.appendChild(barContainer);
  }

  return el;
}

interface IssueMapInnerProps {
  issues: readonly IssueData[];
  behavior: IssueMapBehavior;
  parts: Record<IssueMapPartName, ResolvedPart>;
  rootRef?: HTMLDivElement;
}

function IssueMapInner(props: IssueMapInnerProps) {
  const { actions } = useDiagramContext();
  let containerRef: HTMLDivElement | undefined;
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
    // Re-fit view after fullscreen toggle
    setTimeout(() => actions.fitViewToContent(10), 100);
  };

  onMount(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });
  onCleanup(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });

  const toggleFullscreen = () => {
    const target = props.rootRef ?? containerRef;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.requestFullscreen();
    }
  };

  onMount(async () => {
    // Apply dark theme to the diagram
    if (containerRef) {
      applyDiagramTheme(containerRef, { ...darkTheme, background: 'var(--sk-bg-primary, #1e1e20)' });
    }
    // Build group map for compound layout + visual groups
    const uniqueProjects = new Set(props.issues.map((i) => i.project));
    const groupKey = uniqueProjects.size > 1 ? 'project' : 'layer';
    const groupMap = new Map<string, string[]>();
    for (const issue of props.issues) {
      const groupValue = String(issue[groupKey as keyof IssueData]);
      const existing = groupMap.get(groupValue) ?? [];
      existing.push(issue.id);
      groupMap.set(groupValue, existing);
    }

    // Use compound dagre layout — clusters same-group nodes together
    const bhv = props.behavior;
    const issueMapLayout: LayoutAlgorithm<unknown> = {
      ...dagreLayout,
      layout: (g: Graph) =>
        dagreLayout.layout(g, {
          nodeSpacing: bhv.nodeSpacing,
          rankSpacing: bhv.rankSpacing,
          groups: props.parts.layerGroups.enabled ? groupMap : undefined,
        }),
    };
    actions.setLayoutAlgorithm(issueMapLayout);
    await actions.runLayout();

    // Create visual groups after layout
    if (props.parts.layerGroups.enabled) {
      for (const [groupLabel, nodeIds] of groupMap) {
        const color = LAYER_COLORS[groupLabel] ?? '#6b7280';
        actions.createGroup(nodeIds as NodeId[], groupLabel, color);
      }
    }

    // Fit content with a short delay to let SVG render (if enabled)
    if (props.behavior.autoFit) {
      setTimeout(() => actions.fitViewToContent(10), 150);
    }
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...props.parts.graph.style,
      }}
    >
      <Diagram showGrid={props.behavior.showGrid} style={{ width: '100%', height: '100%' }} />
      <Show when={props.parts.zoomControls.enabled}>
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            'flex-direction': 'column',
            gap: '4px',
            'z-index': '10',
            ...props.parts.zoomControls.style,
          }}
        >
          <button
            onClick={() => actions.zoomIn()}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid var(--sk-border, #444)',
              'border-radius': 'var(--sk-radius-sm, 4px)',
              background: 'var(--sk-bg-elevated, #2a2a2a)',
              color: 'var(--sk-text-primary, #fff)',
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '16px',
              'font-weight': 'bold',
            }}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => actions.zoomOut()}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid var(--sk-border, #444)',
              'border-radius': 'var(--sk-radius-sm, 4px)',
              background: 'var(--sk-bg-elevated, #2a2a2a)',
              color: 'var(--sk-text-primary, #fff)',
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '16px',
              'font-weight': 'bold',
            }}
            title="Zoom out"
          >
            -
          </button>
          <button
            onClick={() => actions.fitView()}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid var(--sk-border, #444)',
              'border-radius': 'var(--sk-radius-sm, 4px)',
              background: 'var(--sk-bg-elevated, #2a2a2a)',
              color: 'var(--sk-text-primary, #fff)',
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '12px',
            }}
            title="Fit to view"
          >
            Fit
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid var(--sk-border, #444)',
              'border-radius': 'var(--sk-radius-sm, 4px)',
              background: 'var(--sk-bg-elevated, #2a2a2a)',
              color: 'var(--sk-text-primary, #fff)',
              cursor: 'pointer',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '14px',
            }}
            title={isFullscreen() ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen() ? '⊡' : '⊞'}
          </button>
        </div>
      </Show>
    </div>
  );
}

function renderSwitcher(
  behavior: IssueMapBehavior,
  groups: string[],
  selectedGroup: () => string,
  onSelect: (group: string) => void,
  partConfig: ResolvedPart
): JSX.Element {
  const current = selectedGroup();

  if (behavior.switcherVariant === 'tabs') {
    return (
      <div
        style={{
          display: 'flex',
          gap: '0',
          'border-bottom': '1px solid var(--sk-border, #333)',
          padding: '0 12px',
          ...partConfig.style,
        }}
      >
        <For each={groups}>
          {(group) => {
            const isActive = group === current;
            return (
              <button
                onClick={() => onSelect(group)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? 'var(--sk-accent, #4fc3f7)' : 'var(--sk-text-secondary, #aaa)',
                  cursor: 'pointer',
                  'border-bottom': isActive
                    ? '2px solid var(--sk-accent, #4fc3f7)'
                    : '2px solid transparent',
                  'font-size': '13px',
                  'font-family': 'var(--sk-font-ui)',
                  'font-weight': isActive ? '600' : '400',
                  transition: 'all 0.2s ease',
                }}
              >
                {group}
              </button>
            );
          }}
        </For>
      </div>
    );
  }

  if (behavior.switcherVariant === 'dropdown') {
    return (
      <div style={{ padding: '8px 12px', ...partConfig.style }}>
        <select
          value={current}
          onInput={(e) => onSelect(e.currentTarget.value)}
          style={{
            background: 'var(--sk-bg-elevated, #2a2a2a)',
            color: 'var(--sk-text-primary, #fff)',
            border: '1px solid var(--sk-border, #444)',
            'border-radius': 'var(--sk-radius-sm, 4px)',
            padding: '6px 10px',
            'font-size': '13px',
            cursor: 'pointer',
            'font-family': 'var(--sk-font-ui)',
          }}
        >
          <For each={groups}>{(group) => <option value={group}>{group}</option>}</For>
        </select>
      </div>
    );
  }

  if (behavior.switcherVariant === 'pill') {
    return (
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 12px',
          background: 'var(--sk-bg-secondary, #1e1e1e)',
          'border-radius': 'var(--sk-radius-md, 8px)',
          margin: '8px',
          ...partConfig.style,
        }}
      >
        <For each={groups}>
          {(group) => {
            const isActive = group === current;
            return (
              <button
                onClick={() => onSelect(group)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  background: isActive ? 'var(--sk-accent, #4fc3f7)' : 'transparent',
                  color: isActive ? 'white' : 'var(--sk-text-secondary, #aaa)',
                  cursor: 'pointer',
                  'border-radius': 'var(--sk-radius-sm, 4px)',
                  'font-size': '13px',
                  'font-family': 'var(--sk-font-ui)',
                  transition: 'all 0.2s ease',
                }}
              >
                {group}
              </button>
            );
          }}
        </For>
      </div>
    );
  }

  return <></>;
}

export interface IssueMapRenderedParts {
  /** The group switcher element (or null if disabled) */
  switcher: JSX.Element | null;
  /** The diagram graph element */
  graph: JSX.Element;
  /** The zoom controls element (or null if disabled) */
  zoomControls: JSX.Element | null;
}

export interface IssueMapProps {
  issues: readonly IssueData[];
  /** Behavioral configuration */
  behavior?: Partial<IssueMapBehavior>;
  /** Named preset or preset object */
  preset?: IssueMapPresetName | ComponentPreset<IssueMapPartName>;
  /** Per-part overrides (merged on top of preset) */
  parts?: PartsConfig<IssueMapPartName>;
  /** Custom layout function — receives rendered parts, returns JSX */
  layout?: (parts: IssueMapRenderedParts) => JSX.Element;

  // Backward compat
  config?: Partial<IssueMapConfig>;
}

export function IssueMap(props: IssueMapProps) {
  // 1. Resolve behavior config (backward compat: config prop maps to behavior)
  const behavior = createMemo(() => ({
    ...DEFAULT_BEHAVIOR,
    ...props.config,  // backward compat
    ...props.behavior,
  }));

  // 2. Resolve preset
  const preset = createMemo(() => {
    if (!props.preset) return undefined;
    if (typeof props.preset === 'string') return issueMapPresets[props.preset];
    return props.preset;
  });

  // 3. Resolve parts
  const resolvedParts = createMemo(() =>
    resolveParts(issueMapAnatomy, preset(), props.parts)
  );

  // 4. Group/filter logic (only if switcher is enabled AND groupBy !== 'none')
  const groups = createMemo(() => {
    const bhv = behavior();
    if (bhv.groupBy === 'none' || !resolvedParts().switcher.enabled) return [];
    const key = bhv.groupBy as keyof IssueData;
    return ['all', ...new Set(props.issues.map((i) => String(i[key])))];
  });

  const [selectedGroup, setSelectedGroup] = createSignal<string>('all');
  const [mounted, setMounted] = createSignal(true);

  // Refs
  let rootRef: HTMLDivElement | undefined;
  let graphContainerRef: HTMLDivElement | undefined;

  const filteredIssues = createMemo(() => {
    const bhv = behavior();
    if (selectedGroup() === 'all' || bhv.groupBy === 'none' || !resolvedParts().switcher.enabled) {
      return props.issues;
    }
    const key = bhv.groupBy as keyof IssueData;
    return props.issues.filter((i) => String(i[key]) === selectedGroup());
  });

  // Helper: Snapshot node positions for FLIP animation
  function snapshotNodePositions(): Map<string, DOMRect> {
    const positions = new Map<string, DOMRect>();
    if (!graphContainerRef) return positions;
    const nodes = graphContainerRef.querySelectorAll('[data-node-id]');
    nodes.forEach((el) => {
      const nodeId = el.getAttribute('data-node-id');
      if (nodeId) {
        positions.set(nodeId, el.getBoundingClientRect());
      }
    });
    return positions;
  }

  function handleGroupChange(group: string) {
    if (group === selectedGroup()) return;
    const bhv = behavior();
    
    if (bhv.transition === 'none') {
      setSelectedGroup(group);
      return;
    }
    
    if (bhv.transition === 'morph') {
      // FLIP Step 1: Snapshot current positions
      const oldPositions = snapshotNodePositions();
      
      // Also create a ghost clone for exiting nodes
      if (graphContainerRef) {
        const clone = graphContainerRef.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '5';
        clone.style.transition = `opacity ${bhv.transitionDuration}ms ease`;
        graphContainerRef.parentElement?.appendChild(clone);
        
        // Start fading out the ghost
        requestAnimationFrame(() => {
          clone.style.opacity = '0';
        });
        
        // Remove ghost after animation
        setTimeout(() => {
          clone.remove();
        }, bhv.transitionDuration);
      }
      
      // FLIP Step 2: Switch data (triggers re-render)
      setSelectedGroup(group);
      
      // FLIP Steps 3-4: After render, compute deltas and animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!graphContainerRef) return;
          const newNodes = graphContainerRef.querySelectorAll('[data-node-id]');
          
          newNodes.forEach((el) => {
            const nodeId = el.getAttribute('data-node-id');
            if (!nodeId) return;
            
            const oldRect = oldPositions.get(nodeId);
            const htmlEl = el as HTMLElement;
            
            if (oldRect) {
              // Node exists in both views — animate from old to new position
              const newRect = el.getBoundingClientRect();
              const dx = oldRect.left - newRect.left;
              const dy = oldRect.top - newRect.top;
              
              if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                // Invert: place at old position
                htmlEl.style.transform = `translate(${dx}px, ${dy}px)`;
                htmlEl.style.transition = 'none';
                
                // Play: animate to new position
                requestAnimationFrame(() => {
                  htmlEl.style.transition = `transform ${bhv.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                  htmlEl.style.transform = 'translate(0, 0)';
                  
                  // Clean up after animation
                  setTimeout(() => {
                    htmlEl.style.transform = '';
                    htmlEl.style.transition = '';
                  }, bhv.transitionDuration);
                });
              }
            } else {
              // New node — fade in
              htmlEl.style.opacity = '0';
              htmlEl.style.transition = 'none';
              requestAnimationFrame(() => {
                htmlEl.style.transition = `opacity ${bhv.transitionDuration}ms ease`;
                htmlEl.style.opacity = '1';
                setTimeout(() => {
                  htmlEl.style.opacity = '';
                  htmlEl.style.transition = '';
                }, bhv.transitionDuration);
              });
            }
          });
        });
      });
      return;
    }
    
    // Existing crossfade/slide logic
    setMounted(false);
    setTimeout(() => {
      setSelectedGroup(group);
      setMounted(true);
    }, bhv.transitionDuration / 2);
  }


  // 5. Render parts as separate elements
  const switcherElement = createMemo(() => {
    const parts = resolvedParts();
    if (!parts.switcher.enabled) return null;
    const bhv = behavior();
    if (bhv.groupBy === 'none') return null;

    return renderSwitcher(bhv, groups(), selectedGroup, handleGroupChange, parts.switcher);
  });

  const graphElement = createMemo(() => {
    const issues = filteredIssues();
    const bhv = behavior();
    const parts = resolvedParts();
    const graph = buildIssueGraph(issues, {
      nodeWidth: bhv.nodeWidth,
      nodeHeight: bhv.nodeHeight,
    });

    // Register node renderer with parts config captured in closure
    registerNodeRenderer(
      'rectangle',
      ((node: Node<IssueData>) => createIssueNodeElement(node, parts)) as (node: Node) => HTMLElement
    );

    return (
      <DiagramProvider initialGraph={graph} editable={false}>
        <IssueMapInner issues={issues} behavior={bhv} parts={parts} rootRef={rootRef} />
      </DiagramProvider>
    );
  });

  // 6. Use custom layout or default layout
  if (props.layout) {
    return props.layout({
      switcher: switcherElement() ?? null,
      graph: graphElement(),
      zoomControls: null, // Zoom controls are inside IssueMapInner for positioning reasons
    });
  }

  // Default layout
  const transitionStyle = createMemo(() => {
    const bhv = behavior();
    if (!mounted()) {
      if (bhv.transition === 'crossfade')
        return { opacity: '0', transition: `opacity ${bhv.transitionDuration}ms ease` };
      if (bhv.transition === 'slide')
        return {
          transform: 'translateX(-100%)',
          transition: `transform ${bhv.transitionDuration}ms ease`,
        };
    }
    return {
      opacity: '1',
      transform: 'translateX(0)',
      transition:
        bhv.transition === 'crossfade'
          ? `opacity ${bhv.transitionDuration}ms ease`
          : bhv.transition === 'slide'
            ? `transform ${bhv.transitionDuration}ms ease`
            : 'none',
    };
  });

  return (
    <div
      ref={rootRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        'flex-direction': 'column',
        background: 'var(--sk-diagram-bg, var(--sk-bg-primary, #1e1e20))',
        ...resolvedParts().root.style,
      }}
    >
      {switcherElement()}
      <div ref={graphContainerRef} style={{ flex: '1', position: 'relative', overflow: 'hidden' }}>
        <Show when={mounted()}>
          <div style={{ width: '100%', height: '100%', ...transitionStyle() }}>
            {graphElement()}
          </div>
        </Show>
      </div>
    </div>
  );
}
