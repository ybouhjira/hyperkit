import type { ExplorerPlugin } from '../types'
import { Sidebar } from '../../components/Sidebar/Sidebar'

export const defaultSidebarPlugin: ExplorerPlugin = {
  id: 'default-sidebar',
  name: 'Classic Sidebar',
  description: 'The original story tree sidebar with search.',
  icon: '📋',
  version: '1.0.0',
  slots: {
    sidebar: Sidebar,
  },
}
