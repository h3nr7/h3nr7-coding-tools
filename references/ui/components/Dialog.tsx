import { Dialog as RadixDialog, VisuallyHidden } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * A modal dialog, and the site's mobile navigation drawer.
 *
 * Radix supplies the parts that are tedious to get right and invisible when
 * wrong: focus is trapped while open and restored to the trigger on close, the
 * page behind is inert to screen readers, Escape closes, and scroll is locked.
 *
 * The one thing Radix cannot supply is a title, and it warns loudly without
 * one — so `title` is required here, with `hideTitle` for the case where the
 * design has no visible heading but assistive technology still needs one. That
 * is the usual reason a dialog ships with no accessible name at all.
 */
export type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Announced to assistive technology, and shown unless `hideTitle`. */
  title: string;
  description?: string;
  hideTitle?: boolean;
  trigger?: ReactNode;
  /**
   * Drop the "×" close button.
   *
   * Off by default: a modal a keyboard user can open but not close without
   * knowing about Escape is a trap, so most consumers keep it. The exception
   * is a `trigger` that is itself a toggle — `Navi`'s menu button, with
   * `aria-expanded` already reporting open/closed — where a second close
   * affordance is redundant with the first and Escape still closes either way.
   */
  hideClose?: boolean;
  /**
   * Where focus goes when the dialog closes.
   *
   * **Needed by any dialog opened without a `trigger`, and the reason is not
   * obvious.** A modal Radix dialog does not restore focus to wherever it came
   * from; it restores focus to its TRIGGER, unconditionally — internally it
   * calls `event.preventDefault()` on the unmount-autofocus event and then
   * `triggerRef.current?.focus()`. A controlled dialog with no `trigger`
   * rendered has a null ref there, so that call does nothing and focus lands on
   * `document.body`. The keyboard user who opened it is returned to the top of
   * the page.
   *
   * Radix composes this handler BEFORE its own and skips its own if this one
   * prevents default, so the shape that works is
   * `(event) => { event.preventDefault(); somewhere.focus(); }`.
   *
   * Left undefined, Radix's trigger behaviour is untouched — which is correct
   * for every dialog that has one.
   */
  onCloseAutoFocus?: (event: Event) => void;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  trigger,
  hideClose,
  onCloseAutoFocus,
  children,
  className,
}: DialogProps) {
  const heading = <RadixDialog.Title>{title}</RadixDialog.Title>;

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      ) : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="h3-dialog-overlay" />
        <RadixDialog.Content
          className={cn('h3-dialog', className)}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          {hideTitle ? <VisuallyHidden.Root>{heading}</VisuallyHidden.Root> : heading}
          {description ? (
            <RadixDialog.Description>{description}</RadixDialog.Description>
          ) : null}
          {children}
          {hideClose ? null : (
            <RadixDialog.Close aria-label="Close" className="h3-dialog-close">
              ×
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const DialogClose = RadixDialog.Close;
