export interface AStarOptions {
  readonly gridSize?: number; // grid resolution in px, default 10
  readonly padding?: number; // clearance from node boundaries, default 15
  readonly borderRadius?: number; // rounded corners at turns, default 8
  readonly maxSearchNodes?: number; // safety cap, default 10000
}
