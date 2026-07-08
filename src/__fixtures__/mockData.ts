import type { Message } from '../composites/MessageList';
import type { SessionTab } from '../composites/SessionTabs';
import type { ModelOption } from '../composites/ModelSelector';
import type { FileItem } from '../composites/FileExplorer';

export const mockModels: ModelOption[] = [
  { id: 'claude-opus-4', name: 'Claude Opus 4' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
  { id: 'claude-haiku-4', name: 'Claude Haiku 4' },
];

export const mockTabs: SessionTab[] = [
  { id: 's1', name: 'hyperkit dev', status: 'idle' },
  { id: 's2', name: 'API debugging', status: 'streaming' },
  { id: 's3', name: 'Test failures', status: 'error', unreadCount: 3 },
];

export const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Can you help me refactor the authentication module?' },
  {
    id: '2',
    role: 'assistant',
    content:
      "Of course! Let me look at the current implementation.\n\nI'll start by reading the auth files:\n\n```bash\nls src/auth/\n```",
  },
  { id: '3', role: 'system', content: 'Tool: Read file src/auth/middleware.ts' },
  {
    id: '4',
    role: 'assistant',
    content:
      'I see the authentication middleware uses JWT tokens. Here\'s what I recommend:\n\n1. **Extract token validation** into a separate service\n2. **Add typed errors** using Effect\'s TaggedError\n3. **Use middleware composition** instead of nested callbacks\n\n```typescript\nimport { Effect, Data } from "effect";\n\nclass TokenExpired extends Data.TaggedError("TokenExpired")<{\n  readonly expiredAt: Date;\n}> {}\n\nconst validateToken = (token: string) =>\n  Effect.gen(function* () {\n    const decoded = yield* decodeJwt(token);\n    if (decoded.exp < Date.now()) {\n      return yield* Effect.fail(new TokenExpired({ expiredAt: new Date(decoded.exp) }));\n    }\n    return decoded;\n  });\n```\n\nShall I proceed with this approach?',
  },
  { id: '5', role: 'user', content: 'Yes, go ahead with the refactoring.' },
];

export const mockStreamingMessages: Message[] = [
  ...mockMessages,
  {
    id: '6',
    role: 'assistant',
    content:
      "Let me implement the changes step by step...\n\nFirst, I'll create the new token validation service:",
  },
];

export const mockEmptyMessages: Message[] = [];

export const mockDirectoryItems: FileItem[] = [
  { name: 'Documents', path: '/home/user/Documents', isDirectory: true },
  { name: 'Projects', path: '/home/user/Projects', isDirectory: true },
  { name: 'Desktop', path: '/home/user/Desktop', isDirectory: true },
  { name: 'Downloads', path: '/home/user/Downloads', isDirectory: true },
  { name: '.bashrc', path: '/home/user/.bashrc', isDirectory: false, size: 1024 },
  { name: '.gitconfig', path: '/home/user/.gitconfig', isDirectory: false, size: 256 },
];
