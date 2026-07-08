import { createSignal, For } from 'solid-js';
import { Text, Flex, Stack, Badge, Button, useTheme } from '@ybouhjira/hyperkit';
import '../src/styles.css';

import { HeroDemo } from './tabs/HeroDemo';
import { SchemaBuilder } from './tabs/SchemaBuilder';
import { ShapeGallery } from './tabs/ShapeGallery';
import { IntentDemo } from './tabs/IntentDemo';
import { ThemePlayground } from './tabs/ThemePlayground';
import { CodeOutput } from './tabs/CodeOutput';
import { AdvancedFeatures } from './tabs/AdvancedFeatures';
import { activePreset } from './helpers/state';

const TABS = [
  { id: 'hero', label: 'Try It', component: HeroDemo },
  { id: 'schema', label: 'Schema Builder', component: SchemaBuilder },
  { id: 'shapes', label: 'Shape Gallery', component: ShapeGallery },
  { id: 'intent', label: 'Intent & Interaction', component: IntentDemo },
  { id: 'theme', label: 'Theme Playground', component: ThemePlayground },
  { id: 'code', label: 'Code Output', component: CodeOutput },
  { id: 'advanced', label: 'Advanced Features', component: AdvancedFeatures },
] as const;

export const App = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = createSignal<string>('hero');

  const ActiveComponent = () => {
    const tab = TABS.find(t => t.id === activeTab());
    if (!tab) return null;
    const Comp = tab.component;

    // Pass callback to HeroDemo to switch to schema tab
    if (tab.id === 'hero') {
      return <Comp onExploreClick={() => setActiveTab('schema')} />;
    }

    return <Comp />;
  };

  // Theme presets for the top bar
  const DEMO_THEMES = [
    { id: 'github-light', label: 'GitHub Light' },
    { id: 'github-dark', label: 'GitHub Dark' },
    { id: 'zed-dark', label: 'Zed Dark' },
    { id: 'linear', label: 'Linear' },
    { id: 'material-light', label: 'Material Light' },
    { id: 'ocean', label: 'Ocean' },
  ];

  return (
    <div style={{
      'min-height': '100vh',
      background: 'var(--sk-bg-primary)',
      color: 'var(--sk-text-primary)',
      'font-family': 'var(--sk-font-ui)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        'border-bottom': '1px solid var(--sk-border)',
        background: 'var(--sk-bg-secondary)',
      }}>
        <Stack gap="md" style={{ 'max-width': '1400px', margin: '0 auto' }}>
          <Flex justify="between" align="center">
            <Flex gap="md" align="center">
              <Text as="h1" size="xl" weight="bold" style={{
                background: 'linear-gradient(135deg, #e94560, var(--sk-accent))',
                '-webkit-background-clip': 'text',
                '-webkit-text-fill-color': 'transparent',
                'background-clip': 'text',
              }}>
                hyperkit-views
              </Text>
              <Badge variant="info">Interactive Demo</Badge>
              <Badge variant="default" style={{ 'text-transform': 'capitalize' }}>
                {activePreset()}
              </Badge>
            </Flex>

            {/* Theme switcher */}
            <Flex gap="xs" style={{ 'flex-wrap': 'wrap' }}>
              <For each={DEMO_THEMES}>
                {(t) => (
                  <Button
                    variant={theme().id === t.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(t.id)}
                  >
                    {t.label}
                  </Button>
                )}
              </For>
            </Flex>
          </Flex>

          {/* Tab navigation */}
          <Flex gap="xs" style={{ 'overflow-x': 'auto' }}>
            <For each={TABS}>
              {(tab) => (
                <Button
                  variant={activeTab() === tab.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              )}
            </For>
          </Flex>
        </Stack>
      </div>

      {/* Tab content */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
};
