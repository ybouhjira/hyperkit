/**
 * Adapter functions to map PMIssue/PMMilestone to various SolidKit component interfaces
 */

import type { PMIssue, PMMilestone } from './types';

/**
 * Maps PMIssue to IssueBoard's Issue interface
 */
export function toIssueBoardIssue(pm: PMIssue) {
  return {
    id: pm.uid,
    number: pm.number,
    title: pm.title,
    body: pm.body,
    state: pm.state === 'in_progress' ? ('open' as const) : pm.state,
    labels: pm.labels.map((l) => ({ name: l.name, color: l.color })),
    assignee: pm.assignee,
    milestone: pm.milestone,
    repo: pm.project,
    url: pm.url,
    createdAt: pm.createdAt,
    updatedAt: pm.updatedAt,
    priority: pm.priority,
  };
}

/**
 * Maps PMIssue to IssueMap's IssueData interface
 */
export function toIssueMapData(pm: PMIssue) {
  // Map state: open->ready, in_progress->active, closed->closed
  // If has dependencies and state is open, use 'blocked'
  let status: 'active' | 'ready' | 'blocked' | 'pending' | 'closed';
  if (pm.state === 'closed') {
    status = 'closed';
  } else if (pm.state === 'in_progress') {
    status = 'active';
  } else if (pm.dependsOn.length > 0) {
    status = 'blocked';
  } else {
    status = 'ready';
  }

  // Extract short project name from pm.project (e.g., 'ybouhjira/hyperkit' → 'hyperkit')
  const shortProject = pm.project.includes('/')
    ? pm.project.split('/').pop() ?? pm.project
    : pm.project;

  // Convert dependsOn UIDs to issue IDs
  // uid format: 'mock:ybouhjira/hyperkit:5' or 'github:ybouhjira/hyperkit:5'
  const dependsOn = pm.dependsOn.map((uid) => {
    const parts = uid.split(':');
    const depNumber = parts[parts.length - 1] ?? '0';
    // Extract project from uid: parts[1] is 'ybouhjira/hyperkit'
    const depProject = parts.length >= 3 ? parts[1] ?? '' : '';
    const shortDepProject = depProject.includes('/')
      ? depProject.split('/').pop() ?? depProject
      : depProject;
    return `${shortDepProject}-${depNumber}`;
  });

  return {
    id: `${shortProject}-${pm.number}`,
    number: pm.number,
    title: pm.title,
    status,
    progress: pm.progress,
    dependsOn,
    layer: pm.layer ?? 'Other',
    project: shortProject,
  };
}

/**
 * Maps PMMilestone[] to ProjectDashboard's MilestoneData[]
 */
export function toDashboardMilestones(milestones: readonly PMMilestone[]) {
  return milestones.map((m, index) => ({
    number: index,
    title: m.title,
    description: m.description,
    openIssues: m.openIssues,
    closedIssues: m.closedIssues,
    state: m.state,
  }));
}

/**
 * Maps PMIssue[] to ProjectDashboard's IssueData[]
 */
export function toDashboardIssues(issues: readonly PMIssue[]) {
  return issues.map((pm) => ({
    number: pm.number,
    title: pm.title,
    state: pm.state === 'in_progress' ? ('open' as const) : pm.state,
    labels: pm.labels.map((l) => ({ name: l.name, color: l.color })),
    milestone: pm.milestone ?? undefined,
    createdAt: pm.createdAt,
  }));
}

/**
 * Maps PMIssue[] to KanbanBoard's KanbanColumn[]
 * Groups issues by state into three columns
 */
export function toKanbanColumns(issues: readonly PMIssue[]) {
  const openIssues = issues.filter((i) => i.state === 'open');
  const inProgressIssues = issues.filter((i) => i.state === 'in_progress');
  const closedIssues = issues.filter((i) => i.state === 'closed');

  // Determine if we have multiple projects
  const uniqueProjects = new Set(issues.map((i) => i.project));
  const hasMultipleProjects = uniqueProjects.size > 1;

  const toCard = (pm: PMIssue) => {
    // Build subtitle: "#123 • @assignee • project-name"
    const parts: string[] = [`#${pm.number}`];
    if (pm.assignee) {
      parts.push(`@${pm.assignee}`);
    }
    if (hasMultipleProjects) {
      parts.push(pm.project);
    }
    const subtitle = parts.join(' • ');

    // Icon based on state
    const icon = pm.state === 'open' ? '○' : pm.state === 'in_progress' ? '◉' : '✓';

    // Accent: priority color if available, otherwise state color
    let accent: string;
    if (pm.priority) {
      accent = priorityColor(pm.priority);
    } else {
      accent = pm.state === 'open' ? '#22c55e' : pm.state === 'in_progress' ? '#3b82f6' : '#a855f7';
    }

    // Badge: priority if available, otherwise label count
    let badge: { text: string; color: string } | undefined;
    if (pm.priority) {
      badge = { text: pm.priority, color: priorityColor(pm.priority) };
    } else if (pm.labels.length > 0) {
      badge = { text: `${pm.labels.length} label${pm.labels.length === 1 ? '' : 's'}`, color: '#6b7280' };
    }

    return {
      id: pm.uid,
      title: pm.title,
      subtitle,
      badge,
      accent,
      icon,
    };
  };

  return [
    {
      id: 'open',
      label: 'Open',
      color: '#22c55e',
      cards: openIssues.map(toCard),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      color: '#3b82f6',
      cards: inProgressIssues.map(toCard),
    },
    {
      id: 'closed',
      label: 'Closed',
      color: '#a855f7',
      cards: closedIssues.map(toCard),
    },
  ];
}

/**
 * Maps PMIssue[] to Timeline's TimelineStep[]
 * Sorted by updatedAt descending
 */
export function toTimelineSteps(issues: readonly PMIssue[]) {
  const sorted = [...issues].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return sorted.map((pm) => {
    let status: 'completed' | 'active' | 'pending';
    if (pm.state === 'closed') {
      status = 'completed';
    } else if (pm.state === 'in_progress') {
      status = 'active';
    } else {
      status = 'pending';
    }

    const meta = formatRelativeTime(pm.updatedAt);
    const assigneePart = pm.assignee ? ` • @${pm.assignee}` : '';
    const description = `${pm.project}${assigneePart}`;

    return {
      title: pm.title,
      description,
      status,
      meta,
    };
  });
}

/**
 * Helper: Get color for priority badge
 */
function priorityColor(priority: 'P0' | 'P1' | 'P2' | 'P3'): string {
  switch (priority) {
    case 'P0':
      return '#ef4444'; // red
    case 'P1':
      return '#f97316'; // orange
    case 'P2':
      return '#eab308'; // yellow
    case 'P3':
      return '#22c55e'; // green
  }
}

/**
 * Helper: Format relative time (e.g., "2 days ago")
 */
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  }
  return 'just now';
}
