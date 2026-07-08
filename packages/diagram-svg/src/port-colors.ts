/** Default color map for port data types */
export const defaultPortColors: Record<string, string> = {
  number: '#2563eb',    // blue
  string: '#16a34a',    // green
  boolean: '#dc2626',   // red
  object: '#9333ea',    // purple
  array: '#ea580c',     // orange
  image: '#0891b2',     // cyan
  audio: '#d946ef',     // fuchsia
  video: '#f59e0b',     // amber
  any: '#6b7280',       // gray
  default: '#94a3b8',   // slate (fallback)
};

/** Get color for a port's dataType */
export const getPortColor = (
  dataType: string | undefined,
  customColors?: Record<string, string>
): string => {
  const fallback = '#94a3b8'; // slate
  if (!dataType) return defaultPortColors.default ?? fallback;
  const merged = { ...defaultPortColors, ...customColors };
  return merged[dataType] ?? defaultPortColors.default ?? fallback;
};

/** Get label position offsets for a port based on direction */
export const getPortLabelOffset = (
  direction: 'north' | 'south' | 'east' | 'west'
): { dx: number; dy: number; anchor: string } => {
  switch (direction) {
    case 'east':
      return { dx: 10, dy: 0, anchor: 'start' };
    case 'west':
      return { dx: -10, dy: 0, anchor: 'end' };
    case 'north':
      return { dx: 0, dy: -10, anchor: 'middle' };
    case 'south':
      return { dx: 0, dy: 10, anchor: 'middle' };
  }
};
