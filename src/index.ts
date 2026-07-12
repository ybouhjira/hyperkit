import '@ybouhjira/hyperkit-styles/styles.css';

// ── Primitives ─────────────────────────────────────────
export * from './primitives';

// ── Layout Tokens ──────────────────────────────────────
export type {
  SpaceToken,
  BgToken,
  TextColorToken,
  RadiusToken,
  ShadowToken,
  ZToken,
  FontSizeToken,
  FontWeightToken,
} from './primitives/layout';
export {
  mapSpace,
  mapBg,
  mapTextColor,
  mapRadius,
  mapShadow,
  mapZ,
  mapFontSize,
  mapFontWeight,
  resolveSize,
} from './primitives/layout';

// ── Composites ─────────────────────────────────────────
export * from './composites';

// ── Theme ──────────────────────────────────────────────
export { ThemeProvider } from './theme';
export type { DevToolsConfig } from './theme/ThemeProvider';
export {
  applyThemeToDOM,
  applyThemeToElement,
  serializeThemeVars,
  renderThemeStyle,
} from './theme/injectThemeVars';
export { useTheme } from './theme/useTheme';
export type { UseThemeReturn } from './theme/useTheme';
export { ThemePicker } from './theme/ThemePicker';
export { FontSelect } from './theme/FontSelect';
export { themePresets } from './theme/presets';
export {
  galleryHubDarkTheme,
  reportDarkTheme,
  defaultLightTheme,
  highContrastTheme,
  warmDarkTheme,
  oceanTheme,
  roseTheme,
  devtoolsTheme,
  productivityBlueTheme,
  neonStudioTheme,
  hyperlabsTheme,
  fjordTheme,
} from './theme/presets';
export type { ThemeConfig, ThemeColors, ThemeFonts, ThemeRadius } from './theme/types';
// Theme-driven sound design — primitives + apps trigger via play(name).
export { useThemeSounds, playTone, playUrl } from './theme/sounds';
export type { UseThemeSoundsReturn, ThemeSoundEventName } from './theme/sounds';

// ── Desktop ────────────────────────────────────────────
export { DesktopProvider } from './desktop';
export { useDesktop } from './desktop/useDesktop';
export type { UseDesktopReturn } from './desktop/useDesktop';
export { WebAdapter } from './desktop/adapters/WebAdapter';
export { ElectronAdapter } from './desktop/adapters/ElectronAdapter';
export { DesktopCapability } from './desktop/types';
export type { DesktopAdapter, FileDialogOptions } from './desktop/types';

// ── Animation ──────────────────────────────────────────
export { AnimationProvider } from './animation';
export { useAnimation } from './animation/useAnimation';
export type { UseAnimationReturn } from './animation/useAnimation';
export { Transition } from './animation/Transition';
export { ScrollReveal } from './animation/ScrollReveal';
export type { ScrollRevealProps } from './animation/ScrollReveal';
export { AnimateOnScroll } from './animation/AnimateOnScroll';
export type { AnimateOnScrollProps } from './animation/AnimateOnScroll';
export {
  enterAnimation,
  animationClass,
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleFade,
} from './animation/presets';
export type { AnimationConfig, TransitionPreset, TransitionConfig } from './animation/types';
export { AnimationContext } from './animation';
export type { AnimationContextValue } from './animation';

// ── Motion ────────────────────────────────────────────
export { Motion, Presence, resolveEasing, easingMap } from './motion';
export type {
  MotionProps,
  PresenceProps,
  MotionVariant,
  MotionVariants,
  MotionTransition,
  SpringConfig as MotionSpringConfig,
  EasingPreset,
} from './motion';

// ── FX ────────────────────────────────────────────────
export {
  TiltCard,
  GlassCard,
  GlowElement,
  HolographicCard,
  GradientBorder,
  CursorSpotlight,
  ParticleField,
  ShaderBackground,
  MorphingBlob,
  SpringCounter,
  ScoreRing,
  TypewriterText,
  SkeletonShimmer,
} from './fx';
export type {
  TiltCardProps,
  GlassCardProps,
  GlowElementProps,
  HolographicCardProps,
  GradientBorderProps,
  CursorSpotlightProps,
  ParticleFieldProps,
  ShaderBackgroundProps,
  ShaderPreset,
  MorphingBlobProps,
  SpringCounterProps,
  ScoreRingProps,
  TypewriterTextProps,
  SkeletonShimmerProps,
  SkeletonVariant,
} from './fx';

