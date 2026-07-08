import { createSignal, For, Show } from 'solid-js'
import { defineStory } from '../src/api'

// ─── Mock Data ──────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  toolUses?: ToolUse[]
  timestamp?: string
  tokens?: number
}

interface ToolUse {
  tool: string
  input: string
  result: string
}

const mockMessages: Message[] = [
  {
    role: 'user',
    content:
      'Create a TypeScript function that validates email addresses using a **regular expression**. Make sure it handles edge cases like `user+tag@example.co.uk`.',
    timestamp: '10:23:45',
    tokens: 42,
  },
  {
    role: 'assistant',
    content: `I'll create a robust email validator function. Here's the implementation:

This function uses a comprehensive regex pattern that handles:
- Local part with dots and plus signs
- Multiple domain levels
- Various TLDs including country codes

Example usage:
\`\`\`typescript
validateEmail('user@example.com')      // true
validateEmail('user+tag@example.co.uk') // true
validateEmail('invalid@')               // false
\`\`\``,
    thinking:
      'Need to create a regex that handles common email formats. Should account for plus addressing and international TLDs. Will use a simplified but robust pattern.',
    toolUses: [
      {
        tool: 'Write',
        input: 'src/validators/email.ts',
        result: `export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}`,
      },
    ],
    timestamp: '10:24:12',
    tokens: 156,
  },
  {
    role: 'user',
    content: 'Now add **unit tests** for this function. Include tests for:\n- Valid emails\n- Invalid formats\n- Edge cases',
    timestamp: '10:25:03',
    tokens: 38,
  },
  {
    role: 'assistant',
    content: `I'll create comprehensive unit tests using Vitest. The tests cover all the cases you mentioned.`,
    toolUses: [
      {
        tool: 'Write',
        input: 'src/validators/email.test.ts',
        result: `import { describe, it, expect } from 'vitest'
import { validateEmail } from './email'

describe('validateEmail', () => {
  it('validates standard email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.user@domain.org')).toBe(true)
  })

  it('rejects invalid formats', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
  })

  it('handles edge cases', () => {
    expect(validateEmail('user+tag@example.co.uk')).toBe(true)
    expect(validateEmail('name_123@test-domain.com')).toBe(true)
  })
})`,
      },
      {
        tool: 'Bash',
        input: 'vitest run src/validators/email.test.ts',
        result: `✓ src/validators/email.test.ts (3)
  ✓ validateEmail (3)
    ✓ validates standard email addresses
    ✓ rejects invalid formats
    ✓ handles edge cases

Test Files  1 passed (1)
     Tests  3 passed (3)
  Start at  10:25:18
  Duration  142ms`,
      },
    ],
    timestamp: '10:25:19',
    tokens: 203,
  },
]

// ─── Mockup 1: Clean Minimal ────────────────────────────

