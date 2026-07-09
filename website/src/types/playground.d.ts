declare module '@babel/standalone' {
  export interface TransformResult {
    code: string | null;
  }
  export const availablePresets: Record<string, unknown>;
  export function transform(
    code: string,
    options: {
      filename?: string;
      presets?: unknown[];
      plugins?: unknown[];
      sourceMaps?: boolean;
    }
  ): TransformResult | null;
}

declare module 'babel-preset-solid' {
  const preset: unknown;
  export default preset;
}
