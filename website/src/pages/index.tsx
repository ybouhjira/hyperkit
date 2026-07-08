import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const FEATURES: {title: string; description: string; to: string}[] = [
  {
    title: 'AI-native by design',
    description:
      'Ships an MCP server, llms.txt docs, and a navigable registry that turns every UI action into a tool an assistant can call.',
    to: '/docs/systems/navigation-framework',
  },
  {
    title: 'Panel system',
    description:
      'IDE-grade resizable split panes with drag-and-drop rearranging, collapsing, and persistable layouts.',
    to: '/docs/systems/panels',
  },
  {
    title: 'Navigation framework',
    description:
      '55+ exports: action dispatch, middleware, undo/redo, transports, persistence, recording and replay.',
    to: '/docs/systems/navigation-framework',
  },
  {
    title: 'Theme system',
    description:
      'Every value flows through --sk-* CSS custom properties. Typed ThemeConfig, built-in presets, sounds, and effects.',
    to: '/docs/systems/theme',
  },
  {
    title: 'Diagram engine',
    description:
      'Framework-agnostic graph core with Dagre and force layouts, SVG rendering, and full SolidJS bindings.',
    to: '/docs/packages/diagram-core',
  },
  {
    title: 'DevTools',
    description:
      'An in-app CSS inspector that identifies components, traces token fallback chains, and maps the component tree.',
    to: '/docs/packages/devtools',
  },
];

const GALLERY: {name: string; category: string}[] = [
  {name: 'ChatWindow', category: 'chat-ai'},
  {name: 'CommandPalette', category: 'utilities'},
  {name: 'FileExplorer', category: 'data'},
  {name: 'KanbanBoard', category: 'data'},
  {name: 'Table', category: 'data'},
  {name: 'ThemeBuilder', category: 'utilities'},
  {name: 'Timeline', category: 'display'},
  {name: 'CodeBlock', category: 'display'},
  {name: 'Markdown', category: 'display'},
  {name: 'Dialog', category: 'navigation'},
  {name: 'Tabs', category: 'navigation'},
  {name: 'Sidebar', category: 'navigation'},
  {name: 'MenuBar', category: 'navigation'},
  {name: 'StatusBar', category: 'navigation'},
  {name: 'MessageInput', category: 'chat-ai'},
  {name: 'ModelSelector', category: 'chat-ai'},
  {name: 'Button', category: 'input'},
  {name: 'Select', category: 'input'},
  {name: 'DateInput', category: 'input'},
  {name: 'TagInput', category: 'input'},
  {name: 'Card', category: 'display'},
  {name: 'ProgressRing', category: 'feedback'},
  {name: 'Toast', category: 'utilities'},
  {name: 'SettingsPanel', category: 'utilities'},
];

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroInstall}>
          <CodeBlock language="bash">npm install @ybouhjira/hyperkit</CodeBlock>
        </div>
        <div className={styles.heroButtons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/installation">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://hyperkit-explorer.vercel.app">
            Live Explorer
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/ybouhjira/hyperkit">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          One package, a whole application platform
        </Heading>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <Link key={feature.title} to={feature.to} className={styles.featureCard}>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const imgBase = useBaseUrl('/img/components/');
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Components for real applications
        </Heading>
        <p className={styles.sectionLead}>
          Chat interfaces, file explorers, kanban boards, command palettes — feature-rich
          composites alongside the everyday primitives, all themed by the same tokens.
        </p>
        <div className={styles.galleryGrid}>
          {GALLERY.map((item) => (
            <Link
              key={item.name}
              to={`/docs/components/${item.category}/${item.name}`}
              className={styles.galleryCard}>
              <img
                src={`${imgBase}${item.name}.webp`}
                alt={`${item.name} component preview`}
                width={240}
                height={160}
                loading="lazy"
              />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <div className={styles.galleryMore}>
          <Link className="button button--outline button--primary" to="/docs/components/">
            Browse all 131 components
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="HyperKit — SolidJS component library"
      description={siteConfig.tagline}>
      <Hero />
      <main>
        <Features />
        <Gallery />
      </main>
    </Layout>
  );
}
