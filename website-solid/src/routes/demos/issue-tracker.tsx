import { DemoShell } from '../../components/DemoShell';
import { IssueTrackerApp } from '../../components/demo-apps/issue-tracker/App';

export default function IssueTrackerDemo() {
  return (
    <DemoShell
      name="Issue Tracker"
      tagline="GitHub-style project tracker"
      sourceDir="issue-tracker"
    >
      <IssueTrackerApp />
    </DemoShell>
  );
}
