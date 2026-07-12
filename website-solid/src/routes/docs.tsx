/** Layout route: wraps every /docs page in the docs shell (sidebar + main). */
import type { RouteSectionProps } from '@solidjs/router';
import { DocsLayout } from '../components/docs/DocsLayout';

export default function DocsSection(props: RouteSectionProps) {
  return <DocsLayout>{props.children}</DocsLayout>;
}
