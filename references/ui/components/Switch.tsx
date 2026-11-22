import { Switch as RadixSwitch } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * The shadcn switch, on this site's tokens.
 *
 * The classes are upstream's, verbatim. `bg-primary`, `bg-input` and
 * `bg-background` are real utilities here because `tokens.css` defines
 * shadcn's semantic names as aliases of this site's role tokens.
 *
 * A real `Switch` rather than a styled checkbox: Radix gives it
 * `role="switch"` with `aria-checked`, which is what a screen reader needs to
 * announce "on"/"off" instead of "checked"/"unchecked" — the right words for a
 * setting that takes effect immediately rather than one that is submitted.
 *
 * The label is the caller's job. A switch with no accessible name is the
 * commonest way this component ships broken, so pair it with a `<label>` or
 * pass `aria-labelledby`.
 *
 * ## Where this is not upstream
 *
 * **No focus ring of its own.** shadcn's `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
 * is dropped. `tokens.css` already draws a focus ring on every `button` on the
 * site, and says in its own comment that the rule exists precisely so no
 * component has to repeat it. Keeping both did not produce a slightly heavier
 * ring — it produced two, an outline and a box-shadow, concentric and a couple
 * of pixels apart in the same blue.
 *
 * So: the ring is inherited, like every other control's. Any future shadcn
 * component pasted in here should lose the same three classes for the same
 * reason.
 *
 * **A thin track.** Upstream's `border-2 border-transparent` is dropped: with
 * border-box sizing the two borders alone are 4px, so the track could never
 * be thinner than that, whatever its height, and its colour paints under them.
 *
 * **A hover ring on the thumb**, as `Slider`'s has, shown while the pointer is
 * anywhere on the switch (`group/switch`): the whole switch is the button, and
 * the dot alone is a small target. Upstream's `pointer-events-none` on the
 * thumb is dropped, so the parts of the dot above and below the track can be
 * hovered and clicked too. One `transition-[transform,box-shadow]`, because
 * `cn` keeps only the last `transition-*` and would drop the ring's.
 */
export function Switch({
  className,
  ...props
}: ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        'h3-switch',
        'group/switch peer inline-flex h-0.5 w-5 cursor-pointer items-center',
        'rounded-full',
        'transition-colors outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-ink-faint data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          'h3-switch-thumb',
          'border-primary ring-ring/50 block size-2 rounded-full bg-ink',
          'shadow-sm ring-0 transition-[transform,box-shadow] group-hover/switch:ring-4',
          'data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
        )}
      />
    </RadixSwitch.Root>
  );
}
