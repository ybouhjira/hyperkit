import { type Component, splitProps } from 'solid-js';
import './Input.css';

export interface InputProps {
  /** Input type variant.
   * @default 'text' */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'search' | 'password';
  /** Placeholder text displayed when input is empty. */
  placeholder?: string;
  /** Current input value. */
  value?: string;
  /** Callback fired when input value changes. */
  onInput?: (value: string) => void;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Error message displayed below the input. */
  error?: string;
  /** Additional CSS class name. */
  class?: string;
  /** Input element ID for label association. */
  id?: string;
  /** Input element name for form submission. */
  name?: string;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Text input component with built-in error display and accessibility features.
 *
 * @example
 * ```tsx
 * import { Input, Stack, Button } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Controlled input with validation
 * const [email, setEmail] = createSignal("");
 * const [error, setError] = createSignal<string | undefined>();
 * const validate = () => {
 *   setError(!email().includes("@") ? "Enter a valid email address" : undefined);
 * };
 * <Input
 *   type="email"
 *   placeholder="you@company.com"
 *   value={email()}
 *   onInput={setEmail}
 *   error={error()}
 *   id="email"
 * />
 *
 * // Password input in a login form
 * <Stack gap="md">
 *   <Input type="text" placeholder="Username" name="username" />
 *   <Input type="password" placeholder="Password" name="password" />
 *   <Button type="submit" fullWidth>Log In</Button>
 * </Stack>
 * ```
 *
 * @see SearchInput - for search-specific input with icon and clear button
 * @see NumberInput - for numeric input with increment/decrement buttons
 */
export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'type',
    'placeholder',
    'value',
    'onInput',
    'disabled',
    'error',
    'class',
    'id',
    'name',
    'unstyled',
  ]);

  return (
    <div class={local.unstyled ? (local.class ?? '') : 'sk-input-wrapper'}>
      <input
        type={local.type ?? 'text'}
        placeholder={local.placeholder}
        value={local.value ?? ''}
        onInput={(e) => local.onInput?.(e.currentTarget.value)}
        disabled={local.disabled}
        id={local.id}
        name={local.name}
        class={
          local.unstyled
            ? ''
            : `sk-input${local.error ? ' sk-input--error' : ''} ${local.class ?? ''}`
        }
        aria-invalid={local.error ? true : undefined}
        aria-describedby={local.error ? `${local.id}-error` : undefined}
        {...others}
      />
      {local.error && (
        <span id={`${local.id}-error`} class={local.unstyled ? '' : 'sk-input__error'} role="alert">
          {local.error}
        </span>
      )}
    </div>
  );
};
