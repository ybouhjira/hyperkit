import { DemoShell } from '../../components/DemoShell';
import { AiWorkspaceApp } from '../../components/demo-apps/ai-workspace/App';

export default function AiWorkspacePage() {
  return (
    <DemoShell name="AI Workspace" tagline="Multi-session agent chat" sourceDir="ai-workspace">
      <AiWorkspaceApp />
    </DemoShell>
  );
}
