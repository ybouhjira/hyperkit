/**
 * AI Workspace demo — a complete multi-session agent chat surface.
 *
 * Left: SessionManager sidebar (switch/pause/stop sessions, new session).
 * Center: top bar (ModelSelector + CostTracker) over a live ChatWindow.
 * Right: SubagentTracker + pending tool approvals with working
 * approve/reject, including the full ToolApproval review dialog.
 */
import { For, Show, batch, createSignal, onCleanup } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import {
  Badge,
  Button,
  Card,
  ChatWindow,
  CodeBlock,
  CostTracker,
  Flex,
  KeyboardProvider,
  ModelSelector,
  SessionManager,
  SubagentTracker,
  Text,
  ToolApproval,
  type Message,
  type SessionInfo,
  type SubagentInfo,
  type ToolApprovalItem,
} from '@ybouhjira/hyperkit';
import {
  MODELS,
  REPLY_CHUNKS,
  seedAgents,
  seedApprovals,
  seedSessions,
  type WorkspaceSession,
} from './data';
import './ai-workspace.css';

interface WorkspaceState {
  sessions: WorkspaceSession[];
  activeId: string;
  /** streaming assistant message id, per session */
  streaming: Record<string, string | undefined>;
  agents: SubagentInfo[];
  approvals: ToolApprovalItem[];
}

let messageCounter = 0;
const nextMessageId = () => `live-${++messageCounter}`;

