export const THEME_VARS = {
  nodeFill: '--sk-diagram-node-fill',
  nodeStroke: '--sk-diagram-node-stroke',
  nodeRadius: '--sk-diagram-node-radius',
  nodeLabelColor: '--sk-diagram-node-label-color',
  edgeStroke: '--sk-diagram-edge-stroke',
  edgeLabelColor: '--sk-diagram-edge-label-color',
  selectStroke: '--sk-diagram-select-stroke',
  hoverFill: '--sk-diagram-hover-fill',
  background: '--sk-diagram-bg',
  gridColor: '--sk-diagram-grid-color',
  portColor: '--sk-diagram-port-color',
  portHoverColor: '--sk-diagram-port-hover-color',
  portCompatibleColor: '--sk-diagram-port-compatible-color',
  portIncompatibleColor: '--sk-diagram-port-incompatible-color',
  portLabelColor: '--sk-diagram-port-label-color',
  nodeHeaderBg: '--sk-diagram-node-header-bg',
} as const;

export type DiagramThemeVars = typeof THEME_VARS;

export interface DiagramTheme {
  readonly [key: string]: string;
}

export const applyDiagramTheme = (element: HTMLElement | SVGElement, theme: DiagramTheme): void => {
  for (const [key, value] of Object.entries(theme)) {
    const cssVar = THEME_VARS[key as keyof typeof THEME_VARS];
    if (cssVar) {
      (element as HTMLElement).style.setProperty(cssVar, value);
    }
  }
};

// Pre-built themes
export const lightTheme: DiagramTheme = {
  nodeFill: '#ffffff',
  nodeStroke: '#d1d5db',
  nodeLabelColor: '#111827',
  edgeStroke: '#9ca3af',
  edgeLabelColor: '#6b7280',
  selectStroke: '#3b82f6',
  hoverFill: '#f3f4f6',
  background: '#ffffff',
  gridColor: '#e5e7eb',
  portColor: '#94a3b8',
  portHoverColor: '#3b82f6',
  portCompatibleColor: '#22c55e',
  portIncompatibleColor: '#ef4444',
  portLabelColor: '#64748b',
  nodeHeaderBg: '#f1f5f9',
};

export const darkTheme: DiagramTheme = {
  nodeFill: '#1f2937',
  nodeStroke: '#4b5563',
  nodeLabelColor: '#f9fafb',
  edgeStroke: '#6b7280',
  edgeLabelColor: '#9ca3af',
  selectStroke: '#60a5fa',
  hoverFill: '#374151',
  background: '#111827',
  gridColor: '#1f2937',
  portColor: '#6b7280',
  portHoverColor: '#60a5fa',
  portCompatibleColor: '#4ade80',
  portIncompatibleColor: '#f87171',
  portLabelColor: '#94a3b8',
  nodeHeaderBg: '#1e293b',
};

// ---------------------------------------------------------------------------
// Community Theme Presets
// ---------------------------------------------------------------------------

/** Tokyo Night — dark theme by enkia */
export const tokyoNight: DiagramTheme = {
  background: '#1a1b26',
  gridColor: '#24283b',
  nodeFill: '#16161e',
  nodeStroke: '#7aa2f7',
  nodeLabelColor: '#c0caf5',
  nodeHeaderBg: 'rgba(122, 162, 247, 0.10)',
  edgeStroke: '#565f89',
  edgeLabelColor: '#565f89',
  selectStroke: '#bb9af7',
  hoverFill: '#24283b',
  portColor: '#414868',
  portHoverColor: '#7aa2f7',
  portCompatibleColor: '#9ece6a',
  portIncompatibleColor: '#f7768e',
  portLabelColor: '#565f89',
};

/** Dracula — dark theme by Zeno Rocha */
export const dracula: DiagramTheme = {
  background: '#282a36',
  gridColor: '#343746',
  nodeFill: '#21222c',
  nodeStroke: '#bd93f9',
  nodeLabelColor: '#f8f8f2',
  nodeHeaderBg: 'rgba(189, 147, 249, 0.15)',
  edgeStroke: '#6272a4',
  edgeLabelColor: '#6272a4',
  selectStroke: '#ff79c6',
  hoverFill: '#343746',
  portColor: '#44475a',
  portHoverColor: '#bd93f9',
  portCompatibleColor: '#50fa7b',
  portIncompatibleColor: '#ff5555',
  portLabelColor: '#6272a4',
};

/** Nord — dark theme by Arctic Ice Studio */
export const nord: DiagramTheme = {
  background: '#2e3440',
  gridColor: '#3b4252',
  nodeFill: '#3b4252',
  nodeStroke: '#88c0d0',
  nodeLabelColor: '#eceff4',
  nodeHeaderBg: 'rgba(136, 192, 208, 0.10)',
  edgeStroke: '#4c566a',
  edgeLabelColor: '#4c566a',
  selectStroke: '#88c0d0',
  hoverFill: '#434c5e',
  portColor: '#4c566a',
  portHoverColor: '#81a1c1',
  portCompatibleColor: '#a3be8c',
  portIncompatibleColor: '#bf616a',
  portLabelColor: '#4c566a',
};

/** Catppuccin Mocha — dark theme by Catppuccin */
export const catppuccinMocha: DiagramTheme = {
  background: '#1e1e2e',
  gridColor: '#313244',
  nodeFill: '#181825',
  nodeStroke: '#89b4fa',
  nodeLabelColor: '#cdd6f4',
  nodeHeaderBg: 'rgba(137, 180, 250, 0.10)',
  edgeStroke: '#6c7086',
  edgeLabelColor: '#6c7086',
  selectStroke: '#cba6f7',
  hoverFill: '#313244',
  portColor: '#45475a',
  portHoverColor: '#89b4fa',
  portCompatibleColor: '#a6e3a1',
  portIncompatibleColor: '#f38ba8',
  portLabelColor: '#6c7086',
};

