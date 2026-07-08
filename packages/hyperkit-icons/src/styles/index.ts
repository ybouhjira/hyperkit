import type { IconStyle, StyleRenderer } from '../types';
import { renderFluent } from './fluent';
import { renderGlossy } from './glossy';
import { renderFrosted } from './frosted';
import { renderNeumorphic } from './neumorphic';
import { renderNeon } from './neon';
import { renderGradientStroke } from './gradient-stroke';

const RENDERERS: Record<IconStyle, StyleRenderer> = {
  fluent: renderFluent,
  glossy: renderGlossy,
  frosted: renderFrosted,
  neumorphic: renderNeumorphic,
  neon: renderNeon,
  'gradient-stroke': renderGradientStroke,
};

export function getStyleRenderer(style: IconStyle): StyleRenderer {
  return RENDERERS[style];
}
