/** Section 03 — token-first theming: the 11 swatches + "28 more" tile. */
import { For } from 'solid-js';
import { EXPLORER_URL } from '../../data/site-links';

interface ThemeSwatch {
  name: string;
  bg: string;
  side: string;
  sideBorder: string;
  bars: { color: string; width: string }[];
}

/* Fixed art values — each swatch is a miniature painting of its preset. */
const THEME_SWATCHES: ThemeSwatch[] = [
  {
    name: 'zed-dark',
    bg: '#0e1419',
    side: '#171d24',
    sideBorder: '#232a33',
    bars: [
      { color: '#2472f2', width: '55%' },
      { color: '#232a33', width: '80%' },
      { color: '#232a33', width: '65%' },
    ],
  },
  {
    name: 'github-dark',
    bg: '#0d1117',
    side: '#010409',
    sideBorder: '#21262d',
    bars: [
      { color: '#f78166', width: '50%' },
      { color: '#21262d', width: '75%' },
      { color: '#21262d', width: '60%' },
    ],
  },
  {
    name: 'macos-light',
    bg: '#f5f5f7',
    side: '#e8e8ed',
    sideBorder: '#d2d2d7',
    bars: [
      { color: '#0071e3', width: '55%' },
      { color: '#d2d2d7', width: '80%' },
      { color: '#d2d2d7', width: '62%' },
    ],
  },
  {
    name: 'ubuntu-dark',
    bg: '#2c2226',
    side: '#3b3036',
    sideBorder: '#4a3d44',
    bars: [
      { color: '#e95420', width: '52%' },
      { color: '#4a3d44', width: '78%' },
      { color: '#4a3d44', width: '64%' },
    ],
  },
  {
    name: 'cyber-max',
    bg: '#07090e',
    side: '#0c1018',
    sideBorder: '#1d2635',
    bars: [
      { color: '#00ffd5', width: '58%' },
      { color: '#ff2d78', width: '40%' },
      { color: '#1d2635', width: '70%' },
    ],
  },
  {
    name: 'neon-studio',
    bg: '#111014',
    side: '#1a1820',
    sideBorder: '#2a2734',
    bars: [
      { color: '#c4ff4d', width: '52%' },
      { color: '#2a2734', width: '82%' },
      { color: '#2a2734', width: '58%' },
    ],
  },
  {
    name: 'ink-mono-dark',
    bg: '#101214',
    side: '#17191c',
    sideBorder: '#26292e',
    bars: [
      { color: '#e6e8ea', width: '48%' },
      { color: '#26292e', width: '76%' },
      { color: '#26292e', width: '60%' },
    ],
  },
  {
    name: 'ink-warm-light',
    bg: '#fbfaf8',
    side: '#f2efe9',
    sideBorder: '#e3ded4',
    bars: [
      { color: '#b3541e', width: '54%' },
      { color: '#e3ded4', width: '78%' },
      { color: '#e3ded4', width: '63%' },
    ],
  },
  {
    name: 'cursor-dark',
    bg: '#1e1e2a',
    side: '#26263a',
    sideBorder: '#35354e',
    bars: [
      { color: '#5e6ad2', width: '56%' },
      { color: '#35354e', width: '80%' },
      { color: '#35354e', width: '61%' },
    ],
  },
  {
    name: 'github-light',
    bg: '#ffffff',
    side: '#f6f8fa',
    sideBorder: '#e7ebef',
    bars: [
      { color: '#0969da', width: '52%' },
      { color: '#e7ebef', width: '79%' },
      { color: '#e7ebef', width: '60%' },
    ],
  },
  {
    name: 'productivity-blue',
    bg: '#1b2229',
    side: '#232c35',
    sideBorder: '#32404d',
    bars: [
      { color: '#4d9de0', width: '55%' },
      { color: '#32404d', width: '81%' },
      { color: '#32404d', width: '59%' },
    ],
  },
];

export function Themes() {
  return (
    <section id="themes">
      <div class="wrap">
        <span class="sec-label">03 — token-first theming</span>
        <h2>
          40 presets. One variable away
          <br />
          from yours.
        </h2>
        <p class="sec-sub">
          Every visual value flows through <code>--sk-*</code> custom properties — enforced by
          HyperKit's own ESLint plugin in CI. Swap a theme, the whole app follows.
        </p>

        <div class="theme-grid">
          <For each={THEME_SWATCHES}>
            {(theme) => (
              <a class="tswatch" href={EXPLORER_URL} target="_blank" rel="noreferrer">
                <span class="tsw-win" style={{ background: theme.bg }}>
                  <span
                    class="tsw-side"
                    style={{
                      background: theme.side,
                      'border-right': `1px solid ${theme.sideBorder}`,
                    }}
                  />
                  <span class="tsw-main">
                    <For each={theme.bars}>
                      {(bar) => <i style={{ background: bar.color, width: bar.width }} />}
                    </For>
                  </span>
                </span>
                <span class="tsw-name">{theme.name}</span>
              </a>
            )}
          </For>
          <a class="tmore" href={EXPLORER_URL} target="_blank" rel="noreferrer">
            + 28 more →
          </a>
        </div>
      </div>
    </section>
  );
}