export function AiWorkspaceApp() {
  const [state, setState] = createStore<WorkspaceState>({
    sessions: seedSessions(),
    activeId: 's-auth',
    streaming: {},
    agents: seedAgents(),
    approvals: seedApprovals(),
  });
  const [reviewId, setReviewId] = createSignal<string | null>(null);

  let streamTimer: ReturnType<typeof setInterval> | undefined;
  onCleanup(() => clearInterval(streamTimer));

  const activeSession = () =>
    state.sessions.find((s) => s.id === state.activeId) ?? state.sessions[0]!;

  const sessionInfos = (): SessionInfo[] =>
    state.sessions.map((s) => ({
      id: s.id,
      prompt: s.name,
      status: s.status,
      model: MODELS.find((m) => m.id === s.model)?.name.toLowerCase() ?? s.model,
      project: s.project,
      startedAt: s.startedAt,
      duration: s.duration,
      cost: s.cost,
      tasks: s.tasks,
      subagents: s.subagents,
    }));

  const appendMessage = (sessionId: string, message: Message) => {
    setState(
      'sessions',
      (s) => s.id === sessionId,
      'messages',
      produce((messages) => {
        messages.push(message);
      })
    );
  };

  const activateSession = (sessionId: string) => {
    setState(
      'sessions',
      produce((sessions) => {
        for (const s of sessions) {
          if (s.id === sessionId) s.status = 'active';
          else if (s.status === 'active') s.status = 'paused';
        }
      })
    );
    setState('activeId', sessionId);
  };

  const newSession = () => {
    const n = state.sessions.length + 1;
    const id = `s-new-${n}`;
    setState(
      'sessions',
      produce((sessions) => {
        sessions.unshift({
          id,
          name: `Untitled session ${n}`,
          project: 'hyperkit',
          model: 'claude-sonnet-4',
          status: 'active',
          cost: 0,
          inputTokens: 0,
          outputTokens: 0,
          startedAt: new Date().toISOString(),
          duration: 0,
          messages: [],
          tasks: [],
          subagents: [],
        });
      })
    );
    activateSession(id);
  };

  const stopStreaming = (sessionId: string) => {
    clearInterval(streamTimer);
    setState('streaming', sessionId, undefined);
  };

  const handleSend = (text: string) => {
    const sessionId = state.activeId;
    appendMessage(sessionId, {
      id: nextMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    // Simulate the streamed assistant reply.
    const replyId = nextMessageId();
    appendMessage(sessionId, { id: replyId, role: 'assistant', content: '', timestamp: new Date() });
    setState('streaming', sessionId, replyId);

    let chunk = 0;
    clearInterval(streamTimer);
    streamTimer = setInterval(() => {
      const piece = REPLY_CHUNKS[chunk];
      if (piece === undefined) {
        stopStreaming(sessionId);
        return;
      }
      chunk += 1;
      setState(
        'sessions',
        (s) => s.id === sessionId,
        'messages',
        (m) => m.id === replyId,
        'content',
        (c) => c + piece
      );
      // Live token/cost accounting while the reply streams in.
      setState(
        'sessions',
        (s) => s.id === sessionId,
        produce((session) => {
          session.inputTokens += 210;
          session.outputTokens += 96;
          session.cost += 0.0043;
        })
      );
    }, 380);
  };

  const resolveApproval = (id: string, approved: boolean) => {
    const approval = state.approvals.find((a) => a.id === id);
    if (!approval) return;
    batch(() => {
      setState('approvals', (list) => list.filter((a) => a.id !== id));
      setReviewId(null);
      appendMessage(state.activeId, {
        id: nextMessageId(),
        role: 'system',
        content: approved
          ? `✓ Approved ${approval.tool} — running \`${String(Object.values(approval.input)[0] ?? '')}\``
          : `✗ Rejected ${approval.tool} — tool call was not executed`,
        timestamp: new Date(),
      });
    });
  };

  const cancelAgent = (agentId: string) => {
    setState('agents', (a) => a.id === agentId, 'status', 'completed');
  };

  const reviewItem = () => state.approvals.find((a) => a.id === reviewId());

  return (
    <KeyboardProvider>
      <div class="aiw">
        {/* ── Session sidebar ─────────────────────────────────────────── */}
        <aside class="aiw__sessions" aria-label="Sessions">
          <Flex align="center" justify="between" gap="sm" class="aiw__sessions-head">
            <Text size="sm" weight="semibold">
              Sessions
            </Text>
            <Button size="sm" variant="secondary" onClick={newSession} data-testid="new-session">
              + New
            </Button>
          </Flex>
          <SessionManager
            sessions={sessionInfos()}
            groupBy="project"
            onViewChat={activateSession}
            onPause={(id) => setState('sessions', (s) => s.id === id, 'status', 'paused')}
            onResume={activateSession}
            onStop={(id) => setState('sessions', (s) => s.id === id, 'status', 'completed')}
          />
        </aside>

        {/* ── Main column ─────────────────────────────────────────────── */}
        <div class="aiw__main">
          <div class="aiw__topbar">
            <Text weight="semibold">HyperKit Agent Workspace</Text>
            <Badge variant="soft">{state.sessions.length} sessions</Badge>
            <span class="aiw__topbar-spacer" />
            <ModelSelector
              models={MODELS}
              value={activeSession().model}
              onChange={(modelId) =>
                setState('sessions', (s) => s.id === state.activeId, 'model', modelId)
              }
            />
            <CostTracker
              cost={activeSession().cost}
              inputTokens={activeSession().inputTokens}
              outputTokens={activeSession().outputTokens}
              compact
            />
          </div>
          <div class="aiw__chat">
            <ChatWindow
              title={activeSession().name}
              messages={activeSession().messages}
              connectionState="connected"
              streamingMessageId={state.streaming[state.activeId]}
              onSend={handleSend}
              onInterrupt={() => stopStreaming(state.activeId)}
            />
          </div>
        </div>

        {/* ── Inspector panel ─────────────────────────────────────────── */}
        <aside class="aiw__inspector" aria-label="Agent activity">
          <SubagentTracker agents={state.agents} onCancel={cancelAgent} />

          <div class="aiw__approvals">
            <Flex align="center" gap="sm" class="aiw__approvals-head">
              <Text size="sm" weight="semibold">
                Tool approvals
              </Text>
              <Show when={state.approvals.length > 0}>
                <Badge type="count" count={state.approvals.length} variant="warning" />
              </Show>
            </Flex>
            <Show
              when={state.approvals.length > 0}
              fallback={
                <Text size="sm" color="muted">
                  No pending tool calls — approvals will queue here.
                </Text>
              }
            >
              <For each={state.approvals}>
                {(approval) => (
                  <Card padding="sm" class="aiw__approval-card">
                    <Flex align="center" justify="between" gap="sm">
                      <Badge variant="warning">{approval.tool}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => setReviewId(approval.id)}>
                        Review
                      </Button>
                    </Flex>
                    <CodeBlock code={JSON.stringify(approval.input, null, 2)} language="json" />
                    <Flex gap="xs">
                      <Button
                        size="sm"
                        onClick={() => resolveApproval(approval.id, true)}
                        data-testid={`approve-${approval.id}`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => resolveApproval(approval.id, false)}
                        data-testid={`reject-${approval.id}`}
                      >
                        Reject
                      </Button>
                    </Flex>
                  </Card>
                )}
              </For>
            </Show>
          </div>
        </aside>

        {/* Full review dialog for a queued approval (real ToolApproval). */}
        <Show when={reviewItem()}>
          {(approval) => (
            <ToolApproval
              tool={approval().tool}
              input={approval().input}
              onApprove={() => resolveApproval(approval().id, true)}
              onDeny={() => resolveApproval(approval().id, false)}
            />
          )}
        </Show>
      </div>
    </KeyboardProvider>
  );
}
