import { DemoShell } from '../../components/DemoShell';
import { FilesApp } from '../../components/demo-apps/files/App';

export default function FilesPage() {
  return (
    <DemoShell name="File Manager" tagline="Two-pane file browser" sourceDir="files">
      <FilesApp />
    </DemoShell>
  );
}
