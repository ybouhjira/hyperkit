import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { BugReporter, type BugReportStorage, type BugReport } from './BugReporter';

const meta: Meta<typeof BugReporter> = {
  title: 'Composites/BugReporter',
  component: BugReporter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BugReporter>;

/** In-memory storage so the story is fully interactive without a backend. */
function demoStorage(): BugReportStorage {
  let reports: BugReport[] = [];
  return {
    submit: (report) => {
      const full: BugReport = {
        ...report,
        id: `bug-${reports.length + 1}`,
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      reports = [full, ...reports];
      return Promise.resolve(full);
    },
    list: () => Promise.resolve([...reports]),
  };
}

/** Opens via the floating action button (bottom-right) or controlled state. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    // Hoisted: JSX props compile to getters, so an inline demoStorage() call
    // would create a NEW throwaway store on every property access.
    const storage = demoStorage();
    return (
      <div style={{ 'min-height': '320px', position: 'relative', width: '100%' }}>
        <BugReporter
          storage={storage}
          product="HyperDocs demo"
          reporterName="Youssef"
          reporterEmail="youssef@example.com"
          open={open()}
          onOpenChange={setOpen}
          disableShortcut
        />
      </div>
    );
  },
};
