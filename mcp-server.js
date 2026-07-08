#!/usr/bin/env node

/**
 * SolidKit MCP Documentation Server
 * Serves llms.txt and llms-full.txt for AI coding assistants
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new Server(
  {
    name: 'solidkit-docs',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Resource definitions
const RESOURCES = [
  {
    uri: 'file:///llms.txt',
    name: 'SolidKit Component API Index',
    description: 'Quick reference for all SolidKit components and tokens',
    mimeType: 'text/plain',
    path: join(__dirname, 'llms.txt'),
  },
  {
    uri: 'file:///llms-full.txt',
    name: 'SolidKit Complete API Reference',
    description: 'Detailed API documentation with examples for all components',
    mimeType: 'text/plain',
    path: join(__dirname, 'llms-full.txt'),
  },
];

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({
      uri,
      name,
      description,
      mimeType,
    })),
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const resource = RESOURCES.find((r) => r.uri === request.params.uri);

  if (!resource) {
    throw new Error(`Resource not found: ${request.params.uri}`);
  }

  try {
    const content = await readFile(resource.path, 'utf-8');
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: resource.mimeType,
          text: content,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to read resource: ${error.message}`);
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_components',
        description: 'Search SolidKit components by name or keyword',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (component name or keyword)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_component',
        description: 'Get detailed documentation for a specific component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., "Button", "Box", "Card")',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'local_llm',
        description: 'Send a prompt to the local Ollama LLM (Llama 3.2 3B, runs on GPU, free & fast). Use for: simple questions, text formatting, summarization, data extraction, code generation for simple tasks. Responds in 1-3 seconds. Saves API credits by delegating cheap work locally.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'The prompt to send to the local LLM' },
            system: { type: 'string', description: 'Optional system prompt to set context' },
            model: { type: 'string', description: 'Ollama model name. Default: llama3.2:3b' },
            json_mode: { type: 'boolean', description: 'If true, force JSON output format' },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'app_control',
        description: 'Convert a natural language command into an MCP function call using the local LLM. Send commands like "switch to planning mode", "open the chat panel", "show dashboard" and get back structured function calls. The local LLM maps your intent to the correct IDE action. Free & instant (~1-2 seconds).',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Natural language command, e.g. "switch to developer mode", "open terminal panel"' },
            available_tools: { type: 'string', description: 'JSON string of available tool schemas. If not provided, uses default HyperKit IDE tools.' },
          },
          required: ['command'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_components') {
    const query = args.query.toLowerCase();
    const fullDocs = await readFile(join(__dirname, 'llms-full.txt'), 'utf-8');

    // Find matching sections
    const lines = fullDocs.split('\n');
    const matches = [];
    let currentComponent = null;
    let currentSection = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect component headers (## ComponentName)
      if (line.startsWith('## ') && !line.startsWith('## Tokens') && !line.startsWith('## Theme')) {
        if (currentComponent && currentSection.length > 0) {
          if (
            currentComponent.toLowerCase().includes(query) ||
            currentSection.join('\n').toLowerCase().includes(query)
          ) {
            matches.push({
              component: currentComponent,
              content: currentSection.join('\n').trim(),
            });
          }
        }
        currentComponent = line.replace('## ', '').trim();
        currentSection = [line];
      } else if (currentComponent) {
        currentSection.push(line);
      }
    }

    // Check last component
    if (currentComponent && currentSection.length > 0) {
      if (
        currentComponent.toLowerCase().includes(query) ||
        currentSection.join('\n').toLowerCase().includes(query)
      ) {
        matches.push({
          component: currentComponent,
          content: currentSection.join('\n').trim(),
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text:
            matches.length > 0
              ? `Found ${matches.length} component(s):\n\n${matches.map((m) => m.content).join('\n\n---\n\n')}`
              : `No components found matching "${args.query}"`,
        },
      ],
    };
  }

  if (name === 'get_component') {
    const componentName = args.name;
    const fullDocs = await readFile(join(__dirname, 'llms-full.txt'), 'utf-8');

    // Find the component section (try both ## and ### headers)
    const lines = fullDocs.split('\n');
    const componentHeader2 = `## ${componentName}`;
    const componentHeader3 = `### ${componentName}`;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === componentHeader2 || lines[i] === componentHeader3) {
        startIndex = i;
      } else if (startIndex !== -1 && (lines[i].startsWith('## ') || lines[i].startsWith('### '))) {
        endIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      return {
        content: [
          {
            type: 'text',
            text: `Component "${componentName}" not found. Try using search_components to find available components.`,
          },
        ],
      };
    }

    const componentDocs = lines
      .slice(startIndex, endIndex === -1 ? undefined : endIndex)
      .join('\n')
      .trim();

    return {
      content: [
        {
          type: 'text',
          text: componentDocs,
        },
      ],
    };
  }

  if (name === 'local_llm' || name === 'app_control') {
    const OLLAMA_URL = 'http://localhost:11434';

    async function ollamaChat(model, messages, format) {
      const body = { model, messages, stream: false };
      if (format) body.format = format;

      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.message.content;
    }

    if (name === 'local_llm') {
      const model = args.model || 'llama3.2:3b';
      const messages = [];
      if (args.system) messages.push({ role: 'system', content: args.system });
      messages.push({ role: 'user', content: args.prompt });

      const response = await ollamaChat(model, messages, args.json_mode ? 'json' : undefined);
      return { content: [{ type: 'text', text: response }] };
    }

    if (name === 'app_control') {
      const defaultTools = `Available functions:
- switch_mode(modeId: string) - Switch IDE workspace mode. Options: "developer", "dashboard", "planning", "command-center", "ai-agents", "settings", "focus"
- open_panel(panelId: string) - Open a panel. Options: "chat-window", "terminal", "file-explorer", "cost-tracker", "cli-session-list", "reports-list", "perf-dashboard", "runtime-diagnostics", "rules-editor", "navigable-inspector"
- close_panel(panelId: string) - Close a panel by ID
- create_session(name: string, workingDirectory: string) - Create a new chat session
- navigate(path: string) - Navigate to a file or directory`;

      const toolSchema = args.available_tools || defaultTools;
      const systemPrompt = `You are an app controller. Given a user command, output a JSON function call.

${toolSchema}

Rules:
- Output ONLY valid JSON: {"function": "name", "args": {"key": "value"}}
- Pick the most appropriate function for the command
- If the command doesn't match any function, output: {"function": "unknown", "args": {"original": "the command"}}
- Never output anything except the JSON object`;

      const response = await ollamaChat(
        'llama3.2:3b',
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: args.command }],
        'json'
      );
      return { content: [{ type: 'text', text: response }] };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SolidKit MCP Documentation Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
