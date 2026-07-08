import { type JSX, type Component, splitProps } from 'solid-js';
import '../Report.css';

export interface ReportShellProps {
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

export const ReportShell: Component<ReportShellProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'style']);
  return (
    <div class={`sk-report ${local.class ?? ''}`} style={local.style} {...others}>
      {local.children}
    </div>
  );
};
