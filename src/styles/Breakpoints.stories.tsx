import { For } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { useBreakpoint } from '../hooks/useBreakpoint';
import type { Breakpoint } from '../hooks/useBreakpoint';

const BREAKPOINTS: Record<Breakpoint, number> = {
  phone: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
  tv: 1920,
};

const BREAKPOINT_COLORS: Record<Breakpoint, string> = {
  phone: '#ef4444',
  tablet: '#f59e0b',
  desktop: '#10b981',
  wide: '#3b82f6',
  tv: '#8b5cf6',
};

function BreakpointDemo() {
  const breakpoint = useBreakpoint();

  return (
    <div
      style={{
        padding: '2rem',
        'font-family': 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          'background-color': BREAKPOINT_COLORS[breakpoint()],
          color: 'white',
          padding: '3rem',
          'border-radius': '12px',
          'text-align': 'center',
          'margin-bottom': '2rem',
          'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            margin: '0 0 1rem 0',
            'font-size': '3rem',
            'font-weight': 'bold',
            'text-transform': 'uppercase',
            'letter-spacing': '0.1em',
          }}
        >
          {breakpoint()}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, 'font-size': '1.125rem' }}>Current Breakpoint</p>
      </div>

      <div
        style={{
          'background-color': '#ffffff',
          border: '1px solid #e5e7eb',
          'border-radius': '8px',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            'border-collapse': 'collapse',
          }}
        >
          <thead>
            <tr style={{ 'background-color': '#f9fafb' }}>
              <th
                style={{
                  padding: '1rem',
                  'text-align': 'left',
                  'font-weight': '600',
                  'font-size': '0.875rem',
                  color: '#6b7280',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.05em',
                }}
              >
                Breakpoint
              </th>
              <th
                style={{
                  padding: '1rem',
                  'text-align': 'left',
                  'font-weight': '600',
                  'font-size': '0.875rem',
                  color: '#6b7280',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.05em',
                }}
              >
                Min Width
              </th>
              <th
                style={{
                  padding: '1rem',
                  'text-align': 'center',
                  'font-weight': '600',
                  'font-size': '0.875rem',
                  color: '#6b7280',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.05em',
                }}
              >
                Active
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={['phone', 'tablet', 'desktop', 'wide', 'tv'] as Breakpoint[]}>
              {(bp) => (
                <tr
                  style={{
                    'border-top': '1px solid #e5e7eb',
                    'background-color': breakpoint() === bp ? '#f0fdf4' : 'transparent',
                  }}
                >
                  <td
                    style={{
                      padding: '1rem',
                      'font-weight': breakpoint() === bp ? '600' : '400',
                    }}
                  >
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          'border-radius': '50%',
                          'background-color': BREAKPOINT_COLORS[bp],
                        }}
                      />
                      {bp}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      color: '#6b7280',
                      'font-family': 'monospace',
                    }}
                  >
                    {BREAKPOINTS[bp]}px
                  </td>
                  <td style={{ padding: '1rem', 'text-align': 'center' }}>
                    {breakpoint() === bp && (
                      <span
                        style={{
                          display: 'inline-block',
                          'background-color': '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          'border-radius': '9999px',
                          'font-size': '0.75rem',
                          'font-weight': '600',
                          'text-transform': 'uppercase',
                          'letter-spacing': '0.05em',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <div
        style={{
          'margin-top': '2rem',
          padding: '1.5rem',
          'background-color': '#f9fafb',
          'border-radius': '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3
          style={{
            margin: '0 0 0.5rem 0',
            'font-size': '1rem',
            'font-weight': '600',
            color: '#111827',
          }}
        >
          Try It Out
        </h3>
        <p style={{ margin: 0, color: '#6b7280', 'font-size': '0.875rem' }}>
          Resize your browser window to see the breakpoint change in real-time. The colored box
          above will update to show the current breakpoint.
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundation/Breakpoints',
  component: BreakpointDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof BreakpointDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
