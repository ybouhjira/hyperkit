import { createMemo, type JSX } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/DocumentPage/DocumentPage.css';

export interface DocumentPageProps {
  readonly size?: 'a4' | 'letter';
  readonly orientation?: 'portrait' | 'landscape';
  readonly padding?: string;
  readonly children: JSX.Element;
  readonly header?: JSX.Element;
  readonly footer?: JSX.Element;
  readonly pageNumber?: number;
  readonly style?: JSX.CSSProperties;
}

/**
 * A4 container component for print-ready documents.
 * Renders as white page on dark background with shadow (screen).
 * Automatically optimizes for print media (no background, proper page breaks).
 */
export function DocumentPage(props: DocumentPageProps): JSX.Element {
  const size = createMemo(() => props.size || 'a4');
  const orientation = createMemo(() => props.orientation || 'portrait');

  const containerClass = createMemo(() =>
    [
      'sk-doc-page-container',
      `sk-doc-page-container--${size()}`,
      `sk-doc-page-container--${orientation()}`,
    ].join(' ')
  );

  // The padding prop feeds the stylesheet through the --sk-doc-padding custom
  // property; the user style prop merges last so it can override anything.
  const containerStyle = createMemo((): JSX.CSSProperties => ({
    ...(props.padding !== undefined ? { '--sk-doc-padding': props.padding } : {}),
    ...props.style,
  }));

  return (
    <div class={containerClass()} style={containerStyle()}>
      {props.header !== undefined && <div class="sk-doc-page__header">{props.header}</div>}

      <div class="sk-doc-page__body">{props.children}</div>

      {(props.footer !== undefined || props.pageNumber !== undefined) && (
        <div class="sk-doc-page__footer">
          <div>{props.footer}</div>
          {props.pageNumber !== undefined && <div>Page {props.pageNumber}</div>}
        </div>
      )}
    </div>
  );
}
