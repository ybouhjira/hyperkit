import { defineStory } from '../src/api'

export const Welcome = defineStory({
  title: 'Welcome',
  category: 'Getting Started',
  render: () => (
    <div
      style={{
        'max-width': '600px',
        margin: '0 auto',
        'font-family': 'var(--sk-font-ui)',
      }}
    >
      <h1
        style={{
          'font-size': '32px',
          'font-weight': '600',
          color: 'var(--sk-text-primary)',
          'margin-bottom': '16px',
        }}
      >
        Welcome to SolidKit Explorer
      </h1>
      <p
        style={{
          'font-size': '16px',
          'line-height': '1.6',
          color: 'var(--sk-text-secondary)',
          'margin-bottom': '24px',
        }}
      >
        SolidKit Explorer is a modern Storybook replacement built specifically for
        SolidJS. It provides an interactive environment for developing and testing UI
        components, services, and algorithms.
      </p>
      <h2
        style={{
          'font-size': '24px',
          'font-weight': '600',
          color: 'var(--sk-text-primary)',
          'margin-bottom': '12px',
          'margin-top': '32px',
        }}
      >
        Features
      </h2>
      <ul
        style={{
          'font-size': '14px',
          'line-height': '1.8',
          color: 'var(--sk-text-secondary)',
          'padding-left': '24px',
        }}
      >
        <li>Interactive component previews with live controls</li>
        <li>Service story testing with action logging</li>
        <li>Algorithm visualization and testing</li>
        <li>Real-time output console</li>
        <li>Searchable story tree navigation</li>
        <li>Dark theme with SolidKit styling</li>
      </ul>
      <h2
        style={{
          'font-size': '24px',
          'font-weight': '600',
          color: 'var(--sk-text-primary)',
          'margin-bottom': '12px',
          'margin-top': '32px',
        }}
      >
        Getting Started
      </h2>
      <p
        style={{
          'font-size': '14px',
          'line-height': '1.6',
          color: 'var(--sk-text-secondary)',
        }}
      >
        Select a story from the sidebar to begin exploring. Try the Button story to see
        interactive controls in action.
      </p>
    </div>
  ),
  controls: {},
})
