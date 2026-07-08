import type { AlignmentGuide } from '@ybouhjira/diagram-core';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Render alignment guides as SVG lines */
export const renderAlignmentGuides = (guides: ReadonlyArray<AlignmentGuide>): SVGElement => {
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', 'sk-diagram-alignment-guides');

  for (const guide of guides) {
    const line = document.createElementNS(SVG_NS, 'line');
    if (guide.type === 'vertical') {
      line.setAttribute('x1', String(guide.position));
      line.setAttribute('y1', String(guide.from - 10));
      line.setAttribute('x2', String(guide.position));
      line.setAttribute('y2', String(guide.to + 10));
    } else {
      line.setAttribute('x1', String(guide.from - 10));
      line.setAttribute('y1', String(guide.position));
      line.setAttribute('x2', String(guide.to + 10));
      line.setAttribute('y2', String(guide.position));
    }
    line.setAttribute('class', 'sk-diagram-alignment-guide');
    group.appendChild(line);
  }

  return group;
};

export const getAlignmentGuideStyles = (): string => `
  .sk-diagram-alignment-guide {
    stroke: #f43f5e;
    stroke-width: 1;
    stroke-dasharray: 4 3;
    pointer-events: none;
    opacity: 0.7;
  }
`;
