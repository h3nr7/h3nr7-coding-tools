import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

// Radix's slider measures its track with ResizeObserver, which jsdom lacks.
// An inert one, as Controls.spec.tsx in the reference does.
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

// The harness's own smoke test: jsdom, Testing Library and jest-dom are
// wired. If a copied spec fails later, it is the copy and not the setup.
describe('the proving ground', () => {
  it('renders the page', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'UI proof' })).toBeInTheDocument();
  });
});
