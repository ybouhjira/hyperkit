import { DemoShell } from '../../components/DemoShell';
import { DashboardApp } from '../../components/demo-apps/dashboard/App';

export default function DashboardDemo() {
  return (
    <DemoShell name="Ops Dashboard" tagline="Live metrics & reporting" sourceDir="dashboard">
      <DashboardApp />
    </DemoShell>
  );
}
