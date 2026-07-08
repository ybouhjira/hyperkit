/**
 * DiagramPreset — controls ALL visual aspects of diagram rendering.
 * Presets allow the same graph data to be rendered in completely different styles:
 * modern cards (React Flow), enterprise (GoJS), hand-drawn (Excalidraw), etc.
 */
export interface DiagramPreset {
  readonly id: string;
  readonly name: string;

  /** Canvas/background configuration */
  readonly canvas: {
    readonly background: string;
    readonly gridStyle: 'dots' | 'lines' | 'crosshatch' | 'none';
    readonly gridColor: string;
    readonly gridMajorColor?: string;
    readonly gridSize?: number;
    readonly fontFamily: string;
  };

  /** Default node visual configuration */
  readonly node: {
    /** Rendering approach: 'shape' = SVG path, 'card' = rich card with header/body, 'sketch' = hand-drawn */
    readonly renderer: 'shape' | 'card' | 'sketch';
    readonly fill: string;
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly borderRadius: number;
    readonly shadow: DiagramShadow | false;
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly padding: { readonly x: number; readonly y: number };
    readonly label: {
      readonly color: string;
      readonly fontSize: number;
      readonly fontWeight: string | number;
      readonly fontFamily?: string;
    };
    readonly subtitle?: {
      readonly color: string;
      readonly fontSize: number;
      readonly fontWeight?: string | number;
    };
    readonly icon?: {
      readonly size: number;
      readonly position: 'left' | 'top' | 'inline';
    };
    readonly badge?: {
      readonly fontSize: number;
      readonly borderRadius: number;
      readonly padding: { readonly x: number; readonly y: number };
    };
    /** Card-specific: colored header bar */
    readonly header?: {
      readonly height: number;
      readonly fontSize: number;
      readonly fontWeight: string | number;
      readonly textTransform?: string;
      readonly color: string;
    };
    /** Card-specific: left or top accent bar */
    readonly accent?: {
      readonly width: number;
      readonly position: 'left' | 'top';
    };
  };

  /** Default edge visual configuration */
  readonly edge: {
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly animated: boolean;
    readonly dashArray?: string;
    readonly label: {
      readonly color: string;
      readonly fontSize: number;
      readonly fontWeight?: string | number;
      readonly background: string;
      readonly border: string;
      readonly borderRadius: number;
      readonly padding: { readonly x: number; readonly y: number };
    };
    readonly arrow: {
      readonly type: string;
      readonly size: number;
      readonly color?: string;
    };
  };

  /** SVG filter effects */
  readonly effects: {
    /** Hand-drawn wobble filter (Excalidraw style) */
    readonly handDrawn: boolean;
    readonly handDrawnIntensity?: number;
  };

  /** Category color palette — maps category keys to colors */
  readonly palette: ReadonlyArray<{
    readonly key: string;
    readonly fill: string;
    readonly stroke: string;
    readonly headerColor?: string;
    readonly accentColor?: string;
  }>;
}

export interface DiagramShadow {
  readonly blur: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly color: string;
}

/** Look up palette entry for a category */
export const getPaletteEntry = (
  preset: DiagramPreset,
  category: string | undefined
): DiagramPreset['palette'][number] | undefined =>
  category ? preset.palette.find((p) => p.key === category) : undefined;
