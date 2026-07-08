import { createSignal, Accessor } from 'solid-js';

// === Types ===

/** A UI action the LLM can invoke */
export interface UIAction {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  handler: (params: Record<string, unknown>) => void | Promise<void>;
}

/** A tool call from the LLM */
export interface LLMToolCall {
  name: string;
  params: Record<string, unknown>;
}

/** A message in the chat */
export interface LLMMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: LLMToolCall[];
  toolResults?: { name: string; result: string }[];
  timestamp: Date;
}

/** Adapter interface for different LLM backends */
export interface LLMAdapter {
  sendMessage: (
    messages: LLMMessage[],
    availableTools: UIAction[]
  ) => Promise<{
    content: string;
    toolCalls?: LLMToolCall[];
  }>;
}

/** Options for the controller */
export interface LLMUIControllerOptions {
  adapter: LLMAdapter;
  systemPrompt?: string;
}

/** Return type of the hook */
export interface LLMUIControllerReturn {
  // State
  messages: Accessor<LLMMessage[]>;
  isProcessing: Accessor<boolean>;
  error: Accessor<string | null>;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  registerAction: (action: UIAction) => void;
  unregisterAction: (name: string) => void;
  clearMessages: () => void;

  // Info
  registeredActions: Accessor<UIAction[]>;
}

export function createLLMUIController(options: LLMUIControllerOptions): LLMUIControllerReturn {
  const [messages, setMessages] = createSignal<LLMMessage[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [actions, setActions] = createSignal<UIAction[]>([]);

  // Add system prompt as first message if provided
  if (options.systemPrompt) {
    setMessages([
      {
        id: 'system-0',
        role: 'system',
        content: options.systemPrompt,
        timestamp: new Date(),
      },
    ]);
  }

  const registerAction = (action: UIAction) => {
    setActions((prev) => [...prev.filter((a) => a.name !== action.name), action]);
  };

  const unregisterAction = (name: string) => {
    setActions((prev) => prev.filter((a) => a.name !== name));
  };

  const clearMessages = () => {
    const systemMsgs = messages().filter((m) => m.role === 'system');
    setMessages(systemMsgs);
    setError(null);
  };

  const sendMessage = async (content: string) => {
    if (isProcessing()) return;

    const userMsg: LLMMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await options.adapter.sendMessage([...messages(), userMsg], actions());

      // Execute any tool calls
      const toolResults: { name: string; result: string }[] = [];
      if (response.toolCalls) {
        for (const call of response.toolCalls) {
          const action = actions().find((a) => a.name === call.name);
          if (action) {
            try {
              await action.handler(call.params);
              toolResults.push({ name: call.name, result: 'success' });
            } catch (e) {
              toolResults.push({ name: call.name, result: `error: ${e}` });
            }
          } else {
            toolResults.push({ name: call.name, result: 'error: action not found' });
          }
        }
      }

      const assistantMsg: LLMMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        toolCalls: response.toolCalls,
        toolResults: toolResults.length > 0 ? toolResults : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    error,
    sendMessage,
    registerAction,
    unregisterAction,
    clearMessages,
    registeredActions: actions,
  };
}
