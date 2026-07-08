import type { NavigableInfo, NavigableActionSchema } from '../navigation/NavigableRegistry';

export interface MCPToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/**
 * Sanitize a navigable ID for use in an MCP tool name.
 * Replaces dots, dashes, and spaces with underscores; strips other non-word chars.
 */
function sanitizeId(id: string): string {
  return id.replace(/[.\-\s]+/g, '_').replace(/[^\w]/g, '');
}

/**
 * Build a fully-qualified MCP tool name from a navigable ID and action name.
 * Format: `{navigableId}_{actionName}` (underscores, no dots)
 */
export function buildToolName(navigableId: string, actionName: string): string {
  return `${sanitizeId(navigableId)}_${sanitizeId(actionName)}`;
}

/**
 * Generate MCP-compatible tool definitions from navigable info.
 * Each navigable action becomes one MCP tool.
 *
 * Tool naming: `{navigableId}_{actionName}` (underscores, no dots)
 * If action has params schema, it becomes the tool's input_schema.
 * If no params, input_schema is `{ type: 'object', properties: {} }`.
 */
export function generateMCPTools(navigables: NavigableInfo[]): MCPToolDefinition[] {
  const tools: MCPToolDefinition[] = [];

  for (const nav of navigables) {
    for (const action of nav.actions) {
      tools.push(toolFromAction(nav.id, nav.label, action));
    }
  }

  return tools;
}

function toolFromAction(
  navigableId: string,
  navigableLabel: string,
  action: NavigableActionSchema
): MCPToolDefinition {
  const name = buildToolName(navigableId, action.name);
  const description = `[${navigableLabel}] ${action.description}`;
  const input_schema: Record<string, unknown> = action.params ?? {
    type: 'object',
    properties: {},
  };

  return { name, description, input_schema };
}

/**
 * Parse an MCP tool name back to its navigable ID and action name components.
 * Uses the first underscore-separated segment that matches a known navigable.
 *
 * Returns `{ target, action, params }` for dispatching, or `null` if the tool
 * name cannot be mapped to a known navigable.
 *
 * @param toolName - The MCP tool name (e.g. `chat_panel_select`)
 * @param args - The arguments passed by the MCP caller
 * @param navigables - The current list of known navigables (used to resolve ambiguity)
 */
export function routeMCPToolCall(
  toolName: string,
  args: unknown,
  navigables: NavigableInfo[]
): { target: string; action: string; params: unknown } | null {
  // Build a lookup map: toolName → { target, action }
  for (const nav of navigables) {
    for (const action of nav.actions) {
      const expected = buildToolName(nav.id, action.name);
      if (expected === toolName) {
        return { target: nav.id, action: action.name, params: args };
      }
    }
  }
  return null;
}