// ── Hooks ──────────────────────────────────────────────
export {
  createEffectResource,
  createEffectStream,
  useBreakpoint,
  useMode,
  modeDefinitions,
  useHaptic,
  createHaptic,
  useNotificationSound,
  createNotificationSound,
  createEventBus,
  useEventBus,
  useLogger,
  useSpring,
  useMotionValue,
  useGesture,
  useScrollProgress,
  useRemoteData,
  useRemoteAction,
  useTTS,
  createTTS,
} from './hooks';
export type {
  EffectResourceOptions,
  EffectResourceResult,
  EffectStreamOptions,
  EffectStreamResult,
  Breakpoint,
  Mode,
  ModeDefinition,
  UseModeReturn,
  HapticOptions,
  HapticReturn,
  NotificationSoundOptions,
  NotificationSoundReturn,
  EventBus,
  UseLoggerOptions,
  UseLoggerResult,
  SpringConfig,
  UseSpringReturn,
  MotionValueOptions,
  UseMotionValueReturn,
  GestureState,
  UseGestureOptions,
  UseGestureReturn,
  UseScrollProgressOptions,
  UseScrollProgressReturn,
  UseRemoteDataOptions,
  UseRemoteDataReturn,
  RefreshStrategy,
  UseRemoteActionOptions,
  UseRemoteActionReturn,
  TTSOptions,
  TTSSpeakOptions,
  TTSHandle,
  UseTTSReturn,
} from './hooks';
export { useVideoPreview } from './hooks/useVideoPreview';
export { formatTime } from './hooks/useVideoPreview/formatTime';
export { createLLMUIController } from './hooks/createLLMUIController';
export type {
  UIAction,
  LLMToolCall,
  LLMMessage,
  LLMAdapter,
  LLMUIControllerOptions,
  LLMUIControllerReturn,
} from './hooks/createLLMUIController';

// ── Keyboard ───────────────────────────────────────────
export { KeyboardProvider, useKeyboard, useShortcut, useShortcuts } from './keyboard';
export { KeyboardScope, ShortcutsHelp, formatShortcut } from './keyboard';
export type {
  ShortcutConfig,
  ShortcutRegistration,
  KeyboardContextValue,
  ShortcutsHelpProps,
  KeyboardScopeProps,
  ScopeEntry,
  ScopeOptions,
} from './keyboard';

// ── Panels ─────────────────────────────────────────────
export { PanelContainer } from './panels/PanelContainer';
export { PanelGroup } from './panels/PanelGroup';
export { PanelResizeHandle } from './panels/PanelResizeHandle';
export { PanelDropZone } from './panels/PanelDropZone';
export { usePanelLayout } from './panels/usePanelLayout';
export { usePanelDrag } from './panels/usePanelDrag';
export type {
  PanelConfig,
  PanelState,
  PanelLayoutState,
  PanelLayoutActions,
  PanelPosition,
  PanelDirection,
  PanelContainerProps,
  PanelProps,
  PanelResizeHandleProps,
  DropZoneInfo,
  PanelDragState,
} from './panels/types';

// ── Navigation ────────────────────────────────────────
export * from './navigation';

// ── Views ──────────────────────────────────────────────
export { ViewSwitcher } from './views/ViewSwitcher';
export type {
  ViewMode,
  ViewModeConfig,
  ViewRendererProps,
  ViewSwitcherProps,
  ViewRendererMap,
} from './views/types';

// ── Layouts ────────────────────────────────────────────
export { OnboardingLayout } from './layouts/OnboardingLayout';
export type { OnboardingLayoutProps } from './layouts/OnboardingLayout';
export { ChatLayout } from './layouts/ChatLayout';
export type { ChatLayoutProps } from './layouts/ChatLayout';

