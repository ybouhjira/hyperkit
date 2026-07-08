import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Report } from './Report';
import type { ReportSchema } from './types';

// IntersectionObserver is not available in jsdom
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const minimalSchema: ReportSchema = {
  title: 'Test Report',
  sections: [],
};

const interactiveSchema: ReportSchema = {
  title: 'Interactive Report',
  sections: [
    {
      id: 'choices',
      title: 'Make Choices',
      content: [
        {
          type: 'decision-grid',
          id: 'arch',
          label: 'Pick Architecture',
          options: [
            { id: 'monolith', label: 'Monolith' },
            { id: 'micro', label: 'Microservices' },
          ],
        },
        {
          type: 'poll',
          id: 'satisfaction',
          label: 'Satisfaction',
          options: [
            { id: 'happy', label: 'Happy' },
            { id: 'neutral', label: 'Neutral' },
          ],
        },
        {
          type: 'form-fields',
          id: 'details',
          label: 'Details',
          fields: [{ type: 'text', id: 'name', label: 'Name' }],
        },
      ],
    },
  ],
};

describe('Report', () => {
  it('renders without errors in default mode', () => {
    const { container } = render(() => <Report schema={minimalSchema} />);
    expect(container.querySelector('.sk-report')).toBeInTheDocument();
  });

  it('renders with embedded prop and has sk-report--embedded class', () => {
    const { container } = render(() => <Report schema={minimalSchema} embedded />);
    expect(container.querySelector('.sk-report--embedded')).toBeInTheDocument();
  });

  it('does not have sk-report--embedded class when embedded prop is not set', () => {
    const { container } = render(() => <Report schema={minimalSchema} />);
    expect(container.querySelector('.sk-report--embedded')).not.toBeInTheDocument();
  });

  describe('interactive content', () => {
    it('shows submit button when onSubmit is provided and schema has interactive content', () => {
      const { container } = render(() => <Report schema={interactiveSchema} onSubmit={() => {}} />);
      expect(container.querySelector('.sk-report-submit__btn')).toBeInTheDocument();
    });

    it('does not show submit button when onSubmit is not provided', () => {
      const { container } = render(() => <Report schema={interactiveSchema} />);
      expect(container.querySelector('.sk-report-submit__btn')).not.toBeInTheDocument();
    });

    it('does not show submit button when schema has no interactive content', () => {
      const { container } = render(() => <Report schema={minimalSchema} onSubmit={() => {}} />);
      expect(container.querySelector('.sk-report-submit__btn')).not.toBeInTheDocument();
    });

    it('clicking submit calls onSubmit with collected responses', () => {
      const onSubmit = vi.fn();
      const { container, getByText } = render(() => (
        <Report schema={interactiveSchema} onSubmit={onSubmit} />
      ));

      // Select a decision-grid option
      const monolithBtn = getByText('Monolith').closest('button')!;
      fireEvent.click(monolithBtn);

      // Submit
      const submitBtn = container.querySelector('.sk-report-submit__btn') as HTMLButtonElement;
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledOnce();
      const [responses] = onSubmit.mock.calls[0] as [Record<string, unknown>];
      expect(responses['arch']).toEqual(['monolith']);
    });

    it('renders decision-grid content type', () => {
      const { getByText } = render(() => <Report schema={interactiveSchema} onSubmit={() => {}} />);
      expect(getByText('Pick Architecture')).toBeInTheDocument();
      expect(getByText('Monolith')).toBeInTheDocument();
    });

    it('renders poll content type', () => {
      const { getByText } = render(() => <Report schema={interactiveSchema} onSubmit={() => {}} />);
      expect(getByText('Satisfaction')).toBeInTheDocument();
      expect(getByText('Happy')).toBeInTheDocument();
    });

    it('renders form-fields content type', () => {
      const { getByLabelText } = render(() => (
        <Report schema={interactiveSchema} onSubmit={() => {}} />
      ));
      expect(getByLabelText(/Name/)).toBeInTheDocument();
    });
  });

  describe('section content types', () => {
    it('renders summary-grid content', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'sec',
            title: 'Summary',
            content: [
              {
                type: 'summary-grid',
                items: [
                  { icon: '🚀', title: 'Feature', description: 'A feature' },
                  { icon: '🐛', title: 'Bug', description: 'A bug fix' },
                ],
              },
            ],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Feature')).toBeInTheDocument();
      expect(getByText('Bug')).toBeInTheDocument();
    });

    it('renders table content', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'tbl',
            title: 'Table Section',
            content: [
              {
                type: 'table',
                columns: [
                  { key: 'name', label: 'Name' },
                  { key: 'value', label: 'Value' },
                ],
                rows: [{ name: 'Alpha', value: '100' }],
              },
            ],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Alpha')).toBeInTheDocument();
    });

    it('renders code content', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'code-sec',
            title: 'Code Section',
            content: [
              {
                type: 'code',
                code: 'const x = 1;',
                language: 'typescript',
                label: 'Example',
              },
            ],
          },
        ],
      };
      const { container } = render(() => <Report schema={schema} />);
      // CodeBlock wraps in .sk-code-block
      const codeBlock = container.querySelector('.sk-code-block');
      expect(codeBlock).toBeInTheDocument();
    });

    it('renders text content (plain)', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'text-sec',
            title: 'Text',
            content: [{ type: 'text', content: 'Hello world' }],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Hello world')).toBeInTheDocument();
    });

    it('renders text content with html=true', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'html-sec',
            title: 'HTML',
            content: [{ type: 'text', content: '<strong>Bold text</strong>', html: true }],
          },
        ],
      };
      const { container } = render(() => <Report schema={schema} />);
      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('Bold text');
    });

    it('renders timeline content', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'timeline-sec',
            title: 'Timeline',
            content: [
              {
                type: 'timeline',
                steps: [
                  { title: 'Step 1', description: 'First step', status: 'completed' },
                  { title: 'Step 2', description: 'Second step', status: 'active' },
                ],
              },
            ],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Step 1')).toBeInTheDocument();
      expect(getByText('Step 2')).toBeInTheDocument();
    });

    it('renders issue-list content', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'issues',
            title: 'Issues',
            content: [
              {
                type: 'issue-list',
                issues: [{ icon: '🔥', title: 'Critical bug', description: 'Something broke' }],
              },
            ],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Critical bug')).toBeInTheDocument();
      expect(getByText('Something broke')).toBeInTheDocument();
    });
  });

  describe('schema features', () => {
    it('renders score card when schema has score', () => {
      const schema: ReportSchema = {
        title: 'Test',
        score: {
          value: 85,
          label: 'Health',
          description: 'Overall score',
        },
        sections: [],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Health')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      const schema: ReportSchema = {
        title: 'Test',
        footer: 'Generated by SolidKit',
        sections: [],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Generated by SolidKit')).toBeInTheDocument();
    });

    it('renders subtitle and badge', () => {
      const schema: ReportSchema = {
        title: 'Report Title',
        subtitle: 'A subtitle',
        badge: 'v2.0',
        sections: [],
      };
      const { container } = render(() => <Report schema={schema} />);
      // Title in hero h1
      const heroTitle = container.querySelector('.sk-report-hero__title');
      expect(heroTitle?.textContent).toBe('Report Title');
      // Subtitle and badge rendered in hero
      const hero = container.querySelector('.sk-report-hero');
      expect(hero?.textContent).toContain('A subtitle');
      expect(hero?.textContent).toContain('v2.0');
    });

    it('renders meta items in hero', () => {
      const schema: ReportSchema = {
        title: 'Test',
        meta: [{ label: 'Author', icon: '👤' }],
        sections: [],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('Author')).toBeInTheDocument();
    });

    it('renders brand in nav when provided', () => {
      const schema: ReportSchema = {
        title: 'Test',
        brand: 'MyBrand',
        sections: [{ id: 's1', title: 'Section 1', content: [] }],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('MyBrand')).toBeInTheDocument();
    });

    it('uses title as nav brand when brand not provided', () => {
      const schema: ReportSchema = {
        title: 'FallbackTitle',
        sections: [{ id: 's1', title: 'Section 1', content: [] }],
      };
      const { container } = render(() => <Report schema={schema} />);
      const navBrand = container.querySelector('.sk-report-nav__brand');
      expect(navBrand?.textContent).toBe('FallbackTitle');
    });

    it('renders section description', () => {
      const schema: ReportSchema = {
        title: 'Test',
        sections: [
          {
            id: 'desc-sec',
            title: 'Described',
            description: 'This section has a description',
            content: [],
          },
        ],
      };
      const { getByText } = render(() => <Report schema={schema} />);
      expect(getByText('This section has a description')).toBeInTheDocument();
    });

    it('applies custom class', () => {
      const { container } = render(() => <Report schema={minimalSchema} class="custom-report" />);
      const shell = container.querySelector('.sk-report');
      expect(shell?.className).toContain('custom-report');
    });

    it('renders with empty sections array', () => {
      const schema: ReportSchema = {
        title: 'Empty',
        sections: [],
      };
      const { container } = render(() => <Report schema={schema} />);
      expect(container.querySelector('.sk-report')).toBeInTheDocument();
    });

    it('renders multiple sections', () => {
      const schema: ReportSchema = {
        title: 'Multi',
        sections: [
          { id: 'a', title: 'Section A', content: [{ type: 'text', content: 'Text A' }] },
          { id: 'b', title: 'Section B', content: [{ type: 'text', content: 'Text B' }] },
        ],
      };
      const { container, getAllByText } = render(() => <Report schema={schema} />);
      // Section titles appear in nav links AND section headings (2 each)
      expect(getAllByText('Section A').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Section B').length).toBeGreaterThanOrEqual(1);
      // Text content appears once each
      const sections = container.querySelectorAll('.sk-report-section');
      expect(sections.length).toBe(2);
    });
  });
});
