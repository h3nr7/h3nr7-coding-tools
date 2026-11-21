import { Slider as RadixSlider } from 'radix-ui';
import { useMemo, type ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * The shadcn slider, on this site's tokens.
 *
 * The classes are upstream's, verbatim, except in two places:
 *
 * - **No focus ring of its own**, for the reason `Switch` gives: `tokens.css`
 *   already outlines anything with a `tabindex` (the thumb has one), and two
 *   rings, concentric and a few pixels apart, is what keeping both produced
 *   there. So `focus-visible:ring-4 focus-visible:outline-hidden` are dropped.
 * - **The accessible name goes on the thumb.** The thumb, not the root, has
 *   `role="slider"`, so an `aria-label` on the root names nothing. This passes
 *   `aria-label` and `aria-labelledby` through to every thumb instead.
 */
export function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ComponentProps<typeof RadixSlider.Root>) {
  // One thumb per value, as upstream draws it.
  const values = useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]),
    [value, defaultValue, min],
  );

  return (
    <RadixSlider.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'h3-slider',
        'relative flex w-full touch-none items-center select-none',
        'data-[disabled]:opacity-50',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44',
        'data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <RadixSlider.Track
        data-slot="slider-track"
        className={cn(
          'bg-muted relative grow overflow-hidden rounded-full',
          'data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <RadixSlider.Range
          data-slot="slider-range"
          className={cn(
            'bg-primary absolute',
            'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
          )}
        />
      </RadixSlider.Track>
      {values.map((_, index) => (
        <RadixSlider.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            'h3-slider-thumb',
            'border-primary ring-ring/50 block size-2 shrink-0 rounded-full bg-ink cursor-pointer',
            'shadow-sm transition-[color,box-shadow] hover:ring-4',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        />
      ))}
    </RadixSlider.Root>
  );
}
