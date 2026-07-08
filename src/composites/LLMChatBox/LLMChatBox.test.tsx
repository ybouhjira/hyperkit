import { render, screen } from '@solidjs/testing-library';
import { fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMChatBox } from './LLMChatBox';
import { createLLMUIController } from '../../hooks/createLLMUIController';
import { createMockLLMAdapter } from '../../__fixtures__/mockLLMAdapter';
import { ThemeProvider } from '../../theme/ThemeProvider';

function renderWithTheme(component: () => import('solid-js').JSX.Element) {
  return render(() => <ThemeProvider>{component()}</ThemeProvider>);
}

describe('LLMChatBox', () => {
  let controller: ReturnType<typeof createLLMUIController>;

  beforeEach(() => {
    controller = createLLMUIController({
      adapter: createMockLLMAdapter(0), // No delay for tests
    });
  });

  describe('rendering', () => {
    it('should render with default title', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} title="My Bot" />);

      expect(screen.getByText('My Bot')).toBeInTheDocument();
    });

    it('should render message input area', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      renderWithTheme(() => (
        <LLMChatBox controller={controller} placeholder="Ask me anything..." />
      ));

      expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    });

    it('should render send button', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should render clear button', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should render minimize/expand button', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const minimizeButton = screen.getByTitle('Minimize');
      expect(minimizeButton).toBeInTheDocument();
    });

    it('should apply custom class', () => {
      const { container } = renderWithTheme(() => (
        <LLMChatBox controller={controller} class="custom-class" />
      ));

      const chatBox = container.querySelector('.custom-class');
      expect(chatBox).toBeInTheDocument();
    });
  });

  describe('message display', () => {
    it('should display messages when present', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Type and send message
      fireEvent.input(textarea, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);

      // Wait for user message to appear
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });

      // Wait for assistant response
      await waitFor(() => {
        expect(screen.getByText(/understand you want to interact/i)).toBeInTheDocument();
      });
    });

    it('should display user messages on the right', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      await controller.sendMessage('Test message');

      await waitFor(() => {
        const message = screen.getByText('Test message');
        const messageContainer = message.closest('.sk-llm-chat__msg-row');
        expect(messageContainer?.className).toContain('sk-llm-chat__msg-row--user');
      });
    });

    it('should display assistant messages on the left', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      await controller.sendMessage('Test');

      await waitFor(() => {
        const messages = screen.getAllByText(/understand you want to interact/i);
        const message = messages[0];
        const messageContainer = message.closest('.sk-llm-chat__msg-row');
        expect(messageContainer?.className).toContain('sk-llm-chat__msg-row--assistant');
      });
    });

    it('should not display system messages', async () => {
      const controllerWithSystem = createLLMUIController({
        adapter: createMockLLMAdapter(0),
        systemPrompt: 'You are a test bot',
      });

      renderWithTheme(() => <LLMChatBox controller={controllerWithSystem} />);

      // System message should not be visible
      expect(screen.queryByText('You are a test bot')).not.toBeInTheDocument();
    });

    it('should display timestamps', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      await controller.sendMessage('Test');

      await waitFor(() => {
        // Check for time format (HH:MM)
        const timeElements = screen
          .getAllByText(/\d{1,2}:\d{2}/)
          .filter((el) => el.className.includes('sk-llm-chat__msg-time'));
        expect(timeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('message sending', () => {
    it('should send message when clicking send button', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.input(textarea, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(controller.messages().some((m) => m.content === 'Test message')).toBe(true);
      });
    });

    it('should send message when pressing Enter', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'Enter message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      await waitFor(() => {
        expect(controller.messages().some((m) => m.content === 'Enter message')).toBe(true);
      });
    });

    it('should not send message when pressing Shift+Enter', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'Multiline' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      // Give it a moment to potentially send (it shouldn't)
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(controller.messages().length).toBe(0);
    });

    it('should clear input after sending', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.input(textarea, { target: { value: 'Test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should not send empty message', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.click(sendButton);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(controller.messages().length).toBe(0);
    });

    it('should not send whitespace-only message', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.input(textarea, { target: { value: '   \n\t  ' } });
      fireEvent.click(sendButton);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(controller.messages().length).toBe(0);
    });

    it('should disable send button when empty', () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const sendButton = screen.getByRole('button', { name: /send/i }) as HTMLButtonElement;

      expect(sendButton.disabled).toBe(true);
    });

    it('should disable send button while processing', async () => {
      const slowAdapter = createMockLLMAdapter(500);
      const slowController = createLLMUIController({ adapter: slowAdapter });

      renderWithTheme(() => <LLMChatBox controller={slowController} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i }) as HTMLButtonElement;

      fireEvent.input(textarea, { target: { value: 'Test' } });
      fireEvent.click(sendButton);

      // Wait for UI to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(sendButton.disabled).toBe(true);

      // Wait for processing to complete
      await waitFor(
        () => {
          expect(slowController.isProcessing()).toBe(false);
        },
        { timeout: 1500 }
      );

      // Now add text again to enable the button
      fireEvent.input(textarea, { target: { value: 'Another message' } });

      await waitFor(() => {
        expect(sendButton.disabled).toBe(false);
      });
    });
  });

  describe('processing indicator', () => {
    it('should show typing indicator while processing', async () => {
      const slowAdapter = createMockLLMAdapter(500);
      const slowController = createLLMUIController({ adapter: slowAdapter });

      renderWithTheme(() => <LLMChatBox controller={slowController} />);

      // Start sending message (don't await)
      const promise = slowController.sendMessage('Test');

      // Wait a bit for the UI to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Look for the typing indicator dots
      const typingDots = document.querySelectorAll('.sk-llm-chat__typing-dot');
      expect(typingDots.length).toBe(3);

      // Wait for message to complete
      await promise;

      await waitFor(
        () => {
          const afterDots = document.querySelectorAll('.sk-llm-chat__typing-dot');
          expect(afterDots.length).toBe(0);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('error handling', () => {
    it('should display error banner when error occurs', async () => {
      const errorAdapter = {
        sendMessage: vi.fn(async () => {
          throw new Error('Network error');
        }),
      };
      const errorController = createLLMUIController({ adapter: errorAdapter });

      renderWithTheme(() => <LLMChatBox controller={errorController} />);

      await errorController.sendMessage('Test');

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('clear functionality', () => {
    it('should clear messages when clicking clear button', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      await controller.sendMessage('Test 1');
      await controller.sendMessage('Test 2');

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('minimize/expand', () => {
    it('should minimize chat when clicking minimize button', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const minimizeButton = screen.getByTitle('Minimize');
      fireEvent.click(minimizeButton);

      await waitFor(() => {
        const expandButton = screen.getByTitle('Expand');
        expect(expandButton).toBeInTheDocument();
      });

      // Message area should be hidden
      expect(screen.queryByPlaceholderText(/Type a message/i)).not.toBeInTheDocument();
    });

    it('should expand chat when clicking expand button', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const minimizeButton = screen.getByTitle('Minimize');
      fireEvent.click(minimizeButton);

      await waitFor(() => {
        const expandButton = screen.getByTitle('Expand');
        fireEvent.click(expandButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
      });
    });
  });

  describe('tool calls', () => {
    it('should display tool call badges', async () => {
      // Register the switchTheme action that the mock adapter expects
      controller.registerAction({
        name: 'switchTheme',
        description: 'Switch theme',
        parameters: {},
        handler: vi.fn(),
      });

      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      // Send a message that triggers a tool call (based on mock adapter)
      fireEvent.input(textarea, { target: { value: 'switch theme to dark' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(
        () => {
          // Look for the tool call badge text content
          const badge = screen.getByText(/switchTheme/);
          expect(badge).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should show success indicator for successful tool calls', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      controller.registerAction({
        name: 'switchTheme',
        description: 'Switch theme',
        parameters: {},
        handler: vi.fn(),
      });

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'switch theme to dark' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        const badge = screen.getByText(/switchTheme/);
        expect(badge.textContent).toContain('✓');
      });
    });

    it('should show error indicator for failed tool calls', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      controller.registerAction({
        name: 'switchTheme',
        description: 'Switch theme',
        parameters: {},
        handler: vi.fn(() => {
          throw new Error('Failed');
        }),
      });

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'switch theme to dark' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        const badge = screen.getByText(/switchTheme/);
        expect(badge.textContent).toContain('✗');
      });
    });
  });

  describe('integration with mock adapter', () => {
    it('should handle theme switching command', async () => {
      const handler = vi.fn();
      controller.registerAction({
        name: 'switchTheme',
        description: 'Switch theme',
        parameters: { themeId: { type: 'string', description: 'Theme ID' } },
        handler,
      });

      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'switch theme to warp' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ themeId: 'warp' });
      });
    });

    it('should handle view change command', async () => {
      const handler = vi.fn();
      controller.registerAction({
        name: 'changeView',
        description: 'Change view',
        parameters: { viewMode: { type: 'string', description: 'View mode' } },
        handler,
      });

      renderWithTheme(() => <LLMChatBox controller={controller} />);

      const textarea = screen.getByPlaceholderText(/Type a message/i) as HTMLTextAreaElement;

      fireEvent.input(textarea, { target: { value: 'show as kanban view' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ viewMode: 'kanban' });
      });
    });

    it('should handle help command', async () => {
      renderWithTheme(() => <LLMChatBox controller={controller} />);

      await controller.sendMessage('what can you do?');

      await waitFor(() => {
        expect(screen.getByText(/Switch theme/)).toBeInTheDocument();
        expect(screen.getByText(/Change view/)).toBeInTheDocument();
      });
    });
  });
});
