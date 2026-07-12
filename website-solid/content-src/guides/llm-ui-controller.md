---
title: LLM UI Controller
sidebar_position: 7
description: Let an LLM drive your UI through natural language and typed actions.
---

# LLM UI Controller

## Overview

The LLM UI Controller system enables AI-powered control of UI components through natural language. It consists of three main parts:

1. **createLLMUIController** - Core orchestration hook
2. **LLMChatBox** - Chat interface component
3. **Mock LLM Adapter** - Demo/testing fixture

## Architecture

```
┌─────────────────┐
│  LLMChatBox     │ ← User types natural language
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ createLLMUIController   │ ← Orchestrates LLM ↔ UI
├─────────────────────────┤
│ • Message history       │
│ • Action registry       │
│ • Tool execution        │
└────────┬────────────────┘
         │
         ├─────────────► LLM Adapter (sends messages)
         │
         └─────────────► UI Actions (executes tool calls)
```

## Files Created

### Core Hook

- **`src/hooks/createLLMUIController.ts`** - Main orchestration logic
  - Maintains message history
  - Registers/unregisters UI actions
  - Executes tool calls from LLM responses
  - Returns reactive state (messages, isProcessing, error)

### Component

- **`src/composites/LLMChatBox/LLMChatBox.tsx`** - Chat interface
  - Message list with auto-scroll
  - User/assistant message bubbles
  - Tool call badges (green for success, red for errors)
  - Input area with Enter-to-send
  - Loading indicator (typing dots)
  - Error banner
  - Minimize/expand toggle

- **`src/composites/LLMChatBox/index.ts`** - Barrel export
- **`src/composites/LLMChatBox/LLMChatBox.stories.tsx`** - Storybook demos

### Testing/Demo

- **`src/__fixtures__/mockLLMAdapter.ts`** - Pattern-matching mock LLM
  - Recognizes commands like "switch theme to X"
  - Returns appropriate tool calls
  - No real API calls needed for demo

### Exports

- Updated **`src/index.ts`** with all new exports

## Usage Example

```tsx
import { createLLMUIController, LLMChatBox, createMockLLMAdapter } from '@ybouhjira/hyperkit';

const MyApp = () => {
  const adapter = createMockLLMAdapter();
  const controller = createLLMUIController({
    adapter,
    systemPrompt: 'You control an IDE interface...',
  });

  // Register actions the LLM can invoke
  controller.registerAction({
    name: 'switchTheme',
    description: 'Change the UI theme',
    parameters: {
      themeId: { type: 'string', description: 'Theme ID' },
    },
    handler: (params) => {
      // Actually change the theme
      setTheme(params.themeId);
    },
  });

  return <LLMChatBox controller={controller} />;
};
```

## Storybook Demos

### Interactive Demo

**Path**: `Composites/LLMChatBox` → "Interactive Demo"

Shows:

- Live IDE state panel (theme, view mode, panels, search)
- Chat interface on the right
- Real-time UI updates when LLM executes actions
- Visual feedback for each action

Try commands like:

- "Switch theme to warp"
- "Show as kanban view"
- "Collapse left panel"
- "Filter by project hyperkit"
- "Search for authentication"

### Chat Only

Simple chat interface without the demo state panel.

### Custom Styling

Shows how to apply custom classes and styling.

## Key Features

### Message Types

- **User messages** - Right-aligned, blue background
- **Assistant messages** - Left-aligned, gray background
- **System messages** - Hidden from display (used for prompts)

### Tool Call Visualization

When the assistant executes actions, small badges appear:

- ✓ actionName (green) - Success
- ✗ actionName (red) - Error

### Auto-resize Input

The textarea automatically grows as you type (up to 120px height).

### Keyboard Shortcuts

- **Enter** - Send message
- **Shift + Enter** - New line

### Error Handling

- Red banner at top when errors occur
- Individual tool call errors shown in badges
- Graceful fallback for unknown actions

## Mock LLM Adapter

The mock adapter uses regex patterns to recognize commands:

| Pattern                   | Action                                         |
| ------------------------- | ---------------------------------------------- |
| "switch theme to X"       | `switchTheme({ themeId: X })`                  |
| "show as X view"          | `changeView({ viewMode: X })`                  |
| "collapse/expand Y panel" | `togglePanel({ panelId: Y, collapsed: bool })` |
| "filter by project X"     | `filterSessions({ projectFilter: X })`         |
| "search for X"            | `searchSessions({ query: X })`                 |
| "create session"          | `createSession({})`                            |
| "change font to X"        | `changeFont({ font: X })`                      |

## Integration with Real LLM

To use a real LLM backend, implement the `LLMAdapter` interface:

```typescript
const myAdapter: LLMAdapter = {
  sendMessage: async (messages, availableTools) => {
    // 1. Format messages for your LLM API
    // 2. Include availableTools as function definitions
    // 3. Call LLM API
    // 4. Parse response for tool calls
    // 5. Return { content, toolCalls }
  },
};
```

Example with Anthropic Claude:

```typescript
const claudeAdapter: LLMAdapter = {
  sendMessage: async (messages, availableTools) => {
    const tools = availableTools.map((action) => ({
      name: action.name,
      description: action.description,
      input_schema: {
        type: 'object',
        properties: action.parameters,
      },
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools,
    });

    return {
      content: response.content.find((b) => b.type === 'text')?.text || '',
      toolCalls: response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ name: b.name, params: b.input })),
    };
  },
};
```

## Styling

The component uses Tailwind classes matching the hyperkit design system:

- **Background**: `bg-zinc-900`, `bg-zinc-950`
- **Borders**: `border-zinc-800`, `border-zinc-700`
- **Text**: `text-zinc-100`, `text-zinc-400`
- **Accents**: `bg-blue-600`, `text-blue-400`
- **Success**: `bg-green-500/20`, `text-green-300`
- **Error**: `bg-red-500/20`, `text-red-400`

All components support the `class` prop for custom styling.

## Testing

The mock adapter makes it easy to test UI actions without real LLM calls:

```typescript
import { createMockLLMAdapter } from '@ybouhjira/hyperkit';

const adapter = createMockLLMAdapter(200); // 200ms delay

// Fast tests with controlled responses
```

## View in Storybook

```bash
cd ~/hyperkit
npm run storybook
```

Navigate to: http://localhost:6006/?path=/story/composites-llmchatbox--interactive-demo
