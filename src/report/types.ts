import type { JSX } from 'solid-js';

// Section content discriminated union
export type SectionContent =
  | SummaryGridContent
  | TableContent
  | CodeContent
  | FlowDiagramContent
  | LayerStackContent
  | GapAnalysisContent
  | TimelineContent
  | PackageTreeContent
  | PresetGridContent
  | SourceListContent
  | TextContent
  | IssueListContent
  | DecisionGridContent
  | PollContent
  | FormFieldsContent
  | AppContent;

export interface SummaryGridContent {
  type: 'summary-grid';
  items: {
    icon: string;
    iconColor?: 'teal' | 'blue' | 'purple';
    title: string;
    description: string;
  }[];
}

export interface TableContent {
  type: 'table';
  columns: { key: string; label: string }[];
  rows: Record<string, string | JSX.Element>[];
}

export interface CodeContent {
  type: 'code';
  code: string;
  language?: string;
  label?: string;
}

export interface FlowDiagramContent {
  type: 'flow-diagram';
  title?: string;
  layers: {
    id: string;
    title: string;
    packages?: string;
    subtitle?: string;
    color: 'app' | 'adapter' | 'core';
  }[];
}

export interface LayerStackContent {
  type: 'layer-stack';
  layers: {
    label: string;
    name: string;
    info: string;
    color: 'purple' | 'blue' | 'teal' | 'green';
  }[];
}

export interface GapAnalysisContent {
  type: 'gap-analysis';
  title?: string;
  gaps: {
    id: string;
    title: string;
    severity: 'critical' | 'important' | 'nice';
    rows?: { tag: 'problem' | 'solution' | 'precedent'; text: string }[];
  }[];
}

export interface TimelineContent {
  type: 'timeline';
  steps: {
    title: string;
    description?: string;
    status?: 'completed' | 'active' | 'pending';
    meta?: string;
  }[];
}

export interface PackageTreeContent {
  type: 'package-tree';
  boxes: {
    name: string;
    note?: string;
    items?: string[];
    chips?: { label: string; detail?: string }[];
  }[];
}

export interface PresetGridContent {
  type: 'preset-grid';
  presets: {
    name: string;
    description: string;
    gradient: string;
  }[];
}

export interface SourceListContent {
  type: 'source-list';
  groups: {
    title: string;
    sources: { url: string; label: string; description?: string }[];
  }[];
}

export interface TextContent {
  type: 'text';
  content: string;
  html?: boolean;
}

export interface IssueListContent {
  type: 'issue-list';
  issues: {
    icon: string;
    title: string;
    description: string;
  }[];
}

// ─── Interactive Content Types ───────────────────────────────────────────────

export interface DecisionGridOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

export interface DecisionGridContent {
  type: 'decision-grid';
  id: string;
  label: string;
  description?: string;
  multiple?: boolean;
  options: DecisionGridOption[];
}

export interface PollOption {
  id: string;
  label: string;
}

export interface PollContent {
  type: 'poll';
  id: string;
  label: string;
  multiple?: boolean;
  options: PollOption[];
}

export type FormFieldDef =
  | { type: 'text'; id: string; label: string; placeholder?: string; required?: boolean }
  | { type: 'number'; id: string; label: string; min?: number; max?: number; required?: boolean }
  | { type: 'select'; id: string; label: string; options: PollOption[]; required?: boolean }
  | { type: 'checkbox'; id: string; label: string }
  | { type: 'textarea'; id: string; label: string; placeholder?: string; required?: boolean };

export interface FormFieldsContent {
  type: 'form-fields';
  id: string;
  label?: string;
  fields: FormFieldDef[];
}

export interface AppContent {
  type: 'app';
  code: string;
  title?: string;
  description?: string;
  width?: string;
  height?: string;
}

// Mockup types — used by MockupRenderer for schema-driven component previews

export interface MockupNode {
  component: string;
  props?: Record<string, unknown>;
  children?: string | MockupNode | MockupNode[];
  style?: Record<string, string>;
  class?: string;
}

export interface MockupSlot {
  children: MockupNode | MockupNode[];
}

export interface MockupLayoutContent {
  type: 'mockup-layout';
  template: string;
  slots: Record<string, MockupSlot>;
  title?: string;
  description?: string;
  width?: string;
  height?: string;
}

export interface MockupTreeContent {
  type: 'mockup-tree';
  root: MockupNode;
  title?: string;
  description?: string;
  width?: string;
  height?: string;
}

// Section definition
export interface ReportSectionSchema {
  id: string;
  label?: string;
  title: string;
  description?: string;
  descriptionHtml?: boolean;
  content: SectionContent[];
}

// Top-level schema
export interface ReportSchema {
  title: string;
  subtitle?: string;
  badge?: string;
  brand?: string;
  meta?: { label: string; icon?: string }[];
  score?: {
    value: number;
    label: string;
    description?: string;
    color?: string;
    chips?: { text: string; variant: 'done' | 'partial' | 'missing' }[];
  };
  sections: ReportSectionSchema[];
  footer?: string;
}
