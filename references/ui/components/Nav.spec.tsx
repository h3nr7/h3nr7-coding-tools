import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MenuButton, Nav, NavItem, SkipLink } from './Nav';

afterEach(cleanup);

/*
 * These components carry almost no styling, so what is worth testing is the
 * wiring — the part that is invisible when it is missing and only shows up as
 * "the site is unusable with a screen reader".
 */

describe('Nav', () => {
  it('labels the landmark', () => {
    render(
      <Nav label="Main">
        <NavItem href="/">Home</NavItem>
      </Nav>,
    );
    // Several <nav> landmarks on a page read as "navigation, navigation,
    // navigation" without this.
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
  });

  it('marks the current page for assistive technology', () => {
    render(
      <Nav>
        <NavItem href="/" current>
          Home
        </NavItem>
        <NavItem href="/articles">Articles</NavItem>
      </Nav>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Articles' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('keeps links in a list, so their number is announced', () => {
    render(
      <Nav>
        <NavItem href="/">Home</NavItem>
        <NavItem href="/articles">Articles</NavItem>
      </Nav>,
    );
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('MenuButton', () => {
  it('has a name despite being icon-only', () => {
    render(<MenuButton expanded={false} />);
    // A screen reader reads the glyph as nothing useful.
    expect(screen.getByRole('button', { name: 'Menu' })).toBeTruthy();
  });

  it('reports whether the drawer is open', () => {
    const { rerender } = render(<MenuButton expanded={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    rerender(<MenuButton expanded />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('is a button, not a submit', () => {
    // Inside a form, a bare <button> submits it.
    render(<MenuButton expanded={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});

describe('SkipLink', () => {
  it('targets the main landmark', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main',
    );
  });
});
