import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * The site's primary navigation.
 *
 * Deliberately plain elements rather than a Radix NavigationMenu: this site's
 * nav is a list of links, and NavigationMenu exists for menus with submenus and
 * roving focus. Wrapping a list of links in it adds a keyboard model users do
 * not expect from links, plus JavaScript that a `<nav>` does not need.
 *
 * Kept in the design system anyway, because the parts worth getting right are
 * easy to forget: a labelled landmark so screen-reader users can jump to it,
 * and `aria-current` so the active page is announced rather than only coloured.
 */
export function Nav({
  label = 'Main',
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // Labelled because a page can have several <nav> landmarks — main, footer,
    // breadcrumbs — and "navigation, navigation, navigation" tells nobody
    // which is which.
    <nav aria-label={label} className={cn('h3-nav', className)}>
      <ul>{children}</ul>
    </nav>
  );
}

export type NavLinkProps = {
  current?: boolean;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function NavItem({ current, children, className, ...anchor }: NavLinkProps) {
  return (
    <li>
      <a
        {...anchor}
        // `page` rather than `true`: it tells assistive technology *what* is
        // current, which is the difference between "current" and "current page".
        aria-current={current ? 'page' : undefined}
        className={cn('h3-nav-item', className)}
      >
        {children}
      </a>
    </li>
  );
}

/**
 * The menu button for the site's nav.
 *
 * An icon-only control, so it carries a real accessible name rather than
 * relying on the glyph — a screen reader reads "☰" as nothing useful, and the
 * glyph is `aria-hidden` for that reason. `aria-expanded` reports the panel's
 * state, which is what turns a button into a disclosure.
 *
 * **`label` and `children` are independent on purpose.** The glyph is whatever
 * the site wants its menu to look like; the accessible name is what the button
 * *does*. A consumer that changes one and not the other is usually right — a
 * mark that reads as "?" to the eye is still "Menu" to a screen reader, and
 * pinning them together would force the label to follow the decoration.
 *
 * `forwardRef`, so this can be passed straight into `Dialog`'s or `Popover`'s
 * `trigger`/`PopoverTrigger asChild`: Radix clones the element and attaches
 * its own ref for focus management. A plain function component drops that ref
 * on the floor and Radix warns about it in development.
 */
export const MenuButton = forwardRef<
  HTMLButtonElement,
  {
    expanded: boolean;
    label?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function MenuButton(
  { expanded, label = 'Menu', className, children = '☰', ...button },
  ref,
) {
  return (
    <button
      {...button}
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      className={cn('h3-menu-button', className)}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
});

/**
 * A link that jumps past the header to the main content.
 *
 * Visually hidden until focused. Without it, every keyboard user tabs through
 * the whole nav on every page before reaching anything they came for.
 * The target must be `<main id="main">`.
 */
export function SkipLink({ href = '#main' }: { href?: string }) {
  return (
    <a href={href} className="h3-skip-link">
      Skip to content
    </a>
  );
}
