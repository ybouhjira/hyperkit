// @ybouhjira/diagram-svg - SVG renderer for diagram-core
export {
  renderDiagram,
  type RenderOptions,
  type DiagramPreset,
  modernPreset,
  enterprisePreset,
  sketchPreset,
  minimalPreset,
  blueprintPreset,
} from './renderer';
export {
  createViewportController,
  applyViewport,
  defaultViewport,
  type ViewportState,
  type ViewportController,
} from './viewport';
export {
  THEME_VARS,
  applyDiagramTheme,
  lightTheme,
  darkTheme,
  tokyoNight,
  dracula,
  nord,
  catppuccinMocha,
  githubDark,
  githubLight,
  oneDarkPro,
  gruvboxDark,
  solarizedDark,
  monokaiPro,
  allDiagramThemes,
  type DiagramTheme,
  type DiagramThemeVars,
} from './themes';
export { defaultPortColors, getPortColor, getPortLabelOffset } from './port-colors';
export { renderGroup, getGroupStyles } from './group-renderer';
export { renderAlignmentGuides, getAlignmentGuideStyles } from './alignment-guides';
export type { AlignmentGuide } from '@ybouhjira/diagram-core';
export {
  exportSvg,
  exportPng,
  type SvgExportOptions,
  type PngExportOptions,
} from './export';
export {
  buildSpatialIndex,
  queryVisibleElements,
  applyCulling,
  createCullingController,
  type SpatialItem,
  type CullingOptions,
  type CullingController,
} from './spatial-index';
export {
  computeLabelPlacements,
  type LabelPlacementOptions,
  type LabelPlacement,
} from './label-placement';
export {
  justinmindPreset,
  registerJustinmindRenderers,
  createJustinmindActionCard,
  JUSTINMIND_SHAPE,
  type JustinmindActionCardData,
  type JustinmindIcon,
  type JustinmindBadge,
} from './justinmind-preset';
export {
  fusejsPreset,
  registerFusejsRenderers,
  createFusejsTechCard,
  createFusejsHeroCard,
  FUSEJS_TECH_SHAPE,
  FUSEJS_HERO_SHAPE,
  FUSEJS_LIME_EDGE,
  FUSEJS_GRAY_EDGE,
  FUSEJS_FRAME_GRAY,
  FUSEJS_FRAME_LIME,
  FUSEJS_LABEL_GRAY,
  FUSEJS_LABEL_LIME,
  type FusejsTechCardData,
  type FusejsHeroCardData,
  type FusejsTechIcon,
} from './fusejs-preset';
