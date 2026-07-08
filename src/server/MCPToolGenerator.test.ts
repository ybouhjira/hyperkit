import { describe, it, expect } from 'vitest';
import { generateMCPTools, routeMCPToolCall, buildToolName } from './MCPToolGenerator';
import type { MCPToolDefinition } from './MCPToolGenerator';
import type { NavigableInfo } from '../navigation/NavigableRegistry';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNav(id: string, label: string, actions: NavigableInfo['actions']): NavigableInfo {
  return { id, label, actions };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('generateMCPTools', () => {
  it('generates tools from navigable info', () => {
    const navs: NavigableInfo[] = [
      makeNav('chat-panel', 'Chat Panel', [
        { name: 'select', description: 'Select item' },
        { name: 'clear', description: 'Clear selection' },
      ]),
    ];

    const tools = generateMCPTools(navs);
    expect(tools).toHaveLength(2);
  });

  it('produces zero tools when navigables array is empty', () => {
    expect(generateMCPTools([])).toHaveLength(0);
  });

  it('produces zero tools when a navigable has no actions', () => {
    const navs: NavigableInfo[] = [makeNav('empty-nav', 'Empty', [])];
    expect(generateMCPTools(navs)).toHaveLength(0);
  });

  // ── Tool naming ──────────────────────────────────────────────────────────

  it('uses underscore format for tool names (dash-separated id)', () => {
    const navs: NavigableInfo[] = [
      makeNav('chat-panel', 'Chat Panel', [{ name: 'select', description: 'Select' }]),
    ];
    const tools = generateMCPTools(navs);
    expect(tools[0].name).toBe('chat_panel_select');
  });

  it('uses underscore format for tool names (dot-separated id)', () => {
    const navs: NavigableInfo[] = [
      makeNav('reports.list', 'Reports List', [{ name: 'refresh', description: 'Refresh' }]),
    ];
    const tools = generateMCPTools(navs);
    expect(tools[0].name).toBe('reports_list_refresh');
  });

  it('uses underscore format when action name contains dashes', () => {
    const navs: NavigableInfo[] = [
      makeNav('sidebar', 'Sidebar', [{ name: 'scroll-to-top', description: 'Scroll' }]),
    ];
    const tools = generateMCPTools(navs);
    expect(tools[0].name).toBe('sidebar_scroll_to_top');
  });

  // ── input_schema ─────────────────────────────────────────────────────────

  it('actions with params get proper input_schema', () => {
    const paramsSchema = {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    };
    const navs: NavigableInfo[] = [
      makeNav('list', 'List', [
        { name: 'select', description: 'Select item', params: paramsSchema },
      ]),
    ];
    const tools = generateMCPTools(navs);
    expect(tools[0].input_schema).toEqual(paramsSchema);
  });

  it('actions without params get empty schema', () => {
    const navs: NavigableInfo[] = [
      makeNav('list', 'List', [{ name: 'clear', description: 'Clear' }]),
    ];
    const tools = generateMCPTools(navs);
    expect(tools[0].input_schema).toEqual({ type: 'object', properties: {} });
  });

  // ── description ──────────────────────────────────────────────────────────

  it('description includes navigable label and action description', () => {
    const navs: NavigableInfo[] = [
      makeNav('chat-panel', 'Chat Panel', [{ name: 'send', description: 'Send a message' }]),
    ];
    const [tool] = generateMCPTools(navs) as [MCPToolDefinition];
    expect(tool.description).toContain('Chat Panel');
    expect(tool.description).toContain('Send a message');
  });

  // ── Multiple navigables ───────────────────────────────────────────────────

  it('multiple navigables produce multiple tools', () => {
    const navs: NavigableInfo[] = [
      makeNav('panel-a', 'Panel A', [
        { name: 'open', description: 'Open' },
        { name: 'close', description: 'Close' },
      ]),
      makeNav('panel-b', 'Panel B', [{ name: 'refresh', description: 'Refresh' }]),
    ];

    const tools = generateMCPTools(navs);
    expect(tools).toHaveLength(3);

    const names = tools.map((t) => t.name);
    expect(names).toContain('panel_a_open');
    expect(names).toContain('panel_a_close');
    expect(names).toContain('panel_b_refresh');
  });
});

// ── routeMCPToolCall ──────────────────────────────────────────────────────────

describe('routeMCPToolCall', () => {
  const navs: NavigableInfo[] = [
    makeNav('chat-panel', 'Chat Panel', [
      { name: 'select', description: 'Select' },
      { name: 'clear', description: 'Clear' },
    ]),
    makeNav('sidebar', 'Sidebar', [{ name: 'toggle', description: 'Toggle' }]),
  ];

  it('parses tool name correctly and returns target + action', () => {
    const result = routeMCPToolCall('chat_panel_select', { id: '42' }, navs);
    expect(result).not.toBeNull();
    expect(result!.target).toBe('chat-panel');
    expect(result!.action).toBe('select');
    expect(result!.params).toEqual({ id: '42' });
  });

  it('resolves actions from a second navigable', () => {
    const result = routeMCPToolCall('sidebar_toggle', null, navs);
    expect(result).not.toBeNull();
    expect(result!.target).toBe('sidebar');
    expect(result!.action).toBe('toggle');
  });

  it('passes args through as params unchanged', () => {
    const args = { foo: 'bar', count: 3 };
    const result = routeMCPToolCall('chat_panel_clear', args, navs);
    expect(result!.params).toBe(args);
  });

  it('returns null for unknown tool names', () => {
    expect(routeMCPToolCall('nonexistent_tool', null, navs)).toBeNull();
  });

  it('returns null when navigables list is empty', () => {
    expect(routeMCPToolCall('chat_panel_select', null, [])).toBeNull();
  });

  it('returns null for empty tool name', () => {
    expect(routeMCPToolCall('', null, navs)).toBeNull();
  });
});

// ── buildToolName ─────────────────────────────────────────────────────────────

describe('buildToolName', () => {
  it('converts dashes to underscores', () => {
    expect(buildToolName('chat-panel', 'select')).toBe('chat_panel_select');
  });

  it('converts dots to underscores', () => {
    expect(buildToolName('reports.list', 'refresh')).toBe('reports_list_refresh');
  });

  it('handles mixed separators', () => {
    expect(buildToolName('app.chat-panel', 'scroll-to-top')).toBe('app_chat_panel_scroll_to_top');
  });

  it('handles already-underscore names', () => {
    expect(buildToolName('my_panel', 'my_action')).toBe('my_panel_my_action');
  });
});
