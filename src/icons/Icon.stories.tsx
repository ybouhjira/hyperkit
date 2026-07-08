import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal, For } from 'solid-js';
import { Icon } from './Icon';

const meta = {
  title: 'Foundation/Icons',
  component: Icon,
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconCategories = {
  Navigation: [
    'home',
    'arrow-left',
    'arrow-right',
    'chevron-down',
    'chevron-right',
    'chevron-up',
    'menu',
    'more-horizontal',
    'more-vertical',
  ],
  Actions: [
    'plus',
    'close',
    'check',
    'edit',
    'trash',
    'copy',
    'download',
    'upload',
    'search',
    'refresh',
    'external-link',
  ],
  Status: ['info', 'warning', 'error', 'success', 'loading'],
  Content: [
    'file',
    'folder',
    'folder-open',
    'code',
    'terminal',
    'message',
    'image',
    'settings',
    'pin',
    'star',
  ],
  IDE: [
    'play',
    'pause',
    'stop',
    'debug',
    'split',
    'maximize',
    'minimize',
    'panel-left',
    'panel-right',
    'panel-bottom',
  ],
};

export const Gallery: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = createSignal('');

    const filteredCategories = () => {
      const query = searchQuery().toLowerCase();
      if (!query) return iconCategories;

      const filtered: Record<string, string[]> = {};
      Object.entries(iconCategories).forEach(([category, iconNames]) => {
        const matching = iconNames.filter((name) => name.includes(query));
        if (matching.length > 0) {
          filtered[category] = matching;
        }
      });
      return filtered;
    };

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 'margin-bottom': '24px' }}>
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              'font-size': '14px',
              border: '1px solid #ccc',
              'border-radius': '4px',
            }}
          />
        </div>

        <For each={Object.entries(filteredCategories())}>
          {([category, iconNames]) => (
            <div style={{ 'margin-bottom': '32px' }}>
              <h3
                style={{
                  'font-size': '18px',
                  'font-weight': '600',
                  'margin-bottom': '16px',
                  color: '#333',
                }}
              >
                {category}
              </h3>
              <div
                style={{
                  display: 'grid',
                  'grid-template-columns': 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '16px',
                }}
              >
                <For each={iconNames}>
                  {(name) => (
                    <div
                      style={{
                        display: 'flex',
                        'flex-direction': 'column',
                        'align-items': 'center',
                        padding: '16px',
                        border: '1px solid #e5e5e5',
                        'border-radius': '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e5e5';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icon name={name} size="xl" />
                      <span
                        style={{
                          'margin-top': '8px',
                          'font-size': '12px',
                          color: '#666',
                          'text-align': 'center',
                        }}
                      >
                        {name}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>

        {Object.keys(filteredCategories()).length === 0 && (
          <div
            style={{
              padding: '40px',
              'text-align': 'center',
              color: '#999',
            }}
          >
            No icons found matching "{searchQuery()}"
          </div>
        )}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '16px', padding: '20px' }}>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="home" size="xs" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>xs (12px)</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="home" size="sm" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>sm (14px)</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="home" size="md" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>md (16px)</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="home" size="lg" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>lg (20px)</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="home" size="xl" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>xl (24px)</div>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="currentColor" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>currentColor</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="#e74c3c" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>red</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="#3498db" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>blue</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="#2ecc71" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>green</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="#f39c12" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>orange</div>
      </div>
      <div style={{ 'text-align': 'center' }}>
        <Icon name="star" size="xl" color="#9b59b6" />
        <div style={{ 'font-size': '12px', 'margin-top': '8px', color: '#666' }}>purple</div>
      </div>
    </div>
  ),
};
