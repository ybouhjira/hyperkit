import { useId, type CSSProperties, type InputHTMLAttributes } from 'react';
import '@ybouhjira/hyperkit-styles/primitives/Input/Input.css';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onInput' | 'size' | 'type'> {
  /** @default 'text' */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'search' | 'password';
  /** Callback with the raw string value (SolidJS-parity API). */
  onInput?: (value: string) => void;
  /** Error message — renders below the field and sets aria-invalid. */
  error?: string;
  className?: string;
  style?: CSSProperties;
}

/** Text input rendering the same `sk-input` contract as the SolidJS package. */
export function Input({ type = 'text', onInput, error, className, style, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="sk-input-wrapper">
      <input
        id={inputId}
        type={type}
        className={`sk-input${error ? ' sk-input--error' : ''}${className ? ` ${className}` : ''}`}
        style={style}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onChange={(e) => onInput?.(e.target.value)}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className="sk-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
