import { createMemo, type JSX } from 'solid-js';

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
  const padding = createMemo(() => props.padding || '20mm');

  const aspectRatio = createMemo(() => {
    const isPortrait = orientation() === 'portrait';
    if (size() === 'a4') {
      return isPortrait ? '210 / 297' : '297 / 210';
    }
    // Letter: 8.5" × 11"
    return isPortrait ? '8.5 / 11' : '11 / 8.5';
  });

  const containerStyle = createMemo((): JSX.CSSProperties => ({
    width: '100%',
    'max-width': orientation() === 'portrait' ? '800px' : '1100px',
    'aspect-ratio': aspectRatio(),
    margin: '0 auto',
    background: 'var(--sk-doc-bg, white)',
    color: 'var(--sk-doc-text, #111)',
    padding: `var(--sk-doc-padding, ${padding()})`,
    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
    'font-family': 'Georgia, "Times New Roman", serif',
    'font-size': '12pt',
    'line-height': '1.6',
    position: 'relative',
    display: 'flex',
    'flex-direction': 'column',
    ...props.style,
  }));

  const headerStyle: JSX.CSSProperties = {
    'margin-bottom': '1em',
    'border-bottom': '1px solid #ccc',
    'padding-bottom': '0.5em',
  };

  const footerStyle: JSX.CSSProperties = {
    'margin-top': 'auto',
    'border-top': '1px solid #ccc',
    'padding-top': '0.5em',
    'font-size': '10pt',
    color: '#666',
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          /* Hide everything except DocumentPage */
          body > *:not(.sk-doc-page-container) {
            display: none !important;
          }

          .sk-doc-page-container {
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
          }

          /* Remove page breaks inside elements */
          h1, h2, h3, h4, h5, h6, p, li {
            page-break-inside: avoid;
          }
        }

        @media screen {
          .sk-doc-page-container {
            margin-bottom: 2rem;
          }
        }
      `}</style>
      <div class="sk-doc-page-container" style={containerStyle()}>
        {props.header !== undefined && <div style={headerStyle}>{props.header}</div>}

        <div style={{ flex: '1' }}>{props.children}</div>

        {(props.footer !== undefined || props.pageNumber !== undefined) && (
          <div style={footerStyle}>
            <div>{props.footer}</div>
            {props.pageNumber !== undefined && <div>Page {props.pageNumber}</div>}
          </div>
        )}
      </div>
    </>
  );
}
