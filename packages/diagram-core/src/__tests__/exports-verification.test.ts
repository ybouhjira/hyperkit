import { describe, it, expect } from 'vitest';

describe('P2 Exports Verification', () => {
  it('should export serialization functions', async () => {
    const exports = await import('../index');

    expect(exports.serializeWorkflow).toBeDefined();
    expect(exports.deserializeWorkflow).toBeDefined();
    expect(exports.exportWorkflowJSON).toBeDefined();
    expect(exports.importWorkflowJSON).toBeDefined();
  });

  it('should export alignment functions', async () => {
    const exports = await import('../index');

    expect(exports.computeAlignmentSnap).toBeDefined();
  });

  it('should export reroute node type', async () => {
    const exports = await import('../index');

    expect(exports.rerouteNodeType).toBeDefined();
    expect(exports.rerouteNodeType.type).toBe('reroute');
  });
});
