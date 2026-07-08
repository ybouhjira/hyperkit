import type { NodeTypeDefinition } from '../graph/types';
import { PortId } from '../graph/types';

export const rerouteNodeType: NodeTypeDefinition = {
  type: 'reroute',
  category: 'Utility',
  label: 'Reroute',
  icon: '○',
  description: 'Redirect edge connections for cleaner layouts',
  defaultSize: { width: 12, height: 12 },
  defaultPorts: [
    { id: PortId('in'), direction: 'west', offset: 0.5, label: '' },
    { id: PortId('out'), direction: 'east', offset: 0.5, label: '' },
  ],
  defaultData: {},
  tags: ['reroute', 'utility', 'redirect'],
};
