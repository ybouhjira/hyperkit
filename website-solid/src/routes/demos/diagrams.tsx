import { DemoShell } from '../../components/DemoShell';
import { DiagramsApp } from '../../components/demo-apps/diagrams/App';

export default function DiagramsDemo() {
  return (
    <DemoShell
      name="Architecture Studio"
      tagline="11 live diagrams, 3 layouts"
      sourceDir="diagrams"
    >
      <DiagramsApp />
    </DemoShell>
  );
}
