import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

afterEach(cleanup);

// The harness's own smoke test, importing nothing from ./ui: jsdom, Testing
// Library and jest-dom are wired. It runs before the reference is copied in,
// so a failure in a copied spec later is the copy and not the setup.
describe('the proving ground', () => {
  it('renders in jsdom with the matchers wired', () => {
    render(<h1>Smoke</h1>);
    expect(screen.getByRole('heading', { name: 'Smoke' })).toBeInTheDocument();
  });
});
