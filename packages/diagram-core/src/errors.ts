import { Data } from 'effect';

export class GraphError extends Data.TaggedError('GraphError')<{
  readonly reason: string;
}> {}

export class NodeNotFoundError extends Data.TaggedError('NodeNotFoundError')<{
  readonly nodeId: string;
}> {}

export class EdgeNotFoundError extends Data.TaggedError('EdgeNotFoundError')<{
  readonly edgeId: string;
}> {}

export class DuplicateNodeError extends Data.TaggedError('DuplicateNodeError')<{
  readonly nodeId: string;
}> {}

export class DuplicateEdgeError extends Data.TaggedError('DuplicateEdgeError')<{
  readonly edgeId: string;
}> {}

export class InvalidEdgeError extends Data.TaggedError('InvalidEdgeError')<{
  readonly edgeId: string;
  readonly reason: string;
}> {}

export class LayoutError extends Data.TaggedError('LayoutError')<{
  readonly algorithm: string;
  readonly reason: string;
}> {}

export class EdgeRoutingError extends Data.TaggedError('EdgeRoutingError')<{
  readonly edgeId: string;
  readonly router: string;
  readonly reason: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly reason: string;
}> {}

export class ShapeNotFoundError extends Data.TaggedError('ShapeNotFoundError')<{
  readonly shape: string;
}> {}

export class CycleDetectedError extends Data.TaggedError('CycleDetectedError')<{
  readonly nodeIds: ReadonlyArray<string>;
}> {}

export class PortNotFoundError extends Data.TaggedError('PortNotFoundError')<{
  readonly portId: string;
  readonly nodeId: string;
}> {}

export class PortConnectionError extends Data.TaggedError('PortConnectionError')<{
  readonly reason: string;
  readonly sourcePortId?: string;
  readonly targetPortId?: string;
}> {}

export class NodeTypeNotFoundError extends Data.TaggedError('NodeTypeNotFoundError')<{
  readonly nodeType: string;
}> {}

export class GroupNotFoundError extends Data.TaggedError('GroupNotFoundError')<{
  readonly groupId: string;
}> {}
