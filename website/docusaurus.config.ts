import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Deployment target. Defaults to GitHub Pages (project site).
 * For a custom domain, set:
 *   DOCS_URL=https://hyperkit.dev DOCS_BASE_URL=/ npm run build
 */
const url = process.env.DOCS_URL ?? 'https://ybouhjira.github.io';
const baseUrl = process.env.DOCS_BASE_URL ?? '/hyperkit/';

const config: Config = {
  title: 'HyperKit',
  tagline: '133+ SolidJS components with Effect services and CSS token theming',
  favicon: 'img/favicon.svg',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url,
  baseUrl,

  // GitHub pages deployment config.
  organizationName: 'ybouhjira',
  projectName: 'hyperkit',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    // .md files are CommonMark, .mdx files are MDX.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ybouhjira/hyperkit/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'HyperKit',
      logo: {
        alt: 'HyperKit logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/components/',
          label: 'Components',
          position: 'left',
        },
        {
          href: 'https://hyperkit-explorer.vercel.app',
          label: 'Explorer',
          position: 'right',
        },
        {
          href: 'https://github.com/ybouhjira/hyperkit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'Components',
              to: '/docs/components/',
            },
            {
              label: 'Guides',
              to: '/docs/guides/ssr',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/ybouhjira/hyperkit/issues',
            },
            {
              label: 'Live Explorer',
              href: 'https://hyperkit-explorer.vercel.app',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm Package',
              href: 'https://www.npmjs.com/package/@ybouhjira/hyperkit',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ybouhjira/hyperkit',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} HyperKit contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'tsx', 'css', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
