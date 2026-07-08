import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { SequenceDiagram, computeLayout, DEFAULT_GEOMETRY } from '../src';
import type { SequenceData, SequencePalette } from '../src';

const palette: SequencePalette = {
  neutral: { stroke: 'rgb(1, 1, 1)', fill: 'rgb(2, 2, 2)', text: 'rgb(3, 3, 3)' },
  accent: { stroke: 'rgb(10, 10, 10)', fill: 'rgb(11, 11, 11)', text: 'rgb(12, 12, 12)' },
  success: { stroke: 'rgb(20, 20, 20)', fill: 'rgb(21, 21, 21)', text: 'rgb(22, 22, 22)' },
  warning: { stroke: 'rgb(30, 30, 30)', fill: 'rgb(31, 31, 31)', text: 'rgb(32, 32, 32)' },
  error: { stroke: 'rgb(40, 40, 40)', fill: 'rgb(41, 41, 41)', text: 'rgb(42, 42, 42)' },
  info: { stroke: 'rgb(50, 50, 50)', fill: 'rgb(51, 51, 51)', text: 'rgb(52, 52, 52)' },
};

const basicData: SequenceData = {
  actors: [
    { id: 'client', label: 'Client' },
    { id: 'server', label: 'Server', tone: 'accent' },
  ],
  steps: [
    { type: 'message', from: 'client', to: 'server', label: 'request' },
    { type: 'message', from: 'server', to: 'client', label: 'response', kind: 'return' },
  ],
};

