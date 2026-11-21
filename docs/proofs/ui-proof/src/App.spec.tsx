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

// The page with Controls and Dialog on it renders. This needs the reference
// copied to src/ui; the harness's own check is smoke.spec.tsx.
describe('the page', () => {
  it('renders with Controls and Dialog on it', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'UI proof' })).toBeInTheDocument();
  });
});
