import {
  type Component,
  type JSX,
  splitProps,
  For,
  Show,
  createSignal,
  onMount,
  untrack,
  createMemo,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ReportSchema, SectionContent } from './types';
import { ReportShell } from './components/ReportShell';
import { ReportNav } from './components/ReportNav';
import { ReportHero } from './components/ReportHero';
import { ReportSection } from './components/ReportSection';
import { ReportScoreCard } from './components/ReportScoreCard';
import { SummaryGrid } from './components/SummaryGrid';
import { FlowDiagram } from './components/FlowDiagram';
import { LayerStack } from './components/LayerStack';
import { GapAnalysis } from './components/GapAnalysis';
import { PackageTree } from './components/PackageTree';
import { PresetGrid } from './components/PresetGrid';
import { SourceList } from './components/SourceList';
import { ReportFooter } from './components/ReportFooter';
import { DecisionGrid } from './components/DecisionGrid';
import { Poll } from './components/Poll';
import { FormFields } from './components/FormFields';
import { AppRenderer } from './components/AppRenderer';
// Import primitives for inline content types
import { CodeBlock } from '../primitives/CodeBlock';
import { Timeline } from '../primitives/Timeline';
import { Table } from '../primitives/Table';

export interface ReportProps {
  schema: ReportSchema;
  class?: string;
  embedded?: boolean;
  onSubmit?: (responses: Record<string, unknown>) => void;
}

function findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let current = el?.parentElement ?? null;
  while (current) {
    const style = getComputedStyle(current);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export const Report: Component<ReportProps> = (props) => {
  const [local, _others] = splitProps(props, ['schema', 'class', 'embedded', 'onSubmit']);
  const [activeSection, setActiveSection] = createSignal<string | null>(
    untrack(() =>
      local.schema.sections.length > 0 ? (local.schema.sections[0]?.id ?? null) : null
    )
  );
  let containerRef!: HTMLDivElement;

  // Shared store for interactive responses keyed by content `id`
  const [responses, setResponses] = createStore<Record<string, unknown>>({});

  const hasInteractiveContent = createMemo(() =>
    local.schema.sections.some((section) =>
      section.content.some(
        (c) => c.type === 'decision-grid' || c.type === 'poll' || c.type === 'form-fields'
      )
    )
  );

  // Render content based on type
  const renderContent = (content: SectionContent) => {
    switch (content.type) {
      case 'summary-grid':
        return <SummaryGrid items={content.items} />;

      case 'table': {
        // Convert generic table schema to typed Table component
        type RowData = Record<string, string | JSX.Element>;
        return (
          <Table<RowData>
            columns={content.columns.map((c) => ({
              key: c.key as keyof RowData,
              header: c.label,
            }))}
            data={content.rows}
            getRowKey={(_item: RowData) => `row-${Math.random()}`}
          />
        );
      }

      case 'code':
        return <CodeBlock code={content.code} language={content.language} label={content.label} />;

      case 'flow-diagram':
        return <FlowDiagram title={content.title} layers={content.layers} />;

      case 'layer-stack':
        return <LayerStack layers={content.layers} />;

      case 'gap-analysis':
        return <GapAnalysis title={content.title} gaps={content.gaps} />;

      case 'timeline':
        return <Timeline steps={content.steps} />;

      case 'package-tree':
        return <PackageTree boxes={content.boxes} />;

      case 'preset-grid':
        return <PresetGrid presets={content.presets} />;

      case 'source-list':
        return <SourceList groups={content.groups} />;

      case 'text':
        return content.html === true ? (
          // eslint-disable-next-line solid/no-innerhtml
          <div innerHTML={content.content} />
        ) : (
          <p style={{ color: 'var(--sk-text-secondary)', 'line-height': '1.7' }}>
            {content.content}
          </p>
        );

      case 'issue-list':
        return (
          <div class="sk-report-issue-list">
            <For each={content.issues}>
              {(issue) => (
                <div class="sk-report-issue-item">
                  <div class="sk-report-issue-icon">{issue.icon}</div>
                  <div>
                    <div class="sk-report-issue-item__title">{issue.title}</div>
                    <div class="sk-report-issue-item__desc">{issue.description}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        );

      case 'decision-grid':
        return (
          <DecisionGrid
            id={content.id}
            label={content.label}
            description={content.description}
            multiple={content.multiple}
            options={content.options}
            selected={(responses[content.id] as string[]) ?? []}
            onSelect={(selected) => setResponses(content.id, selected)}
          />
        );

      case 'poll':
        return (
          <Poll
            id={content.id}
            label={content.label}
            multiple={content.multiple}
            options={content.options}
            selected={(responses[content.id] as string[]) ?? []}
            onSelect={(selected) => setResponses(content.id, selected)}
          />
        );

      case 'form-fields':
        return (
          <FormFields
            id={content.id}
            label={content.label}
            fields={content.fields}
            values={(responses[content.id] as Record<string, unknown>) ?? {}}
            onChange={(values) => setResponses(content.id, values)}
          />
        );

      case 'app':
        return <AppRenderer content={content} />;

      default:
        return null;
    }
  };

  // Scroll spy for navigation
  onMount(() => {
    const scrollRoot = findScrollableAncestor(containerRef);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: scrollRoot, // null = viewport (standalone), element = panel (embedded)
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    local.schema.sections.forEach((section) => {
      const element = containerRef.querySelector(`#${CSS.escape(section.id)}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  });

  const handleNavClick = (id: string) => {
    const element = containerRef.querySelector(`#${CSS.escape(id)}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ReportShell
      class={[local.class, local.embedded ? 'sk-report--embedded' : ''].filter(Boolean).join(' ')}
    >
      <div ref={containerRef}>
        <ReportNav
          brand={local.schema.brand ?? local.schema.title}
          links={local.schema.sections.map((section) => ({
            id: section.id,
            label: section.label ?? section.title,
          }))}
          activeId={activeSection() ?? undefined}
          onLinkClick={handleNavClick}
        />
        <div class="sk-report-container">
          <ReportHero
            title={local.schema.title}
            subtitle={local.schema.subtitle}
            badge={local.schema.badge}
            meta={local.schema.meta}
          />
          <Show when={local.schema.score}>
            {(score) => (
              <ReportScoreCard
                value={score().value}
                label={score().label}
                description={score().description}
                color={score().color}
                chips={score().chips}
              />
            )}
          </Show>
          <For each={local.schema.sections}>
            {(section, index) => (
              <ReportSection
                id={section.id}
                label={`Section ${index() + 1}`}
                title={section.title}
                description={section.description}
                descriptionHtml={section.descriptionHtml}
              >
                <For each={section.content}>{(content) => renderContent(content)}</For>
              </ReportSection>
            )}
          </For>
          <Show when={local.onSubmit && hasInteractiveContent()}>
            <div class="sk-report-submit">
              <button
                type="button"
                class="sk-report-submit__btn"
                onClick={() => local.onSubmit?.(responses)}
              >
                Submit
              </button>
            </div>
          </Show>
          <Show when={local.schema.footer}>{(footer) => <ReportFooter text={footer()} />}</Show>
        </div>
      </div>
    </ReportShell>
  );
};
