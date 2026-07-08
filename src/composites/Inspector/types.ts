// ─── Inspector Types ─────────────────────────────────────────────────────────

export interface AnnotationElementInfo {
  tagName: string;
  classes: string[];
  textPreview: string;
  boundingRect: { x: number; y: number; width: number; height: number };
  computedRole?: string;
  ariaLabel?: string;
}

export interface ThreadMessage {
  id: string;
  author: 'user' | 'claude';
  text: string;
  timestamp: string;
}

export interface Annotation {
  id: string;
  selector: string;
  elementInfo: AnnotationElementInfo;
  status: 'open' | 'resolved';
  createdAt: string;
  thread: ThreadMessage[];
}

export interface CreateAnnotationData {
  selector: string;
  elementInfo: AnnotationElementInfo;
  note: string;
}

/**
 * Pluggable storage backend for annotations.
 * Implement this interface to connect the Inspector to any persistence layer.
 */
export interface InspectorStorage {
  getAll(): Promise<Annotation[]>;
  create(data: CreateAnnotationData): Promise<Annotation>;
  update(id: string, patch: Partial<Pick<Annotation, 'status'>>): Promise<Annotation>;
  delete(id: string): Promise<void>;
  reply(id: string, text: string, author: string): Promise<Annotation>;
  /** Optional real-time subscription. Return an unsubscribe function. */
  subscribe?(callback: (annotations: Annotation[]) => void): () => void;
}

export interface InspectorProps {
  /** When true, inspect mode is active — hover highlights elements, click selects */
  active: boolean;
  /** Called when the user closes inspect mode (Esc or button) */
  onClose: () => void;
  /** Called when user clicks "+ New Comment" in the panel */
  onNewComment?: () => void;
}
