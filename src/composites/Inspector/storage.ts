import type { Annotation, CreateAnnotationData, InspectorStorage, ThreadMessage } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createAnnotationFromData(data: CreateAnnotationData): Annotation {
  const id = generateId();
  return {
    id,
    selector: data.selector,
    elementInfo: data.elementInfo,
    status: 'open',
    createdAt: new Date().toISOString(),
    thread: [
      {
        id: generateId(),
        author: 'user',
        text: data.note,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function addReplyToAnnotation(ann: Annotation, text: string, author: string): Annotation {
  const msg: ThreadMessage = {
    id: generateId(),
    author: author as 'user' | 'claude',
    text,
    timestamp: new Date().toISOString(),
  };
  return { ...ann, thread: [...ann.thread, msg] };
}

// ─── localStorage Storage ────────────────────────────────────────────────────

/**
 * Store annotations in localStorage. Works in any browser/Electron app.
 * No server needed.
 */
export function createLocalStorage(key: string): InspectorStorage {
  const storageKey = `sk-inspector-${key}`;

  function load(): Annotation[] {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Annotation[]) : [];
    } catch {
      return [];
    }
  }

  function save(annotations: Annotation[]): void {
    localStorage.setItem(storageKey, JSON.stringify(annotations));
  }

  return {
    getAll() {
      return Promise.resolve(load());
    },

    create(data) {
      const ann = createAnnotationFromData(data);
      const all = load();
      all.push(ann);
      save(all);
      return Promise.resolve(ann);
    },

    update(id, patch) {
      const all = load();
      const idx = all.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Annotation ${id} not found`);
      const updated = { ...all[idx], ...patch } as Annotation;
      all[idx] = updated;
      save(all);
      return Promise.resolve(updated);
    },

    delete(id) {
      const all = load().filter((a) => a.id !== id);
      save(all);
      return Promise.resolve();
    },

    reply(id, text, author) {
      const all = load();
      const idx = all.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Annotation ${id} not found`);
      const updated = addReplyToAnnotation(all[idx] as Annotation, text, author);
      all[idx] = updated;
      save(all);
      return Promise.resolve(updated);
    },
  };
}

// ─── API Storage ─────────────────────────────────────────────────────────────

/**
 * Store annotations via REST API. For web apps with a server backend.
 * Optionally subscribes to a WebSocket for real-time updates.
 */
export function createApiStorage(baseUrl: string, wsUrl?: string): InspectorStorage {
  return {
    async getAll() {
      const res = await fetch(baseUrl);
      return (await res.json()) as Annotation[];
    },

    async create(data) {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return (await res.json()) as Annotation;
    },

    async update(id, patch) {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      return (await res.json()) as Annotation;
    },

    async delete(id) {
      await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
    },

    async reply(id, text, author) {
      const res = await fetch(`${baseUrl}/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
      });
      return (await res.json()) as Annotation;
    },

    subscribe: wsUrl
      ? (callback) => {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = (e) => {
            try {
              const msg = JSON.parse(e.data as string) as {
                type: string;
                annotations?: Annotation[];
              };
              if (msg.type === 'annotation_update' && Array.isArray(msg.annotations)) {
                callback(msg.annotations);
              }
            } catch {
              /* ignore parse errors */
            }
          };
          return () => ws.close();
        }
      : undefined,
  };
}

// ─── Memory Storage ──────────────────────────────────────────────────────────

/**
 * In-memory storage for testing. Lost on page refresh.
 */
export function createMemoryStorage(): InspectorStorage {
  let annotations: Annotation[] = [];
  const listeners: Array<(anns: Annotation[]) => void> = [];

  function notify(): void {
    for (const fn of listeners) fn([...annotations]);
  }

  return {
    getAll() {
      return Promise.resolve([...annotations]);
    },

    create(data) {
      const ann = createAnnotationFromData(data);
      annotations.push(ann);
      notify();
      return Promise.resolve(ann);
    },

    update(id, patch) {
      const idx = annotations.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Annotation ${id} not found`);
      const updated = { ...annotations[idx], ...patch } as Annotation;
      annotations[idx] = updated;
      notify();
      return Promise.resolve(updated);
    },

    delete(id) {
      annotations = annotations.filter((a) => a.id !== id);
      notify();
      return Promise.resolve();
    },

    reply(id, text, author) {
      const idx = annotations.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error(`Annotation ${id} not found`);
      const updated = addReplyToAnnotation(annotations[idx] as Annotation, text, author);
      annotations[idx] = updated;
      notify();
      return Promise.resolve(updated);
    },

    subscribe(callback) {
      listeners.push(callback);
      return () => {
        const i = listeners.indexOf(callback);
        if (i >= 0) listeners.splice(i, 1);
      };
    },
  };
}
