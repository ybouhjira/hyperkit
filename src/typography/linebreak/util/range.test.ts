import { describe, it, expect } from 'vitest';
import { textNodesInRange } from './range';

describe('textNodesInRange', () => {
  it('returns text nodes within a range', () => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('hello '));
    const span = document.createElement('span');
    span.appendChild(document.createTextNode('world'));
    div.appendChild(span);
    div.appendChild(document.createTextNode(' end'));
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    const texts = textNodesInRange(range, () => true);
    expect(texts.length).toBe(3);
    expect(texts[0]!.nodeValue).toBe('hello ');
    expect(texts[1]!.nodeValue).toBe('world');
    expect(texts[2]!.nodeValue).toBe(' end');

    document.body.removeChild(div);
  });

  it('filters out nodes when filter returns false', () => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('hello '));
    const span = document.createElement('span');
    span.classList.add('skip');
    span.appendChild(document.createTextNode('world'));
    div.appendChild(span);
    div.appendChild(document.createTextNode(' end'));
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    // Filter rejects the <span> and its children
    const texts = textNodesInRange(range, (node) => {
      if (node instanceof Element && node.classList.contains('skip')) {
        return false;
      }
      return true;
    });

    // Should only get 'hello ' and ' end', not 'world'
    expect(texts.length).toBe(2);
    expect(texts[0]!.nodeValue).toBe('hello ');
    expect(texts[1]!.nodeValue).toBe(' end');

    document.body.removeChild(div);
  });

  it('returns empty array for range with no text nodes', () => {
    const div = document.createElement('div');
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('hr'));
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    const texts = textNodesInRange(range, () => true);
    expect(texts).toEqual([]);

    document.body.removeChild(div);
  });

  it('handles nested elements', () => {
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.appendChild(document.createTextNode('first '));
    const em = document.createElement('em');
    em.appendChild(document.createTextNode('second '));
    const strong = document.createElement('strong');
    strong.appendChild(document.createTextNode('third'));
    em.appendChild(strong);
    p.appendChild(em);
    div.appendChild(p);
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    const texts = textNodesInRange(range, () => true);
    expect(texts.length).toBe(3);
    expect(texts[0]!.nodeValue).toBe('first ');
    expect(texts[1]!.nodeValue).toBe('second ');
    expect(texts[2]!.nodeValue).toBe('third');

    document.body.removeChild(div);
  });

  it('handles range that covers only part of the content', () => {
    const div = document.createElement('div');
    const span1 = document.createElement('span');
    span1.appendChild(document.createTextNode('first'));
    const span2 = document.createElement('span');
    span2.appendChild(document.createTextNode('second'));
    const span3 = document.createElement('span');
    span3.appendChild(document.createTextNode('third'));
    div.appendChild(span1);
    div.appendChild(span2);
    div.appendChild(span3);
    document.body.appendChild(div);

    const range = document.createRange();
    range.setStart(div.children[1]!, 0);
    range.setEnd(div.children[1]!, 1);

    const texts = textNodesInRange(range, () => true);
    expect(texts.length).toBe(1);
    expect(texts[0]!.nodeValue).toBe('second');

    document.body.removeChild(div);
  });

  it('handles empty text nodes', () => {
    const div = document.createElement('div');
    const empty = document.createTextNode('');
    const full = document.createTextNode('content');
    div.appendChild(empty);
    div.appendChild(full);
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);

    const texts = textNodesInRange(range, () => true);
    expect(texts.some((t) => t.nodeValue === 'content')).toBe(true);

    document.body.removeChild(div);
  });
});
