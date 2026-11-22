/**
 * h3nr7's own UI components, lib and tokens, as a reference.
 *
 * Taken from h3nr7 `packages/ui/src` on 2026-11-21. See README.md for what
 * was changed, which components need Tailwind, and what to wire.
 *
 * Behaviour and tokens, not a look. The visual design of h3nr7.com is deferred
 * to the next version, so what lives here is the part that has to be right
 * regardless of how it ends up looking: focus management, accessible names,
 * label wiring, reduced-motion handling, and one place where colour, type and
 * spacing are named.
 *
 * The components are unstyled on purpose. Each carries a stable `h3-*` class so
 * the design pass has something to hook onto without touching the markup.
 *
 * Exported as source rather than a build: the consuming app is Vite, which
 * compiles this alongside its own code. That keeps one toolchain rather than
 * two, and means no dist to fall out of date.
 */

export { cn } from './lib/cn';

export { Dialog, DialogClose, type DialogProps } from './components/Dialog';
export { Drawer, type DrawerProps } from './components/Drawer';
export { Tooltip, TooltipProvider } from './components/Tooltip';
export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './components/Popover';
export { Switch } from './components/Switch';
export { Slider } from './components/Slider';
/*
 * Folders of switches and sliders, drawn from data. Styled, unlike most of
 * this file: it exists to look like the site's own cards wherever it lands.
 */
export {
  Controls,
  type ControlsFolder,
  type ControlsItem,
  type ControlsProps,
} from './components/Controls';
export { Field, type FieldProps } from './components/Field';
export { Nav, NavItem, MenuButton, SkipLink, type NavLinkProps } from './components/Nav';
export { ScrambleText, type ScrambleTextProps } from './components/ScrambleText';
export { useIsMobile } from './lib/use-mobile';
