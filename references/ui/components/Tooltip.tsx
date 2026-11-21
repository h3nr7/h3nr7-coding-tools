import { Tooltip as RadixTooltip } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Provider for tooltips. Mount once, near the root.
 *
 * Shared timing is the point: without a provider each tooltip has its own
 * delay, so moving along a row of them makes every one wait afresh.
 */
export function TooltipProvider({
  children,
  delayDuration = 300,
}: {
  children: ReactNode;
  delayDuration?: number;
}) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration} skipDelayDuration={200}>
      {children}
    </RadixTooltip.Provider>
  );
}

/**
 * A tooltip.
 *
 * **Never the only place information lives.** A tooltip is invisible to touch
 * users, who have no hover, and it is supplementary for everyone else. If the
 * text matters, it belongs on the page — an icon-only button needs an
 * `aria-label` regardless of whether it also has one of these.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn('h3-tooltip', className)}
        >
          {content}
          <RadixTooltip.Arrow />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
