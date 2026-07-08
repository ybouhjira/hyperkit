import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createLLMUIController, UIAction, LLMAdapter, LLMToolCall } from './createLLMUIController';

describe('createLLMUIController', () => {
  let mockAdapter: LLMAdapter;

  beforeEach(() => {
    mockAdapter = {
      sendMessage: vi.fn(async () => ({
        content: 'Mock response',
      })),
    };
  });

  describe('initialization', () => {
    it('should create controller with adapter', () =>
      createRoot((dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });

        expect(controller.messages()).toEqual([]);
        expect(controller.isProcessing()).toBe(false);
        expect(controller.error()).toBe(null);
        expect(controller.registeredActions()).toEqual([]);

        dispose();
      }));

    it('should initialize with system prompt', () =>
      createRoot((dispose) => {
        const controller = createLLMUIController({
          adapter: mockAdapter,
          systemPrompt: 'You are a helpful assistant',
        });

        const messages = controller.messages();
        expect(messages).toHaveLength(1);
        expect(messages[0].role).toBe('system');
        expect(messages[0].content).toBe('You are a helpful assistant');

        dispose();
      }));
  });

  describe('sendMessage', () => {
    it('should add user message and get response', () =>
      createRoot(async (dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });

        await controller.sendMessage('Hello');

        const messages = controller.messages();
        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe('user');
        expect(messages[0].content).toBe('Hello');
        expect(messages[1].role).toBe('assistant');
        expect(messages[1].content).toBe('Mock response');

        dispose();
      }));

    it('should set processing state during request', () =>
      createRoot(async (dispose) => {
        let resolvePromise: (value: { content: string; toolCalls?: LLMToolCall[] }) => void;
        const delayedAdapter: LLMAdapter = {
          sendMessage: vi.fn(
            () =>
              new Promise((resolve) => {
                resolvePromise = resolve;
              })
          ),
        };

        const controller = createLLMUIController({ adapter: delayedAdapter });

        expect(controller.isProcessing()).toBe(false);

        const promise = controller.sendMessage('Test');
        expect(controller.isProcessing()).toBe(true);

        resolvePromise!({ content: 'Response' });
        await promise;

        expect(controller.isProcessing()).toBe(false);

        dispose();
      }));

    it('should not send message while processing', () =>
      createRoot(async (dispose) => {
        let resolvePromise: (value: { content: string; toolCalls?: LLMToolCall[] }) => void;
        const delayedAdapter: LLMAdapter = {
          sendMessage: vi.fn(
            () =>
              new Promise((resolve) => {
                resolvePromise = resolve;
              })
          ),
        };

        const controller = createLLMUIController({ adapter: delayedAdapter });

        const promise1 = controller.sendMessage('First');
        await controller.sendMessage('Second'); // Should be ignored

        expect(delayedAdapter.sendMessage).toHaveBeenCalledTimes(1);

        resolvePromise!({ content: 'Response' });
        await promise1;

        dispose();
      }));

    it('should handle adapter errors', () =>
      createRoot(async (dispose) => {
        const errorAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => {
            throw new Error('Network error');
          }),
        };

        const controller = createLLMUIController({ adapter: errorAdapter });

        await controller.sendMessage('Test');

        expect(controller.error()).toBe('Network error');
        expect(controller.isProcessing()).toBe(false);

        dispose();
      }));

    it('should clear error on successful send', () =>
      createRoot(async (dispose) => {
        let shouldFail = true;
        const flakyAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => {
            if (shouldFail) {
              shouldFail = false;
              throw new Error('First error');
            }
            return { content: 'Success' };
          }),
        };

        const controller = createLLMUIController({ adapter: flakyAdapter });

        await controller.sendMessage('Test 1');
        expect(controller.error()).toBe('First error');

        await controller.sendMessage('Test 2');
        expect(controller.error()).toBe(null);

        dispose();
      }));
  });

  describe('tool calls', () => {
    it('should execute tool calls from response', () =>
      createRoot(async (dispose) => {
        const handler = vi.fn();
        const action: UIAction = {
          name: 'testAction',
          description: 'Test action',
          parameters: {},
          handler,
        };

        const toolCallAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => ({
            content: 'Executing action',
            toolCalls: [{ name: 'testAction', params: { foo: 'bar' } }],
          })),
        };

        const controller = createLLMUIController({ adapter: toolCallAdapter });
        controller.registerAction(action);

        await controller.sendMessage('Do something');

        expect(handler).toHaveBeenCalledWith({ foo: 'bar' });

        const messages = controller.messages();
        const assistantMsg = messages.find((m) => m.role === 'assistant');
        expect(assistantMsg?.toolCalls).toEqual([{ name: 'testAction', params: { foo: 'bar' } }]);
        expect(assistantMsg?.toolResults).toEqual([{ name: 'testAction', result: 'success' }]);

        dispose();
      }));

    it('should handle tool call errors', () =>
      createRoot(async (dispose) => {
        const handler = vi.fn(() => {
          throw new Error('Action failed');
        });
        const action: UIAction = {
          name: 'failingAction',
          description: 'Failing action',
          parameters: {},
          handler,
        };

        const toolCallAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => ({
            content: 'Trying to execute',
            toolCalls: [{ name: 'failingAction', params: {} }],
          })),
        };

        const controller = createLLMUIController({ adapter: toolCallAdapter });
        controller.registerAction(action);

        await controller.sendMessage('Do something');

        const messages = controller.messages();
        const assistantMsg = messages.find((m) => m.role === 'assistant');
        expect(assistantMsg?.toolResults).toEqual([
          { name: 'failingAction', result: 'error: Error: Action failed' },
        ]);

        dispose();
      }));

    it('should handle unknown action calls', () =>
      createRoot(async (dispose) => {
        const toolCallAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => ({
            content: 'Calling unknown action',
            toolCalls: [{ name: 'unknownAction', params: {} }],
          })),
        };

        const controller = createLLMUIController({ adapter: toolCallAdapter });

        await controller.sendMessage('Do something');

        const messages = controller.messages();
        const assistantMsg = messages.find((m) => m.role === 'assistant');
        expect(assistantMsg?.toolResults).toEqual([
          { name: 'unknownAction', result: 'error: action not found' },
        ]);

        dispose();
      }));

    it('should handle async action handlers', () =>
      createRoot(async (dispose) => {
        const handler = vi.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
        const action: UIAction = {
          name: 'asyncAction',
          description: 'Async action',
          parameters: {},
          handler,
        };

        const toolCallAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => ({
            content: 'Executing async',
            toolCalls: [{ name: 'asyncAction', params: {} }],
          })),
        };

        const controller = createLLMUIController({ adapter: toolCallAdapter });
        controller.registerAction(action);

        await controller.sendMessage('Do something');

        expect(handler).toHaveBeenCalled();

        dispose();
      }));
  });

  describe('action registration', () => {
    it('should register actions', () =>
      createRoot((dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });
        const action: UIAction = {
          name: 'test',
          description: 'Test',
          parameters: {},
          handler: vi.fn(),
        };

        controller.registerAction(action);

        expect(controller.registeredActions()).toContain(action);

        dispose();
      }));

    it('should replace action with same name', () =>
      createRoot((dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });
        const action1: UIAction = {
          name: 'test',
          description: 'First',
          parameters: {},
          handler: vi.fn(),
        };
        const action2: UIAction = {
          name: 'test',
          description: 'Second',
          parameters: {},
          handler: vi.fn(),
        };

        controller.registerAction(action1);
        controller.registerAction(action2);

        const actions = controller.registeredActions();
        expect(actions).toHaveLength(1);
        expect(actions[0]).toBe(action2);

        dispose();
      }));

    it('should unregister actions', () =>
      createRoot((dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });
        const action: UIAction = {
          name: 'test',
          description: 'Test',
          parameters: {},
          handler: vi.fn(),
        };

        controller.registerAction(action);
        expect(controller.registeredActions()).toHaveLength(1);

        controller.unregisterAction('test');
        expect(controller.registeredActions()).toHaveLength(0);

        dispose();
      }));

    it('should pass registered actions to adapter', () =>
      createRoot(async (dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });
        const action: UIAction = {
          name: 'test',
          description: 'Test',
          parameters: {},
          handler: vi.fn(),
        };

        controller.registerAction(action);
        await controller.sendMessage('Hello');

        expect(mockAdapter.sendMessage).toHaveBeenCalledWith(
          expect.any(Array),
          expect.arrayContaining([action])
        );

        dispose();
      }));
  });

  describe('clearMessages', () => {
    it('should clear all messages except system', () =>
      createRoot(async (dispose) => {
        const controller = createLLMUIController({
          adapter: mockAdapter,
          systemPrompt: 'System prompt',
        });

        await controller.sendMessage('Test 1');
        await controller.sendMessage('Test 2');

        expect(controller.messages().length).toBeGreaterThan(1);

        controller.clearMessages();

        const messages = controller.messages();
        expect(messages).toHaveLength(1);
        expect(messages[0].role).toBe('system');

        dispose();
      }));

    it('should clear error state', () =>
      createRoot(async (dispose) => {
        const errorAdapter: LLMAdapter = {
          sendMessage: vi.fn(async () => {
            throw new Error('Test error');
          }),
        };

        const controller = createLLMUIController({ adapter: errorAdapter });

        await controller.sendMessage('Test');
        expect(controller.error()).not.toBe(null);

        controller.clearMessages();
        expect(controller.error()).toBe(null);

        dispose();
      }));
  });

  describe('message structure', () => {
    it('should create messages with correct structure', () =>
      createRoot(async (dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });

        await controller.sendMessage('Test');

        const userMsg = controller.messages()[0];
        expect(userMsg).toMatchObject({
          id: expect.any(String),
          role: 'user',
          content: 'Test',
          timestamp: expect.any(Date),
        });

        const assistantMsg = controller.messages()[1];
        expect(assistantMsg).toMatchObject({
          id: expect.any(String),
          role: 'assistant',
          content: 'Mock response',
          timestamp: expect.any(Date),
        });

        dispose();
      }));

    it('should generate unique message IDs', () =>
      createRoot(async (dispose) => {
        const controller = createLLMUIController({ adapter: mockAdapter });

        // Add small delay to ensure unique timestamps
        await controller.sendMessage('Test 1');
        await new Promise((resolve) => setTimeout(resolve, 10));
        await controller.sendMessage('Test 2');

        const messages = controller.messages();
        const ids = messages.map((m) => m.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(ids.length);

        dispose();
      }));
  });
});
