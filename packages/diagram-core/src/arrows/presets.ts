import type { ArrowHeadType } from '../graph/types';

export interface ArrowHeadDefinition {
  readonly type: ArrowHeadType;
  readonly path: string; // SVG path for the marker
  readonly viewBox: string; // SVG viewBox
  readonly width: number;
  readonly height: number;
  readonly refX: number; // reference point X
  readonly refY: number; // reference point Y
}

export const arrowHeadDefinitions: Record<ArrowHeadType, ArrowHeadDefinition> = {
  none: {
    type: 'none',
    path: '',
    viewBox: '0 0 0 0',
    width: 0,
    height: 0,
    refX: 0,
    refY: 0,
  },
  triangle: {
    type: 'triangle',
    path: 'M 0 0 L 12 6 L 0 12 Z',
    viewBox: '0 0 12 12',
    width: 14,
    height: 14,
    refX: 10,
    refY: 6,
  },
  diamond: {
    type: 'diamond',
    path: 'M 0 6 L 6 0 L 12 6 L 6 12 Z',
    viewBox: '0 0 12 12',
    width: 14,
    height: 14,
    refX: 10,
    refY: 6,
  },
  circle: {
    type: 'circle',
    path: 'M 6 0 A 6 6 0 1 1 6 12 A 6 6 0 1 1 6 0 Z',
    viewBox: '0 0 12 12',
    width: 14,
    height: 14,
    refX: 10,
    refY: 6,
  },
  vee: {
    type: 'vee',
    path: 'M 0 0 L 12 6 L 0 12 L 4 6 Z',
    viewBox: '0 0 12 12',
    width: 14,
    height: 14,
    refX: 10,
    refY: 6,
  },
  tee: {
    type: 'tee',
    path: 'M 0 0 L 0 10 L 2 10 L 2 0 Z',
    viewBox: '0 0 2 10',
    width: 2,
    height: 10,
    refX: 1,
    refY: 5,
  },
};

export const getArrowHead = (type: ArrowHeadType): ArrowHeadDefinition =>
  arrowHeadDefinitions[type];
