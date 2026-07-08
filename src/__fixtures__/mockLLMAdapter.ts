import type { LLMAdapter, LLMMessage, LLMToolCall } from '../hooks/createLLMUIController';

interface MockResponse {
  pattern: RegExp;
  response: (match: RegExpMatchArray) => { content: string; toolCalls?: LLMToolCall[] };
}

const mockResponses: MockResponse[] = [
  {
    pattern: /switch\s+theme\s+to\s+(\w+)/i,
    response: (match) => ({
      content: `Switching theme to ${match[1] ?? 'default'}. Let me know if you'd like to try a different one!`,
      toolCalls: [
        { name: 'switchTheme', params: { themeId: (match[1] ?? 'default').toLowerCase() } },
      ],
    }),
  },
  {
    pattern: /(?:show|switch|change)\s+(?:to\s+|as\s+)?(\w+)\s+(?:view|mode)/i,
    response: (match) => ({
      content: `Switching to ${match[1] ?? 'default'} view.`,
      toolCalls: [
        { name: 'changeView', params: { viewMode: (match[1] ?? 'default').toLowerCase() } },
      ],
    }),
  },
  {
    pattern: /(?:collapse|hide|close).*(?:left|right|bottom)\s*panel/i,
    response: (match) => {
      const position = match[0].match(/left|right|bottom/i)?.[0] || 'left';
      return {
        content: `Collapsing the ${position} panel.`,
        toolCalls: [{ name: 'togglePanel', params: { panelId: position, collapsed: true } }],
      };
    },
  },
  {
    pattern: /(?:expand|show|open).*(?:left|right|bottom)\s*panel/i,
    response: (match) => {
      const position = match[0].match(/left|right|bottom/i)?.[0] || 'left';
      return {
        content: `Expanding the ${position} panel.`,
        toolCalls: [{ name: 'togglePanel', params: { panelId: position, collapsed: false } }],
      };
    },
  },
  {
    pattern: /filter.*(?:by\s+)?(?:project\s+)?["""]?(\w[\w-]*)["""]?/i,
    response: (match) => ({
      content: `Filtering sessions by project "${match[1]}".`,
      toolCalls: [{ name: 'filterSessions', params: { projectFilter: match[1] } }],
    }),
  },
  {
    pattern: /search.*["""](.+?)["""]|search\s+(?:for\s+)?(.+)/i,
    response: (match) => {
      const query = match[1] || match[2];
      return {
        content: `Searching for "${query}".`,
        toolCalls: [{ name: 'searchSessions', params: { query } }],
      };
    },
  },
  {
    pattern: /create.*(?:new\s+)?session/i,
    response: () => ({
      content: `Opening the Create Session dialog for you.`,
      toolCalls: [{ name: 'createSession', params: {} }],
    }),
  },
  {
    pattern: /(?:change|set).*font.*(?:to\s+)?["""]?(.+?)["""]?\s*$/i,
    response: (match) => ({
      content: `Changing code font to ${match[1]}.`,
      toolCalls: [{ name: 'changeFont', params: { font: match[1] } }],
    }),
  },
  {
    pattern: /what.*(?:can|do)|help|commands/i,
    response: () => ({
      content: `Here's what I can help you with:\n\n• **Switch theme** - "Switch theme to warp"\n• **Change view** - "Show as kanban view"\n• **Toggle panels** - "Collapse left panel"\n• **Filter sessions** - "Filter by project hyperkit"\n• **Search** - "Search for authentication"\n• **Create session** - "Create new session"\n• **Change font** - "Change font to JetBrains Mono"\n\nJust describe what you'd like to do!`,
    }),
  },
];

// Default fallback
const fallbackResponse = {
  content:
    'I understand you want to interact with the IDE. Try commands like:\n- "Switch theme to warp"\n- "Show as kanban view"\n- "Collapse left panel"\n- "Filter by project hyperkit"',
};

export function createMockLLMAdapter(delay: number = 800): LLMAdapter {
  return {
    sendMessage: async (messages: LLMMessage[]) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (!lastUserMsg) return fallbackResponse;

      for (const mock of mockResponses) {
        const match = lastUserMsg.content.match(mock.pattern);
        if (match) {
          return mock.response(match);
        }
      }

      return fallbackResponse;
    },
  };
}
