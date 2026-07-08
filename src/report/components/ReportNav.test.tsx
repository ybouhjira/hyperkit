import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReportNav, type ReportNavLink } from './ReportNav';

// jsdom does not implement IntersectionObserver — provide a minimal mock
type IntersectionCallback = (entries: { isIntersecting: boolean }[]) => void;
const observerCallbacks: IntersectionCallback[] = [];

let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observerCallbacks.length = 0;
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();

  // Must be a constructor function, not an arrow function
  // @ts-expect-error jsdom polyfill
  global.IntersectionObserver = function (cb: IntersectionCallback) {
    observerCallbacks.push(cb);
    this.observe = observeSpy;
    this.disconnect = disconnectSpy;
    this.unobserve = vi.fn();
  };
});

afterEach(() => {
  // @ts-expect-error cleanup
  delete global.IntersectionObserver;
});

const links: ReportNavLink[] = [
  { id: 'intro', label: 'Introduction' },
  { id: 'features', label: 'Features' },
  { id: 'conclusion', label: 'Conclusion' },
];

describe('ReportNav', () => {
  it('renders the brand name', () => {
    const { getByText } = render(() => <ReportNav brand="SolidKit" links={links} />);
    expect(getByText('SolidKit')).toBeInTheDocument();
  });

  it('renders all nav links', () => {
    const { getByText } = render(() => <ReportNav brand="SolidKit" links={links} />);
    expect(getByText('Introduction')).toBeInTheDocument();
    expect(getByText('Features')).toBeInTheDocument();
    expect(getByText('Conclusion')).toBeInTheDocument();
  });

  it('renders a nav element', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(container.querySelector('nav')?.classList.contains('sk-report-nav')).toBe(true);
  });

  it('marks the active link with the --active modifier class', () => {
    const { getByText } = render(() => (
      <ReportNav brand="SolidKit" links={links} activeId="features" />
    ));
    const activeBtn = getByText('Features').closest('button');
    expect(activeBtn?.classList.contains('sk-report-nav__link--active')).toBe(true);
  });

  it('does not apply --active class to non-active links', () => {
    const { getByText } = render(() => (
      <ReportNav brand="SolidKit" links={links} activeId="features" />
    ));
    const inactiveBtn = getByText('Introduction').closest('button');
    expect(inactiveBtn?.classList.contains('sk-report-nav__link--active')).toBe(false);
  });

  it('does not apply --active class to any link when activeId is undefined', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    const activeLinks = container.querySelectorAll('.sk-report-nav__link--active');
    expect(activeLinks).toHaveLength(0);
  });

  it('calls onLinkClick with link id when a link is clicked', () => {
    const onLinkClick = vi.fn();
    const { getByText } = render(() => (
      <ReportNav brand="SolidKit" links={links} onLinkClick={onLinkClick} />
    ));
    fireEvent.click(getByText('Features'));
    expect(onLinkClick).toHaveBeenCalledWith('features');
  });

  it('calls onLinkClick with the correct id for each link', () => {
    const onLinkClick = vi.fn();
    const { getByText } = render(() => (
      <ReportNav brand="SolidKit" links={links} onLinkClick={onLinkClick} />
    ));
    fireEvent.click(getByText('Introduction'));
    expect(onLinkClick).toHaveBeenCalledWith('intro');

    fireEvent.click(getByText('Conclusion'));
    expect(onLinkClick).toHaveBeenCalledWith('conclusion');
  });

  it('does not throw when onLinkClick is not provided', () => {
    const { getByText } = render(() => <ReportNav brand="SolidKit" links={links} />);
    expect(() => fireEvent.click(getByText('Features'))).not.toThrow();
  });

  it('renders empty nav links when links array is empty', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={[]} />);
    expect(container.querySelectorAll('.sk-report-nav__link')).toHaveLength(0);
  });

  it('starts without the --scrolled modifier class', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    const nav = container.querySelector('nav');
    expect(nav?.classList.contains('sk-report-nav--scrolled')).toBe(false);
  });

  it('adds --scrolled class when sentinel is not intersecting', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    // Simulate scrolling past the sentinel (entry.isIntersecting = false)
    observerCallbacks.forEach((cb) => cb([{ isIntersecting: false }]));
    const nav = container.querySelector('nav');
    expect(nav?.classList.contains('sk-report-nav--scrolled')).toBe(true);
  });

  it('removes --scrolled class when sentinel becomes visible again', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    // Scroll down, then back up
    observerCallbacks.forEach((cb) => cb([{ isIntersecting: false }]));
    observerCallbacks.forEach((cb) => cb([{ isIntersecting: true }]));
    const nav = container.querySelector('nav');
    expect(nav?.classList.contains('sk-report-nav--scrolled')).toBe(false);
  });

  it('attaches IntersectionObserver on mount', () => {
    render(() => <ReportNav brand="SolidKit" links={links} />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it('renders brand in its own element', () => {
    const { container } = render(() => <ReportNav brand="MyBrand" links={links} />);
    const brand = container.querySelector('.sk-report-nav__brand');
    expect(brand).toBeInTheDocument();
    expect(brand?.textContent).toBe('MyBrand');
  });

  it('renders links inside the nav links container', () => {
    const { container } = render(() => <ReportNav brand="SolidKit" links={links} />);
    const linksContainer = container.querySelector('.sk-report-nav__links');
    expect(linksContainer).toBeInTheDocument();
    expect(linksContainer?.querySelectorAll('.sk-report-nav__link')).toHaveLength(3);
  });
});
