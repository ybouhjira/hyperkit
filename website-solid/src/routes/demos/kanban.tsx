import { DemoShell } from '../../components/DemoShell';
import { KanbanApp } from '../../components/demo-apps/kanban/App';

export default function KanbanDemo() {
  return (
    <DemoShell name="Sprint Board" tagline="Drag-and-drop planning" sourceDir="kanban">
      <KanbanApp />
    </DemoShell>
  );
}
