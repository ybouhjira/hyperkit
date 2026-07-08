import { HyperkitEditor } from './Editor';
// Note: This relative path works because Explorer runs Vite from packages/explorer/,
// which resolves ../../packages/editor/src/ via its glob discovery.
// From packages/editor/src/, the path to explorer/src/api is:
import { defineStory } from '../../explorer/src/api';

export const EditorStory = defineStory({
  title: 'WYSIWYG Editor',
  category: 'Editor',
  layout: 'fullscreen',
  render: () => <HyperkitEditor height="100vh" />,
  controls: {},
});