/** GitHub Dark — dark theme by GitHub */
export const githubDark: DiagramTheme = {
  background: '#0d1117',
  gridColor: '#161b22',
  nodeFill: '#161b22',
  nodeStroke: '#58a6ff',
  nodeLabelColor: '#c9d1d9',
  nodeHeaderBg: 'rgba(88, 166, 255, 0.10)',
  edgeStroke: '#8b949e',
  edgeLabelColor: '#8b949e',
  selectStroke: '#58a6ff',
  hoverFill: '#21262d',
  portColor: '#30363d',
  portHoverColor: '#58a6ff',
  portCompatibleColor: '#3fb950',
  portIncompatibleColor: '#f85149',
  portLabelColor: '#8b949e',
};

/** GitHub Light — light theme by GitHub */
export const githubLight: DiagramTheme = {
  background: '#ffffff',
  gridColor: '#eaeef2',
  nodeFill: '#f6f8fa',
  nodeStroke: '#0969da',
  nodeLabelColor: '#24292f',
  nodeHeaderBg: 'rgba(9, 105, 218, 0.06)',
  edgeStroke: '#8c959f',
  edgeLabelColor: '#57606a',
  selectStroke: '#0969da',
  hoverFill: '#f3f4f6',
  portColor: '#d0d7de',
  portHoverColor: '#0969da',
  portCompatibleColor: '#2da44e',
  portIncompatibleColor: '#cf222e',
  portLabelColor: '#57606a',
};

/** One Dark Pro — dark theme (Atom One Dark) */
export const oneDarkPro: DiagramTheme = {
  background: '#282c34',
  gridColor: '#2c313c',
  nodeFill: '#21252b',
  nodeStroke: '#61afef',
  nodeLabelColor: '#abb2bf',
  nodeHeaderBg: 'rgba(97, 175, 239, 0.10)',
  edgeStroke: '#5c6370',
  edgeLabelColor: '#5c6370',
  selectStroke: '#61afef',
  hoverFill: '#2c313c',
  portColor: '#3e4451',
  portHoverColor: '#61afef',
  portCompatibleColor: '#98c379',
  portIncompatibleColor: '#e06c75',
  portLabelColor: '#5c6370',
};

/** Gruvbox Dark — dark theme by morhetz */
export const gruvboxDark: DiagramTheme = {
  background: '#282828',
  gridColor: '#3c3836',
  nodeFill: '#32302f',
  nodeStroke: '#fabd2f',
  nodeLabelColor: '#ebdbb2',
  nodeHeaderBg: 'rgba(250, 189, 47, 0.10)',
  edgeStroke: '#7c6f64',
  edgeLabelColor: '#7c6f64',
  selectStroke: '#fe8019',
  hoverFill: '#3c3836',
  portColor: '#504945',
  portHoverColor: '#fabd2f',
  portCompatibleColor: '#b8bb26',
  portIncompatibleColor: '#fb4934',
  portLabelColor: '#7c6f64',
};

/** Solarized Dark — dark theme by Ethan Schoonover */
export const solarizedDark: DiagramTheme = {
  background: '#002b36',
  gridColor: '#073642',
  nodeFill: '#073642',
  nodeStroke: '#268bd2',
  nodeLabelColor: '#93a1a1',
  nodeHeaderBg: 'rgba(38, 139, 210, 0.10)',
  edgeStroke: '#586e75',
  edgeLabelColor: '#586e75',
  selectStroke: '#268bd2',
  hoverFill: '#094552',
  portColor: '#094552',
  portHoverColor: '#2aa198',
  portCompatibleColor: '#859900',
  portIncompatibleColor: '#dc322f',
  portLabelColor: '#586e75',
};

/** Monokai Pro — dark theme by Wimer Hazenberg */
export const monokaiPro: DiagramTheme = {
  background: '#272822',
  gridColor: '#3e3d32',
  nodeFill: '#1e1f1c',
  nodeStroke: '#a6e22e',
  nodeLabelColor: '#f8f8f2',
  nodeHeaderBg: 'rgba(166, 226, 46, 0.10)',
  edgeStroke: '#75715e',
  edgeLabelColor: '#75715e',
  selectStroke: '#f92672',
  hoverFill: '#3e3d32',
  portColor: '#49483e',
  portHoverColor: '#a6e22e',
  portCompatibleColor: '#a6e22e',
  portIncompatibleColor: '#f92672',
  portLabelColor: '#75715e',
};

/** All built-in diagram theme presets */
export const allDiagramThemes: { name: string; theme: DiagramTheme }[] = [
  { name: 'Light', theme: lightTheme },
  { name: 'Dark', theme: darkTheme },
  { name: 'Tokyo Night', theme: tokyoNight },
  { name: 'Dracula', theme: dracula },
  { name: 'Nord', theme: nord },
  { name: 'Catppuccin Mocha', theme: catppuccinMocha },
  { name: 'GitHub Dark', theme: githubDark },
  { name: 'GitHub Light', theme: githubLight },
  { name: 'One Dark Pro', theme: oneDarkPro },
  { name: 'Gruvbox Dark', theme: gruvboxDark },
  { name: 'Solarized Dark', theme: solarizedDark },
  { name: 'Monokai Pro', theme: monokaiPro },
];
