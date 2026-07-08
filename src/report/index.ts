// Components
export { ReportShell } from './components/ReportShell';
export type { ReportShellProps } from './components/ReportShell';

export { ReportNav } from './components/ReportNav';
export type { ReportNavProps } from './components/ReportNav';

export { ReportHero } from './components/ReportHero';
export type { ReportHeroProps } from './components/ReportHero';

export { ReportSection } from './components/ReportSection';
export type { ReportSectionProps } from './components/ReportSection';

export { ReportScoreCard } from './components/ReportScoreCard';
export type { ReportScoreCardProps } from './components/ReportScoreCard';

export { SummaryGrid } from './components/SummaryGrid';
export type { SummaryGridProps, SummaryGridItem } from './components/SummaryGrid';

export { FlowDiagram } from './components/FlowDiagram';
export type { FlowDiagramProps, FlowLayer } from './components/FlowDiagram';

export { LayerStack } from './components/LayerStack';
export type { LayerStackProps, StackLayer } from './components/LayerStack';

export { GapAnalysis } from './components/GapAnalysis';
export type { GapAnalysisProps, GapItem, Severity } from './components/GapAnalysis';

export { GapCard } from './components/GapCard';
export type { GapCardProps } from './components/GapCard';

export { PackageTree } from './components/PackageTree';
export type { PackageTreeProps, PackageBox } from './components/PackageTree';

export { PresetGrid } from './components/PresetGrid';
export type { PresetGridProps, PresetItem } from './components/PresetGrid';

export { SourceList } from './components/SourceList';
export type { SourceListProps, SourceGroup } from './components/SourceList';

export { DecisionGrid } from './components/DecisionGrid';
export type { DecisionGridProps } from './components/DecisionGrid';

export { Poll } from './components/Poll';
export type { PollProps } from './components/Poll';

export { FormFields } from './components/FormFields';
export type { FormFieldsProps } from './components/FormFields';

export { ReportFooter } from './components/ReportFooter';
export type { ReportFooterProps } from './components/ReportFooter';

// Schema renderer
export { Report } from './Report';
export type { ReportProps } from './Report';

// Types
export type {
  ReportSchema,
  ReportSectionSchema,
  SectionContent,
  SummaryGridContent,
  TableContent,
  CodeContent,
  FlowDiagramContent,
  LayerStackContent,
  GapAnalysisContent,
  TimelineContent,
  PackageTreeContent,
  PresetGridContent,
  SourceListContent,
  TextContent,
  IssueListContent,
  DecisionGridContent,
  DecisionGridOption,
  PollContent,
  PollOption,
  FormFieldsContent,
  FormFieldDef,
} from './types';

// Presets
export { architectureReviewSchema } from './presets/architectureReview';
