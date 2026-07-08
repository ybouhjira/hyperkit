import { describe, it, expect } from 'vitest';
import { Schema as S } from 'effect';
import { extractBlueprint } from '../annotation';
import { Issue, IssueStatus, Label, User } from './Issue';

describe('Issue blueprint', () => {
  it('has all expected fields', () => {
    const fields = extractBlueprint(Issue);
    const names = fields.map(f => f.name);
    expect(names).toEqual([
      'title', 'status',           // priority 1
      'number', 'labels', 'commentCount',  // priority 2
      'assignee', 'updatedAt',     // priority 3
      'body',                      // priority 4
    ]);
  });

  it('uses all 8 kinds shown in the example', () => {
    const fields = extractBlueprint(Issue);
    const kinds = fields.map(f => f.annotation.kind);
    expect(kinds).toEqual([
      'title', 'status',
      'identifier', 'tag', 'metric',
      'person', 'timestamp',
      'content',
    ]);
  });

  it('has correct priority levels', () => {
    const fields = extractBlueprint(Issue);
    const priorities = fields.map(f => f.annotation.priority);
    expect(priorities).toEqual([1, 1, 2, 2, 2, 3, 3, 4]);
  });

  it('has priority 1 fields for pin view', () => {
    const fields = extractBlueprint(Issue);
    const pinFields = fields.filter(f => f.annotation.priority <= 1);
    expect(pinFields.map(f => f.name)).toEqual(['title', 'status']);
  });

  it('has priority <= 2 fields for row view', () => {
    const fields = extractBlueprint(Issue);
    const rowFields = fields.filter(f => f.annotation.priority <= 2);
    expect(rowFields.map(f => f.name)).toEqual([
      'title', 'status', 'number', 'labels', 'commentCount',
    ]);
  });

  it('has priority <= 3 fields for card view', () => {
    const fields = extractBlueprint(Issue);
    const cardFields = fields.filter(f => f.annotation.priority <= 3);
    expect(cardFields.map(f => f.name)).toEqual([
      'title', 'status', 'number', 'labels', 'commentCount',
      'assignee', 'updatedAt',
    ]);
  });

  it('has all fields for detail view (priority <= 4)', () => {
    const fields = extractBlueprint(Issue);
    const detailFields = fields.filter(f => f.annotation.priority <= 4);
    expect(detailFields).toHaveLength(8);
  });

  it('has inline annotations for nested types', () => {
    const fields = extractBlueprint(Issue);
    const labelsField = fields.find(f => f.name === 'labels');
    const assigneeField = fields.find(f => f.name === 'assignee');

    expect(labelsField?.annotation.inline).toEqual(['name', 'color']);
    expect(assigneeField?.annotation.inline).toEqual(['avatar', 'username']);
  });

  it('marks assignee as optional', () => {
    const fields = extractBlueprint(Issue);
    const assigneeField = fields.find(f => f.name === 'assignee');
    expect(assigneeField?.isOptional).toBe(true);
  });

  it('decodes valid issue data', () => {
    const data = {
      title: 'Fix bug in views',
      status: 'open' as const,
      number: 225,
      labels: [{ name: 'bug', color: '#ff0000' }],
      commentCount: 3,
      assignee: { username: 'alice', avatar: 'https://avatar.com/alice', name: 'Alice' },
      updatedAt: '2026-03-11T00:00:00.000Z',
      body: 'The blueprint annotations need an Issue example.',
    };

    const decode = S.decodeUnknownSync(Issue);
    const result = decode(data);
    expect(result.title).toBe('Fix bug in views');
    expect(result.status).toBe('open');
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('decodes issue without optional assignee', () => {
    const data = {
      title: 'Another issue',
      status: 'closed' as const,
      number: 100,
      labels: [],
      commentCount: 0,
      updatedAt: '2026-03-10T00:00:00.000Z',
      body: 'This issue has no assignee.',
    };

    const decode = S.decodeUnknownSync(Issue);
    const result = decode(data);
    expect(result.assignee).toBeUndefined();
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('validates IssueStatus enum', () => {
    const decode = S.decodeUnknownSync(IssueStatus);
    expect(decode('open')).toBe('open');
    expect(decode('closed')).toBe('closed');
    expect(decode('in_progress')).toBe('in_progress');
    expect(() => decode('invalid')).toThrow();
  });

  it('validates Label structure', () => {
    const decode = S.decodeUnknownSync(Label);
    const result = decode({ name: 'bug', color: '#ff0000' });
    expect(result.name).toBe('bug');
    expect(result.color).toBe('#ff0000');
  });

  it('validates User structure', () => {
    const decode = S.decodeUnknownSync(User);
    const result = decode({
      username: 'bob',
      avatar: 'https://avatar.com/bob',
      name: 'Bob Smith',
    });
    expect(result.username).toBe('bob');
    expect(result.name).toBe('Bob Smith');
  });
});
