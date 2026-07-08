import { TimelineProvider, SessionTimeline } from '@ybouhjira/hyperkit-timeline';
import '@ybouhjira/hyperkit-timeline/dist/hyperkit-timeline.css';

export function TimelineTab() {
  return (
    <TimelineProvider>
      <SessionTimeline title="Navigable Action Timeline" />
    </TimelineProvider>
  );
}
