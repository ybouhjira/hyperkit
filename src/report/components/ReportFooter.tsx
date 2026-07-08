import { type Component, splitProps } from 'solid-js';

export interface ReportFooterProps {
  text: string;
}

export const ReportFooter: Component<ReportFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['text']);

  return (
    <footer class="sk-report-footer" {...others}>
      {local.text}
    </footer>
  );
};
