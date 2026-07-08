// Sample Issue data for the demo
export const sampleIssue = {
  title: 'Fix responsive layout on mobile devices',
  status: 'open' as const,
  number: 1234,
  labels: [
    { name: 'bug', color: '#d73a4a' },
    { name: 'ui', color: '#0075ca' },
    { name: 'mobile', color: '#cfd3d7' },
    { name: 'P1', color: '#d73a4a' },
  ],
  commentCount: 12,
  assignee: {
    username: 'alice_chen',
    avatar: 'https://i.pravatar.cc/40?u=alice',
    name: 'Alice Chen',
  },
  updatedAt: new Date('2026-03-08'),
  body: 'The sidebar overlaps content on screens below 768px. Need to switch to hamburger menu on mobile breakpoints.',
};

export const sampleIssue2 = {
  title: 'Add dark mode support to views package',
  status: 'in_progress' as const,
  number: 1235,
  labels: [
    { name: 'feature', color: '#0075ca' },
    { name: 'theme', color: '#cfd3d7' },
  ],
  commentCount: 5,
  assignee: {
    username: 'bob_park',
    avatar: 'https://i.pravatar.cc/40?u=bob',
    name: 'Bob Park',
  },
  updatedAt: new Date('2026-03-09'),
  body: 'Implement dark mode tokens.',
};

export const sampleIssue3 = {
  title: 'Schema validation error on optional fields',
  status: 'closed' as const,
  number: 1236,
  labels: [
    { name: 'bug', color: '#d73a4a' },
    { name: 'schema', color: '#0075ca' },
  ],
  commentCount: 3,
  assignee: {
    username: 'carol_li',
    avatar: 'https://i.pravatar.cc/40?u=carol',
    name: 'Carol Li',
  },
  updatedAt: new Date('2026-03-05'),
  body: 'Fixed validation.',
};

export type IssueData = typeof sampleIssue;
export const allIssues = [sampleIssue, sampleIssue2, sampleIssue3];
