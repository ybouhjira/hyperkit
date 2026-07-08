/**
 * Example blueprint: Issue schema with UI annotations.
 * Demonstrates the 15 semantic kinds and priority-based field selection.
 *
 * This blueprint matches the design doc example and shows how to annotate
 * an Effect Schema with UI metadata for view generation.
 */

import { Schema as S } from 'effect';
import { ui } from '../annotation';

/** Issue status enum */
export const IssueStatus = S.Literal('open', 'closed', 'in_progress');
export type IssueStatus = S.Schema.Type<typeof IssueStatus>;

/** Label with color */
export const Label = S.Struct({
  name: S.String,
  color: S.String,
});
export type Label = S.Schema.Type<typeof Label>;

/** User with avatar */
export const User = S.Struct({
  username: S.String,
  avatar: S.String,
  name: S.String,
});
export type User = S.Schema.Type<typeof User>;

/**
 * Issue blueprint — demonstrates all priority levels and multiple kinds.
 *
 * Priority levels:
 * - 1: Always visible (title, status)
 * - 2: Visible in most views (number, labels, commentCount)
 * - 3: Detail and card views (assignee, updatedAt)
 * - 4: Detail view only (body)
 *
 * Shapes use priority to filter:
 * - detail → priority <= 4 (all fields)
 * - card → priority <= 3
 * - row → priority <= 2
 * - pin → priority <= 1
 */
export const Issue = S.Struct({
  // Priority 1 — always visible
  title: S.String.pipe(
    ui('title', 1, { label: 'Title' })
  ),
  status: IssueStatus.pipe(
    ui('status', 1, { label: 'Status' })
  ),

  // Priority 2 — visible in most views
  number: S.Number.pipe(
    ui('identifier', 2, { label: '#' })
  ),
  labels: S.Array(Label).pipe(
    ui('tag', 2, { label: 'Labels', inline: ['name', 'color'] })
  ),
  commentCount: S.Number.pipe(
    ui('metric', 2, { label: 'Comments' })
  ),

  // Priority 3 — detail and card views
  assignee: S.optional(User.pipe(
    ui('person', 3, { label: 'Assignee', inline: ['avatar', 'username'] })
  )),
  updatedAt: S.Date.pipe(
    ui('timestamp', 3, { label: 'Updated' })
  ),

  // Priority 4 — detail view only
  body: S.String.pipe(
    ui('content', 4, { label: 'Description' })
  ),
});

export type Issue = S.Schema.Type<typeof Issue>;

/**
 * Example usage with extractBlueprint:
 *
 * ```ts
 * import { extractBlueprint } from '../annotation';
 * import { Issue } from './Issue';
 *
 * const fields = extractBlueprint(Issue);
 * // Returns all annotated fields sorted by priority:
 * // [
 * //   { name: 'title', annotation: { kind: 'title', priority: 1, ... }, ... },
 * //   { name: 'status', annotation: { kind: 'status', priority: 1, ... }, ... },
 * //   { name: 'number', annotation: { kind: 'identifier', priority: 2, ... }, ... },
 * //   ...
 * // ]
 *
 * // Filter by priority for different shapes:
 * const pinFields = fields.filter(f => f.annotation.priority <= 1);  // title, status
 * const rowFields = fields.filter(f => f.annotation.priority <= 2);  // + number, labels, commentCount
 * const cardFields = fields.filter(f => f.annotation.priority <= 3); // + assignee, updatedAt
 * const detailFields = fields.filter(f => f.annotation.priority <= 4); // all fields
 * ```
 */
