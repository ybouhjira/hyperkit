import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  createEffect,
  onCleanup,
} from 'solid-js';
import '@ybouhjira/hyperkit-styles/fx/TypewriterText/TypewriterText.css';

export interface TypewriterTextProps {
  /** Text to type */
  text: string;
  /** Typing speed (ms per character) */
  speed?: number;
  /** Delay before starting (ms) */
  delay?: number;
  /** Show blinking cursor */
  cursor?: boolean;
  /** Cursor character */
  cursorChar?: string;
  /** Loop the animation */
  loop?: boolean;
  /** Pause between loops (ms) */
  loopDelay?: number;
  /** Delete speed (ms per char) */
  deleteSpeed?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  class?: string;
  style?: JSX.CSSProperties;
}

type TypewriterPhase = 'typing' | 'pausing' | 'deleting' | 'waiting';

/**
 * TypewriterText — Text that appears character by character with optional looping.
 *
 * @example
 * ```tsx
 * <TypewriterText text="Hello, World!" speed={60} cursor loop />
 * ```
 */
export const TypewriterText: Component<TypewriterTextProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'text',
    'speed',
    'delay',
    'cursor',
    'cursorChar',
    'loop',
    'loopDelay',
    'deleteSpeed',
    'onComplete',
    'class',
    'style',
  ]);

  const speed = () => local.speed ?? 50;
  const delay = () => local.delay ?? 0;
  const showCursor = () => local.cursor ?? true;
  const cursorChar = () => local.cursorChar ?? '|';
  const loop = () => local.loop ?? false;
  const loopDelay = () => local.loopDelay ?? 1000;
  const deleteSpeed = () => local.deleteSpeed ?? 30;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [displayed, setDisplayed] = createSignal('');
  const [phase, setPhase] = createSignal<TypewriterPhase>('waiting');

  let timerId: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const startTyping = (text: string, currentLen: number) => {
    if (currentLen < text.length) {
      setPhase('typing');
      timerId = setTimeout(() => {
        const nextLen = currentLen + 1;
        setDisplayed(text.slice(0, nextLen));
        startTyping(text, nextLen);
      }, speed());
    } else {
      // Done typing
      local.onComplete?.();
      if (loop()) {
        setPhase('pausing');
        timerId = setTimeout(() => {
          startDeleting(text, text.length);
        }, loopDelay());
      } else {
        setPhase('waiting');
      }
    }
  };

  const startDeleting = (text: string, currentLen: number) => {
    if (currentLen > 0) {
      setPhase('deleting');
      timerId = setTimeout(() => {
        const nextLen = currentLen - 1;
        setDisplayed(text.slice(0, nextLen));
        startDeleting(text, nextLen);
      }, deleteSpeed());
    } else {
      setPhase('waiting');
      // Brief pause before restarting
      timerId = setTimeout(() => {
        startTyping(text, 0);
      }, deleteSpeed() * 3);
    }
  };

  createEffect(() => {
    const text = local.text;
    clearTimer();

    if (prefersReducedMotion) {
      setDisplayed(text);
      setPhase('waiting');
      local.onComplete?.();
      return;
    }

    setDisplayed('');
    setPhase('waiting');

    timerId = setTimeout(() => {
      startTyping(text, 0);
    }, delay());
  });

  onCleanup(() => {
    clearTimer();
  });

  const classes = () =>
    [
      'sk-typewriter',
      showCursor() && 'sk-typewriter--cursor',
      phase() === 'typing' && 'sk-typewriter--typing',
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <span class={classes()} style={local.style} aria-label={local.text} {...rest}>
      <span class="sk-typewriter__text" aria-hidden="true">
        {displayed()}
      </span>
      {showCursor() && (
        <span class="sk-typewriter__cursor" aria-hidden="true">
          {cursorChar()}
        </span>
      )}
    </span>
  );
};
