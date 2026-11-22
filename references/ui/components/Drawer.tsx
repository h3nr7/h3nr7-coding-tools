import { Dialog as RadixDialog, VisuallyHidden } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * A panel on the edge of the screen: the brain chat's, on every public page.
 *
 * Radix's `Dialog`, as `Dialog` is, with the one thing that one cannot do: be
 * **non-modal**. With `modal={false}` the page stays live behind it, so a reader
 * can scroll it, click its links and use the corner row while the panel is
 * open; Escape still closes, and a press outside does not, because the panel is
 * meant to stay beside the page while the reader uses it. With `modal`, the
 * usual dialog: focus trapped, scroll locked, the page inert to assistive
 * technology. The consumer chooses per width (design: the brain chat §11).
 *
 * Not the shadcn `Sheet`, which is the console's (its slide utilities need
 * `tw-animate-css`, which the public stylesheet does not load), and not the
 * site's `Dialog`, whose `.h3-dialog` rule centres a box with a transform. Its
 * own stable classes, `h3-drawer` and `h3-drawer-close`, which the app styles
 * with complete rules: like every Radix portal, this lands in `document.body`,
 * outside every page scope.
 *
 * No trigger: the button that opens it sits in the site's corner row, outside
 * this component, so it is always controlled, and `onCloseAutoFocus` is how
 * focus gets back to that button (see the note on `Dialog`'s).
 */
export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Trap focus and make the page inert, or leave the page live beside it. */
  modal: boolean;
  /** Announced to assistive technology, and shown unless `hideTitle`. */
  title: string;
  hideTitle?: boolean;
  description?: string;
  /** The close control's accessible name. */
  closeLabel?: string;
  /**
   * Leave out the close control, when something else on screen closes it (the
   * brain's trigger in the corner row, on desktop). Escape still closes.
   */
  hideClose?: boolean;
  /**
   * Where focus goes on open. Radix's default is the first focusable element,
   * which in a chat is the close button rather than the box a reader types in.
   */
  onOpenAutoFocus?: (event: Event) => void;
  /** Where focus goes on close: prevent the default, then focus the opener. */
  onCloseAutoFocus?: (event: Event) => void;
  children: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  modal,
  title,
  hideTitle,
  description,
  closeLabel = 'Close',
  hideClose,
  onOpenAutoFocus,
  onCloseAutoFocus,
  children,
  className,
}: DrawerProps) {
  const heading = <RadixDialog.Title className="h3-drawer-title">{title}</RadixDialog.Title>;

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <RadixDialog.Portal>
        <RadixDialog.Content
          className={cn('h3-drawer', className)}
          data-modal={modal ? 'true' : 'false'}
          // No description is fine; saying so keeps Radix from warning.
          {...(description ? {} : { 'aria-describedby': undefined })}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          /*
           * Non-modal: a press or focus outside leaves it open. The panel is
           * there to be used beside the page, and a click on the page is the
           * reader using it, not dismissing this. Modal, Radix's own rule
           * stands (there is nothing outside to press but the panel covers
           * the screen anyway).
           */
          onInteractOutside={modal ? undefined : (event) => event.preventDefault()}
        >
          <div className="h3-drawer-header">
            {hideTitle ? <VisuallyHidden.Root>{heading}</VisuallyHidden.Root> : heading}
            {hideClose ? null : (
              <RadixDialog.Close aria-label={closeLabel} title={closeLabel} className="h3-drawer-close">
                ×
              </RadixDialog.Close>
            )}
          </div>
          {description ? (
            <RadixDialog.Description className="h3-drawer-description">
              {description}
            </RadixDialog.Description>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
