import { Label } from 'radix-ui';
import { useId, type ReactNode, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * A labelled form field with its error and hint wired up.
 *
 * The wiring is the whole point, and it is what hand-rolled fields get wrong:
 *
 *   - the label's `htmlFor` matches the input's `id`, so clicking the label
 *     focuses the input and a screen reader announces the two together
 *   - `aria-describedby` points at the hint *and* the error, so both are read
 *     rather than only whichever was remembered
 *   - `aria-invalid` marks the field itself, so the error is not carried by
 *     colour alone — which is invisible to a screen reader and to anyone who
 *     cannot distinguish red from grey
 *   - the error has `role="alert"`, so it is announced when it appears rather
 *     than only when the field is next focused
 *
 * `useId` rather than a caller-supplied id: ids must be unique per document,
 * and a form rendered twice on a page is exactly when hard-coded ones collide.
 */
export type FieldProps = {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-invalid'>;

export function Field({ label, hint, error, className, ...input }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={cn('h3-field', className)}>
      <Label.Root htmlFor={id}>{label}</Label.Root>
      <input
        {...input}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {hint ? (
        <p id={hintId} className="h3-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="h3-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
