import { Popover as RadixPopover } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * The shadcn popover, on this site's tokens.
 *
 * Structure and API are shadcn's, unchanged — `Popover`, `PopoverTrigger`,
 * `PopoverContent` — so anything written against the upstream docs works here.
 * The classes are upstream's, verbatim, including `bg-popover` and
 * `border` — those are real utilities here because `tokens.css` defines
 * shadcn's semantic names as aliases of this site's role tokens, and `app.css`
 * registers them with Tailwind. That indirection is the point: the next shadcn
 * component can be pasted in unedited.
 *
 * A popover rather than a dropdown menu, and the difference is not cosmetic. A
 * menu implies menu semantics: `role="menu"`, items that are `menuitem`s,
 * roving focus and typeahead, and a strong convention that selecting something
 * closes it. What this holds is a settings panel with a switch in it — a switch
 * inside a `menuitem` is two focusable things describing one setting, and a
 * screen reader reads it as exactly that. A popover is just a labelled region
 * that happens to float, so ordinary controls behave ordinarily inside it.
 *
 * Imported from the unified `radix-ui` package rather than
 * `@radix-ui/react-popover`, matching `dialog.tsx` — one dependency for every
 * primitive rather than one per component.
 *
 * Radix supplies the parts that are tedious and invisible when wrong: focus
 * moves in and back to the trigger, Escape and an outside press close it, it is
 * positioned against the viewport rather than off the edge of it, and the
 * content stays mounted while a `data-[state=closed]` animation runs — which is
 * why nothing here needs a timer to know when it has finished leaving.
 */

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'h3-popover',
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground',
          'shadow-md outline-none',
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
}
