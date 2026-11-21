import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

// The harness's own smoke test: jsdom, Testing Library and jest-dom are
// wired. If a copied spec fails later, it is the copy and not the setup.
describe('the proving ground', () => {
  it('renders the page', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'UI proof' })).toBeInTheDocument();
  });
});