describe('SequenceDiagram', () => {
  it('renders an accessible svg with the sk-sequence class', () => {
    const { getByRole, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    const svg = getByRole('img', { name: 'Sequence diagram' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.classList.contains('sk-sequence')).toBe(true);
    unmount();
  });

  it('merges a custom class next to sk-sequence', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} class="my-diagram" />
    ));
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('sk-sequence')).toBe(true);
    expect(svg.classList.contains('my-diagram')).toBe(true);
    unmount();
  });

  it('sets the viewBox from the computed layout dimensions', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    const layout = computeLayout(basicData, DEFAULT_GEOMETRY);
    expect(container.querySelector('svg')!.getAttribute('viewBox')).toBe(
      `0 0 ${layout.width} ${layout.height}`
    );
    unmount();
  });

  it('renders a header box and a lifeline per actor', () => {
    const { container, getByText, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    expect(container.querySelectorAll('.sk-sequence__actors rect')).toHaveLength(2);
    expect(container.querySelectorAll('.sk-sequence__lifelines line')).toHaveLength(2);
    expect(getByText('Client')).toBeTruthy();
    expect(getByText('Server')).toBeTruthy();
    unmount();
  });

  it('colors actor headers from the palette by tone, defaulting to neutral', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    const [client, server] = Array.from(container.querySelectorAll('.sk-sequence__actors rect'));
    expect(client!.getAttribute('fill')).toBe(palette.neutral.fill);
    expect(server!.getAttribute('fill')).toBe(palette.accent.fill);
    unmount();
  });

  it('renders one arrow line and label per message', () => {
    const { container, getByText, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    expect(container.querySelectorAll('.sk-sequence__steps line')).toHaveLength(2);
    expect(getByText('request')).toBeTruthy();
    expect(getByText('response')).toBeTruthy();
    unmount();
  });

  it('draws sync messages solid with the filled arrowhead marker', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    const sync = container.querySelectorAll('.sk-sequence__steps line')[0]!;
    expect(sync.getAttribute('stroke-dasharray')).toBe('');
    expect(sync.getAttribute('marker-end')).toBe('url(#sk-seq-arrow-sync)');
    unmount();
  });

  it('draws return messages dashed with the open arrowhead and a return title', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} />
    ));
    const ret = container.querySelectorAll('.sk-sequence__steps line')[1]!;
    expect(ret.getAttribute('stroke-dasharray')).toBe('5 4');
    expect(ret.getAttribute('marker-end')).toBe('url(#sk-seq-arrow-open)');
    const titles = Array.from(container.querySelectorAll('.sk-sequence__steps title'));
    expect(titles.some((t) => t.textContent === 'return')).toBe(true);
    unmount();
  });

  it('draws async messages with the open arrowhead but no dash', () => {
    const data: SequenceData = {
      actors: basicData.actors,
      steps: [{ type: 'message', from: 'client', to: 'server', label: 'fire', kind: 'async' }],
    };
    const { container, unmount } = render(() => <SequenceDiagram data={data} palette={palette} />);
    const line = container.querySelector('.sk-sequence__steps line')!;
    expect(line.getAttribute('stroke-dasharray')).toBe('');
    expect(line.getAttribute('marker-end')).toBe('url(#sk-seq-arrow-open)');
    unmount();
  });

  it('renders self messages as a loop path instead of a line', () => {
    const data: SequenceData = {
      actors: basicData.actors,
      steps: [{ type: 'message', from: 'server', to: 'server', label: 'retry' }],
    };
    const { container, getByText, unmount } = render(() => (
      <SequenceDiagram data={data} palette={palette} />
    ));
    expect(container.querySelectorAll('.sk-sequence__steps line')).toHaveLength(0);
    expect(container.querySelectorAll('.sk-sequence__steps path')).toHaveLength(1);
    expect(getByText('retry')).toBeTruthy();
    unmount();
  });

  it('prefixes message labels with numbers when autonumber is on', () => {
    const data: SequenceData = { ...basicData, autonumber: true };
    const { getByText, unmount } = render(() => <SequenceDiagram data={data} palette={palette} />);
    expect(getByText('1. request')).toBeTruthy();
    expect(getByText('2. response')).toBeTruthy();
    unmount();
  });

  it('colors message arrows from the palette by tone', () => {
    const data: SequenceData = {
      actors: basicData.actors,
      steps: [{ type: 'message', from: 'client', to: 'server', label: 'boom', tone: 'error' }],
    };
    const { container, unmount } = render(() => <SequenceDiagram data={data} palette={palette} />);
    expect(container.querySelector('.sk-sequence__steps line')!.getAttribute('stroke')).toBe(
      palette.error.stroke
    );
    unmount();
  });

  it('renders notes as a rect with centered text', () => {
    const data: SequenceData = {
      actors: basicData.actors,
      steps: [
        {
          type: 'note',
          anchor: { kind: 'over', actor: 'client' },
          text: 'important',
          tone: 'info',
        },
      ],
    };
    const { container, getByText, unmount } = render(() => (
      <SequenceDiagram data={data} palette={palette} />
    ));
    const rect = container.querySelector('.sk-sequence__steps rect')!;
    expect(rect.getAttribute('fill')).toBe(palette.info.fill);
    expect(getByText('important')).toBeTruthy();
    unmount();
  });

  it('renders mixed messages and notes in document order', () => {
    const data: SequenceData = {
      actors: basicData.actors,
      steps: [
        { type: 'message', from: 'client', to: 'server', label: 'req' },
        { type: 'note', anchor: { kind: 'span', from: 'client', to: 'server' }, text: 'note' },
        { type: 'message', from: 'server', to: 'client', label: 'res', kind: 'return' },
      ],
    };
    const { container, unmount } = render(() => <SequenceDiagram data={data} palette={palette} />);
    expect(container.querySelectorAll('.sk-sequence__steps line')).toHaveLength(2);
    expect(container.querySelectorAll('.sk-sequence__steps rect')).toHaveLength(1);
    unmount();
  });

  it('renders empty data as a bare svg with arrow marker defs only', () => {
    const { container, unmount } = render(() => (
      <SequenceDiagram data={{ actors: [], steps: [] }} palette={palette} />
    ));
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('.sk-sequence__actors rect')).toHaveLength(0);
    expect(container.querySelectorAll('.sk-sequence__lifelines line')).toHaveLength(0);
    expect(container.querySelectorAll('.sk-sequence__steps *')).toHaveLength(0);
    expect(container.querySelectorAll('defs marker')).toHaveLength(2);
    unmount();
  });

  it('applies custom geometry to actor positions', () => {
    const geometry = { firstActorX: 60, actorSpacing: 90 };
    const { container, unmount } = render(() => (
      <SequenceDiagram data={basicData} palette={palette} geometry={geometry} />
    ));
    const lifelines = Array.from(container.querySelectorAll('.sk-sequence__lifelines line'));
    expect(lifelines.map((l) => l.getAttribute('x1'))).toEqual(['60', '150']);
    unmount();
  });
});
