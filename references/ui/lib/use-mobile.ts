/**
 * shadcn's `useIsMobile`: true below 768px, which is where the sidebar becomes
 * a Sheet.
 *
 * The same answer as upstream's, from `useSyncExternalStore` rather than from
 * `useState` set inside an effect, which this repo's lint refuses
 * (`react-hooks/set-state-in-effect`) — the same move root.tsx's hydration
 * check makes. Behaviour is unchanged where it matters: false on the server and
 * through hydration, so the desktop layout renders first and matches, then the
 * real width, and again whenever the window crosses the breakpoint.
 */
import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const onClient = () => window.innerWidth < MOBILE_BREAKPOINT;
const onServer = () => false;

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, onClient, onServer);
}