const CleanMinimalMockup = () => {
  const [expandedThinking, setExpandedThinking] = createSignal<number | null>(null)

  return (
    <div
      style={{
        'font-family': 'var(--sk-font-ui)',
        'max-width': '800px',
        margin: '0 auto',
        padding: 'var(--sk-space-lg)',
      }}
    >
      <For each={mockMessages}>
        {(msg, i) => (
          <div
            style={{
              'margin-bottom': 'var(--sk-space-lg)',
              'border-left': `3px solid ${msg.role === 'user' ? 'var(--sk-accent)' : 'var(--sk-border-subtle)'}`,
              'padding-left': 'var(--sk-space-md)',
            }}
          >
            {/* Role Label */}
            <div
              style={{
                'font-size': 'var(--sk-font-size-sm)',
                'font-weight': '600',
                color: 'var(--sk-text-secondary)',
                'margin-bottom': 'var(--sk-space-sm)',
                'text-transform': 'uppercase',
                'letter-spacing': '0.05em',
              }}
            >
              {msg.role === 'user' ? 'You' : 'Claude'}
            </div>

            {/* Thinking Block */}
            <Show when={msg.thinking}>
              <div
                style={{
                  'margin-bottom': 'var(--sk-space-md)',
                  background: 'var(--sk-bg-secondary)',
                  'border-radius': 'var(--sk-radius-md)',
                  padding: 'var(--sk-space-sm)',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setExpandedThinking(expandedThinking() === i() ? null : i())
                }
              >
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    color: 'var(--sk-text-muted)',
                    display: 'flex',
                    'align-items': 'center',
                    gap: 'var(--sk-space-xs)',
                  }}
                >
                  <span>{expandedThinking() === i() ? '▼' : '▶'}</span>
                  <span>Thinking...</span>
                </div>
                <Show when={expandedThinking() === i()}>
                  <div
                    style={{
                      'margin-top': 'var(--sk-space-sm)',
                      'font-size': 'var(--sk-font-size-sm)',
                      color: 'var(--sk-text-secondary)',
                      'line-height': 'var(--sk-leading-normal)',
                    }}
                  >
                    {msg.thinking}
                  </div>
                </Show>
              </div>
            </Show>

            {/* Content */}
            <div
              style={{
                'font-size': 'var(--sk-font-size-base)',
                color: 'var(--sk-text-primary)',
                'line-height': 'var(--sk-leading-relaxed)',
                'white-space': 'pre-wrap',
              }}
              innerHTML={formatContent(msg.content)}
            />

            {/* Tool Uses */}
            <Show when={msg.toolUses}>
              <div style={{ 'margin-top': 'var(--sk-space-md)' }}>
                <For each={msg.toolUses}>
                  {(tool) => (
                    <div
                      style={{
                        background: 'var(--sk-bg-secondary)',
                        'border-radius': 'var(--sk-radius-md)',
                        padding: 'var(--sk-space-md)',
                        'margin-bottom': 'var(--sk-space-sm)',
                      }}
                    >
                      <div
                        style={{
                          'font-size': 'var(--sk-font-size-sm)',
                          'font-weight': '600',
                          color: 'var(--sk-accent)',
                          'margin-bottom': 'var(--sk-space-xs)',
                        }}
                      >
                        {tool.tool}: {tool.input}
                      </div>
                      <pre
                        style={{
                          'font-family': 'var(--sk-font-mono)',
                          'font-size': 'var(--sk-font-size-sm)',
                          background: 'var(--sk-bg-primary)',
                          padding: 'var(--sk-space-sm)',
                          'border-radius': 'var(--sk-radius-sm)',
                          overflow: 'auto',
                          margin: '0',
                          color: 'var(--sk-text-primary)',
                        }}
                      >
                        {tool.result}
                      </pre>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}

// ─── Mockup 2: IDE Dense ────────────────────────────────

const IDEDenseMockup = () => {
  const [expandedTools, setExpandedTools] = createSignal<Set<string>>(new Set())

  const toggleTool = (id: string) => {
    const current = new Set(expandedTools())
    if (current.has(id)) {
      current.delete(id)
    } else {
      current.add(id)
    }
    setExpandedTools(current)
  }

  return (
    <div
      style={{
        'font-family': 'var(--sk-font-mono)',
        'font-size': 'var(--sk-font-size-sm)',
        background: 'var(--sk-bg-primary)',
        padding: 'var(--sk-space-sm)',
      }}
    >
      <For each={mockMessages}>
        {(msg, i) => (
          <div
            style={{
              'margin-bottom': '4px',
              'border-bottom': '1px solid var(--sk-border-subtle)',
              'padding-bottom': '4px',
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                'margin-bottom': '4px',
                color: 'var(--sk-text-muted)',
              }}
            >
              <span
                style={{
                  color: msg.role === 'user' ? 'var(--sk-accent)' : 'var(--sk-success)',
                  'font-weight': '600',
                }}
              >
                {msg.role === 'user' ? 'USER' : 'ASST'}
              </span>
              <span style={{ 'font-size': '11px' }}>{msg.timestamp}</span>
              <Show when={msg.tokens}>
                <span
                  style={{
                    background: 'var(--sk-bg-secondary)',
                    padding: '1px 4px',
                    'border-radius': '2px',
                    'font-size': '10px',
                  }}
                >
                  {msg.tokens}tk
                </span>
              </Show>
            </div>

            {/* Content */}
            <div
              style={{
                'padding-left': '8px',
                color: 'var(--sk-text-primary)',
                'white-space': 'pre-wrap',
                'word-break': 'break-word',
              }}
              innerHTML={formatContentMono(msg.content)}
            />

            {/* Tool Calls */}
            <Show when={msg.toolUses}>
              <div style={{ 'padding-left': '16px', 'margin-top': '4px' }}>
                <For each={msg.toolUses}>
                  {(tool, toolIdx) => {
                    const toolId = `${i()}-${toolIdx()}`
                    return (
                      <div style={{ 'margin-bottom': '2px' }}>
                        <div
                          style={{
                            cursor: 'pointer',
                            color: 'var(--sk-warning)',
                            display: 'flex',
                            gap: '4px',
                          }}
                          onClick={() => toggleTool(toolId)}
                        >
                          <span>{expandedTools().has(toolId) ? '▼' : '▶'}</span>
                          <span>
                            {tool.tool}({tool.input})
                          </span>
                        </div>
                        <Show when={expandedTools().has(toolId)}>
                          <pre
                            style={{
                              'margin-left': '12px',
                              'font-size': '11px',
                              color: 'var(--sk-text-secondary)',
                              'margin-top': '2px',
                              'margin-bottom': '2px',
                            }}
                          >
                            {tool.result}
                          </pre>
                        </Show>
                      </div>
                    )
                  }}
                </For>
              </div>
            </Show>
          </div>
        )}
      </For>
      {/* Streaming Cursor */}
      <div
        style={{
          display: 'inline-block',
          width: '8px',
          height: '14px',
          background: 'var(--sk-accent)',
          animation: 'blink 1s infinite',
        }}
      />
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  )
}

// ─── Mockup 3: Card-Based ───────────────────────────────

const CardBasedMockup = () => {
  const [hoveredCard, setHoveredCard] = createSignal<number | null>(null)
  const [expandedTools, setExpandedTools] = createSignal<Set<number>>(new Set())

  const toggleToolExpand = (idx: number) => {
    const current = new Set(expandedTools())
    if (current.has(idx)) {
      current.delete(idx)
    } else {
      current.add(idx)
    }
    setExpandedTools(current)
  }

  return (
    <div
      style={{
        'font-family': 'var(--sk-font-ui)',
        padding: 'var(--sk-space-lg)',
        'max-width': '900px',
        margin: '0 auto',
      }}
    >
      <For each={mockMessages}>
        {(msg, i) => (
          <div
            style={{
              display: 'flex',
              'justify-content': msg.role === 'user' ? 'flex-end' : 'flex-start',
              'margin-bottom': 'var(--sk-space-md)',
            }}
          >
            <div
              style={{
                'max-width': '75%',
                background: 'var(--sk-bg-secondary)',
                'border-radius': 'var(--sk-radius-lg)',
                padding: 'var(--sk-space-md)',
                'box-shadow':
                  hoveredCard() === i()
                    ? 'var(--sk-shadow-lg)'
                    : 'var(--sk-shadow-sm)',
                transition: 'box-shadow var(--sk-duration-fast) var(--sk-ease-default)',
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredCard(i())}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Avatar + Role */}
              <div
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  gap: 'var(--sk-space-sm)',
                  'margin-bottom': 'var(--sk-space-sm)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    'border-radius': '50%',
                    background:
                      msg.role === 'user'
                        ? 'var(--sk-accent)'
                        : 'var(--sk-bg-tertiary)',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'font-weight': '600',
                    'font-size': 'var(--sk-font-size-sm)',
                    color:
                      msg.role === 'user'
                        ? 'var(--sk-bg-primary)'
                        : 'var(--sk-text-primary)',
                  }}
                >
                  {msg.role === 'user' ? 'Y' : 'C'}
                </div>
                <div>
                  <div
                    style={{
                      'font-weight': '600',
                      'font-size': 'var(--sk-font-size-sm)',
                      color: 'var(--sk-text-primary)',
                    }}
                  >
                    {msg.role === 'user' ? 'You' : 'Claude'}
                  </div>
                  <div
                    style={{
                      'font-size': '11px',
                      color: 'var(--sk-text-muted)',
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>

              {/* Thinking Accordion */}
              <Show when={msg.thinking}>
                <div
                  style={{
                    background: 'var(--sk-bg-tertiary)',
                    'border-radius': 'var(--sk-radius-md)',
                    padding: 'var(--sk-space-sm)',
                    'margin-bottom': 'var(--sk-space-sm)',
                    'border-left': '3px solid var(--sk-warning)',
                  }}
                >
                  <div
                    style={{
                      'font-size': 'var(--sk-font-size-sm)',
                      'font-style': 'italic',
                      color: 'var(--sk-text-muted)',
                    }}
                  >
                    💭 {msg.thinking}
                  </div>
                </div>
              </Show>

              {/* Content */}
              <div
                style={{
                  'font-size': 'var(--sk-font-size-base)',
                  color: 'var(--sk-text-primary)',
                  'line-height': 'var(--sk-leading-normal)',
                  'white-space': 'pre-wrap',
                }}
                innerHTML={formatContent(msg.content)}
              />

              {/* Tool Uses as Sub-Cards */}
              <Show when={msg.toolUses}>
                <div style={{ 'margin-top': 'var(--sk-space-md)' }}>
                  <For each={msg.toolUses}>
                    {(tool, toolIdx) => (
                      <div
                        style={{
                          background: 'var(--sk-bg-primary)',
                          'border-radius': 'var(--sk-radius-md)',
                          padding: 'var(--sk-space-sm)',
                          'margin-bottom': 'var(--sk-space-xs)',
                          border: '1px solid var(--sk-border)',
                        }}
                      >
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'font-weight': '600',
                            color: 'var(--sk-accent)',
                            cursor: 'pointer',
                            display: 'flex',
                            'align-items': 'center',
                            gap: 'var(--sk-space-xs)',
                          }}
                          onClick={() => toggleToolExpand(i() * 100 + toolIdx())}
                        >
                          <span>
                            {expandedTools().has(i() * 100 + toolIdx()) ? '▼' : '▶'}
                          </span>
                          <span>
                            {tool.tool}: {tool.input}
                          </span>
                        </div>
                        <Show when={expandedTools().has(i() * 100 + toolIdx())}>
                          <pre
                            style={{
                              'font-family': 'var(--sk-font-mono)',
                              'font-size': 'var(--sk-font-size-sm)',
                              'margin-top': 'var(--sk-space-sm)',
                              color: 'var(--sk-text-secondary)',
                              overflow: 'auto',
                            }}
                          >
                            {tool.result}
                          </pre>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

// ─── Mockup 4: Terminal/Hacker ──────────────────────────

const TerminalHackerMockup = () => {
  return (
    <div
      style={{
        'font-family': 'var(--sk-font-mono)',
        'font-size': '13px',
        background: 'var(--sk-bg-primary)',
        color: 'var(--sk-success)',
        padding: 'var(--sk-space-md)',
        'min-height': '100vh',
        position: 'relative',
      }}
    >
      {/* Scanline Effect */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background:
            'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, transparent 2px)',
          'pointer-events': 'none',
        }}
      />

      <div style={{ position: 'relative', 'z-index': '1' }}>
        {/* Header */}
        <div
          style={{
            'margin-bottom': 'var(--sk-space-md)',
            'border-bottom': '1px solid var(--sk-success)',
            'padding-bottom': 'var(--sk-space-sm)',
          }}
        >
          <div>CLAUDE_SESSION_2026-03-11_10:23:45</div>
          <div style={{ 'font-size': '11px', opacity: '0.7' }}>
            [OPUS-4.6] CONNECTED | 439 TOKENS
          </div>
        </div>

        <For each={mockMessages}>
          {(msg, i) => (
            <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
              {/* Prompt */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--sk-space-sm)',
                  color:
                    msg.role === 'user' ? 'var(--sk-accent)' : 'var(--sk-success)',
                }}
              >
                <span style={{ 'user-select': 'none' }}>
                  {msg.role === 'user' ? '>' : '$'}
                </span>
                <div style={{ flex: '1', 'white-space': 'pre-wrap' }}>
                  {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>

              {/* Thinking */}
              <Show when={msg.thinking}>
                <div
                  style={{
                    'margin-left': 'var(--sk-space-md)',
                    'margin-top': 'var(--sk-space-xs)',
                    color: 'var(--sk-warning)',
                    'font-size': '12px',
                    opacity: '0.8',
                  }}
                >
                  # {msg.thinking}
                </div>
              </Show>

              {/* Tool Uses as Command Output */}
              <Show when={msg.toolUses}>
                <div style={{ 'margin-left': 'var(--sk-space-md)' }}>
                  <For each={msg.toolUses}>
                    {(tool) => (
                      <div style={{ 'margin-top': 'var(--sk-space-xs)' }}>
                        <div style={{ color: 'var(--sk-warning)' }}>
                          [RUN] {tool.tool} {tool.input}
                        </div>
                        <pre
                          style={{
                            'margin-left': 'var(--sk-space-md)',
                            'font-size': '12px',
                            color: 'var(--sk-text-secondary)',
                            'white-space': 'pre-wrap',
                            'margin-top': '2px',
                            'border-left': '2px solid var(--sk-border-subtle)',
                            'padding-left': 'var(--sk-space-sm)',
                          }}
                        >
                          {tool.result}
                        </pre>
                        <div
                          style={{
                            'margin-left': 'var(--sk-space-md)',
                            color: 'var(--sk-success)',
                            'font-size': '11px',
                          }}
                        >
                          [OK] Exit 0
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              {/* Timestamp */}
              <div
                style={{
                  'margin-top': '2px',
                  'font-size': '10px',
                  color: 'var(--sk-text-muted)',
                  opacity: '0.5',
                }}
              >
                [{msg.timestamp}] +{msg.tokens}tk
              </div>
            </div>
          )}
        </For>

        {/* Blinking Cursor */}
        <div style={{ display: 'flex', gap: 'var(--sk-space-sm)' }}>
          <span>$</span>
          <div
            style={{
              display: 'inline-block',
              width: '8px',
              height: '16px',
              background: 'var(--sk-success)',
              animation: 'cursorBlink 1s infinite',
            }}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes cursorBlink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  )
}

// ─── Mockup 5: Newspaper/Document ───────────────────────

const NewspaperDocumentMockup = () => {
  const [activeSection, setActiveSection] = createSignal(0)

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sk-space-lg)',
        'font-family': 'var(--sk-font-ui)',
        padding: 'var(--sk-space-lg)',
        'max-width': '1200px',
        margin: '0 auto',
      }}
    >
      {/* Table of Contents Sidebar */}
      <div
        style={{
          width: '200px',
          'flex-shrink': '0',
          'border-right': '1px solid var(--sk-border)',
          'padding-right': 'var(--sk-space-md)',
          position: 'sticky',
          top: '0',
          'align-self': 'flex-start',
        }}
      >
        <div
          style={{
            'font-weight': '700',
            'font-size': 'var(--sk-font-size-sm)',
            'margin-bottom': 'var(--sk-space-md)',
            color: 'var(--sk-text-primary)',
            'text-transform': 'uppercase',
            'letter-spacing': '0.05em',
          }}
        >
          Contents
        </div>
        <For each={mockMessages.filter((m) => m.role === 'user')}>
          {(msg, i) => (
            <div
              style={{
                'font-size': 'var(--sk-font-size-sm)',
                'margin-bottom': 'var(--sk-space-sm)',
                color:
                  activeSection() === i()
                    ? 'var(--sk-accent)'
                    : 'var(--sk-text-secondary)',
                cursor: 'pointer',
                'padding-left': 'var(--sk-space-sm)',
                'border-left':
                  activeSection() === i()
                    ? '2px solid var(--sk-accent)'
                    : '2px solid transparent',
                transition: 'all var(--sk-duration-fast)',
              }}
              onClick={() => setActiveSection(i())}
            >
              {i() + 1}. {msg.content.split('\n')[0].substring(0, 40)}...
            </div>
          )}
        </For>
      </div>

      {/* Main Document */}
      <div style={{ flex: '1', 'max-width': '800px' }}>
        {/* Title */}
        <h1
          style={{
            'font-size': '32px',
            'font-weight': '700',
            'line-height': 'var(--sk-leading-tight)',
            color: 'var(--sk-text-primary)',
            'margin-bottom': 'var(--sk-space-md)',
            'border-bottom': '2px solid var(--sk-border)',
            'padding-bottom': 'var(--sk-space-sm)',
          }}
        >
          Session Transcript
        </h1>
        <div
          style={{
            'font-size': 'var(--sk-font-size-sm)',
            color: 'var(--sk-text-muted)',
            'margin-bottom': 'var(--sk-space-lg)',
          }}
        >
          March 11, 2026 • Session Duration: 2m 34s
        </div>

        <For each={mockMessages}>
          {(msg, i) => (
            <div style={{ 'margin-bottom': 'var(--sk-space-lg)' }}>
              {/* Section Header for User Messages */}
              <Show when={msg.role === 'user'}>
                <h2
                  id={`section-${i()}`}
                  style={{
                    'font-size': '24px',
                    'font-weight': '600',
                    color: 'var(--sk-text-primary)',
                    'margin-bottom': 'var(--sk-space-md)',
                    'margin-top': 'var(--sk-space-lg)',
                  }}
                >
                  {i() === 0 ? '1' : i() === 2 ? '2' : ''}.{' '}
                  {msg.content.split('.')[0]}
                </h2>
              </Show>

              {/* Body Text */}
              <Show when={msg.role === 'user'}>
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-base)',
                    'line-height': 'var(--sk-leading-relaxed)',
                    color: 'var(--sk-text-secondary)',
                    'margin-bottom': 'var(--sk-space-md)',
                  }}
                  innerHTML={formatContent(msg.content)}
                />
              </Show>

              {/* Assistant Response as Body */}
              <Show when={msg.role === 'assistant'}>
                <div>
                  {/* Thinking as Blockquote */}
                  <Show when={msg.thinking}>
                    <blockquote
                      style={{
                        'border-left': '3px solid var(--sk-warning)',
                        'padding-left': 'var(--sk-space-md)',
                        margin: '0 0 var(--sk-space-md) 0',
                        'font-style': 'italic',
                        color: 'var(--sk-text-muted)',
                        'font-size': 'var(--sk-font-size-sm)',
                      }}
                    >
                      {msg.thinking}
                    </blockquote>
                  </Show>

                  <div
                    style={{
                      'font-size': 'var(--sk-font-size-base)',
                      'line-height': 'var(--sk-leading-relaxed)',
                      color: 'var(--sk-text-primary)',
                      'margin-bottom': 'var(--sk-space-md)',
                    }}
                    innerHTML={formatContent(msg.content)}
                  />

                  {/* Tool Calls as Figures */}
                  <Show when={msg.toolUses}>
                    <For each={msg.toolUses}>
                      {(tool, idx) => (
                        <figure
                          style={{
                            margin: 'var(--sk-space-md) 0',
                            background: 'var(--sk-bg-secondary)',
                            padding: 'var(--sk-space-md)',
                            'border-radius': 'var(--sk-radius-md)',
                            border: '1px solid var(--sk-border)',
                          }}
                        >
                          <figcaption
                            style={{
                              'font-size': 'var(--sk-font-size-sm)',
                              'font-weight': '600',
                              color: 'var(--sk-text-secondary)',
                              'margin-bottom': 'var(--sk-space-sm)',
                            }}
                          >
                            Figure {i()}.{idx() + 1} — {tool.tool}: {tool.input}
                          </figcaption>
                          <pre
                            style={{
                              'font-family': 'var(--sk-font-mono)',
                              'font-size': 'var(--sk-font-size-sm)',
                              background: 'var(--sk-bg-primary)',
                              padding: 'var(--sk-space-sm)',
                              'border-radius': 'var(--sk-radius-sm)',
                              overflow: 'auto',
                              margin: '0',
                              color: 'var(--sk-text-primary)',
                            }}
                          >
                            {tool.result}
                          </pre>
                        </figure>
                      )}
                    </For>
                  </Show>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background: var(--sk-bg-secondary); padding: 2px 6px; border-radius: 3px; font-family: var(--sk-font-mono); font-size: 0.9em;">$1</code>')
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) =>
        `<pre style="font-family: var(--sk-font-mono); font-size: var(--sk-font-size-sm); background: var(--sk-bg-secondary); padding: var(--sk-space-md); border-radius: var(--sk-radius-md); overflow: auto; margin: var(--sk-space-sm) 0;"><div style="font-size: 11px; color: var(--sk-text-muted); margin-bottom: 8px;">${lang || 'code'}</div>${code.trim()}</pre>`,
    )
}

function formatContentMono(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1')
}

// ─── Story Definitions ──────────────────────────────────

export const CleanMinimal = defineStory({
  title: 'Clean Minimal',
  category: 'Session Rendering',
  render: () => <CleanMinimalMockup />,
  controls: {},
})

export const IDEDense = defineStory({
  title: 'IDE Dense',
  category: 'Session Rendering',
  render: () => <IDEDenseMockup />,
  controls: {},
})

export const CardBased = defineStory({
  title: 'Card-Based',
  category: 'Session Rendering',
  render: () => <CardBasedMockup />,
  controls: {},
})

export const TerminalHacker = defineStory({
  title: 'Terminal/Hacker',
  category: 'Session Rendering',
  render: () => <TerminalHackerMockup />,
  controls: {},
  layout: 'fullscreen',
})

export const NewspaperDocument = defineStory({
  title: 'Newspaper/Document',
  category: 'Session Rendering',
  render: () => <NewspaperDocumentMockup />,
  controls: {},
  layout: 'fullscreen',
})