// ── Effects ────────────────────────────────────────────
export {
  WebSocketError,
  WebSocketConnectionError,
  SessionNotFoundError,
  SessionCreationError,
  FileSystemError,
  DirectoryNotFoundError,
  ClipboardError,
  ApiError,
  AiStateError,
} from './effects/errors';
export { WebSocketService } from './effects/WebSocketService';
export type { WsMessage } from './effects/WebSocketService';
export { SessionService } from './effects/SessionService';
export type { Session, CreateSessionParams } from './effects/SessionService';
export { FileSystemService } from './effects/FileSystemService';
export type { FileEntry } from './effects/FileSystemService';
export { ClipboardService } from './effects/ClipboardService';
export { AiStateService, makeAiStateLayer, onAiNotification } from './effects/AiStateService';
export type {
  AppSnapshot,
  ComponentSnapshot,
  AnnotationSnapshot,
  ElementContent,
  StateUpdate,
  AppNotification,
  UserEvent,
} from './effects/AiStateService';
export { LoggingService, makeLoggingLayer } from './effects/LoggingService';
export type { LogEntry, LoggingServiceConfig } from './effects/LoggingService';
export { SimpleTransport, ScopedTransport } from './effects/logging';
export type { LogTransportDef } from './effects/logging';
export {
  ConsoleTransport,
  HttpTransport,
  BeaconTransport,
  SentryTransport,
} from './effects/logging';
export type {
  ConsoleTransportConfig,
  HttpTransportConfig,
  BeaconTransportConfig,
  SentryLike,
  SentryTransportConfig,
} from './effects/logging';

// User & License services
export { UserService, hasRole, ROLE_HIERARCHY } from './effects/UserService';
export type {
  User,
  UserRole,
  RegisterParams,
  InviteLink,
  CreateInviteParams,
} from './effects/UserService';
export { LicenseService } from './effects/LicenseService';
export type { License, LicenseStatus, GenerateLicenseParams } from './effects/LicenseService';

// Error types (user + license)
export {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidInviteError,
  LicenseNotFoundError,
  LicenseInvalidError,
} from './effects/errors';

// ── Editor ─────────────────────────────────────────
export * from './editor';

// ── Report ─────────────────────────────────────────────
export {
  Report,
  ReportShell,
  ReportNav,
  ReportHero,
  ReportSection,
  ReportScoreCard,
  SummaryGrid,
  FlowDiagram,
  LayerStack,
  GapAnalysis,
  GapCard,
  PackageTree,
  PresetGrid,
  SourceList,
  ReportFooter,
  architectureReviewSchema,
} from './report';
export type {
  ReportProps,
  ReportSchema,
  ReportSectionSchema,
  SectionContent,
  ReportShellProps,
  ReportNavProps,
  ReportHeroProps,
  ReportSectionProps,
  ReportScoreCardProps,
  SummaryGridProps,
  SummaryGridItem,
  FlowDiagramProps,
  FlowLayer,
  LayerStackProps,
  StackLayer,
  GapAnalysisProps,
  GapItem,
  Severity,
  GapCardProps,
  PackageTreeProps,
  PackageBox,
  PresetGridProps,
  PresetItem,
  SourceListProps,
  SourceGroup,
  ReportFooterProps,
} from './report';

// ── Icons ──────────────────────────────────────────────
export { Icon } from './icons';
export type { IconProps, IconSize } from './icons';
export * from './icons/named';

// ── Typography ─────────────────────────────────────────
export { useKnuthPlass } from './typography';

// ── Utils ──────────────────────────────────────────────
export { validateProps } from './utils';
export type { PropRule, PropSchema } from './utils';

// ── Server ────────────────────────────────────────────
export { createNavigableRouter, generateMCPTools, routeMCPToolCall, buildToolName } from './server';
export type {
  NavigableRouterOptions,
  NavigableRouterHandle,
  IncomingRequest,
  ServerResponse,
  NextFunction,
  MCPToolDefinition,
} from './server';

// ── DevBridge ─────────────────────────────────────────
export { DevBridge } from './server';
export type { DevBridgeProps, DevBridgeAPI, DevBridgeHealth, ConsoleEntry } from './server';

// ── Test Fixtures ──────────────────────────────────────
export { createMockLLMAdapter } from './__fixtures__/mockLLMAdapter';

// ── Components API ─────────────────────────────────────
export { getAllComponents, getComponent, getCategory, searchComponents } from './components-api';
export type { ComponentMetadata, ComponentType, ExportKind } from './components-api';

// ── Live Render (DEV-ONLY) ──────────────────────────────
// Security: loopback-bound SSE endpoint only. See packages/ai-renderer/SECURITY.md.
export {
  LiveRenderer,
  NodeRenderer,
  validateUINode,
  LiveRenderError,
} from './live-render/index.js';
export type { UINode, LiveRendererProps, NodeRendererProps } from './live-render/index.js';
