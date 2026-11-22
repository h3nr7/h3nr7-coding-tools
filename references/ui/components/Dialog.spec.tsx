import { afterEach, describe, expect, it } from 'vitest';
import { useRef, useState } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

afterEach(cleanup);

/*
 * These components carry almost no styling, so what is worth testing is the
 * wiring — the part that is invisible when it is missing and only shows up as
 * "the site is unusable with a screen reader".
 */

describe('Dialog', () => {
  it('has an accessible name, and can be closed from the keyboard', async () => {
    render(
      <Dialog title="Menu" trigger={<button>Open</button>}>
        <p>Contents</p>
      </Dialog>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(dialog).toBeTruthy();
    // A close control is always rendered: a modal a keyboard user can open but
    // not close without knowing about Escape is a trap.
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeTruthy();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps an accessible name even when the title is hidden', async () => {
    render(
      <Dialog title="Navigation" hideTitle trigger={<button>Open</button>}>
        <p>Contents</p>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    // Hidden visually, still announced. Dialogs with no name at all are the
    // usual result of a design with no visible heading.
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeTruthy();
  });

  it('returns focus to the trigger on close', async () => {
    render(
      <Dialog title="Menu" trigger={<button>Open</button>}>
        <p>Contents</p>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    // Otherwise focus lands back at the top of the document and a keyboard
    // user has to tab all the way to where they were.
    expect(document.activeElement).toBe(trigger);
  });

  /*
   * The triggerless case, which is the one that silently loses focus.
   *
   * A modal Radix dialog does not restore focus to whatever was focused before
   * it opened — it restores to its trigger, unconditionally. A dialog driven by
   * `open` with no `trigger` has a null trigger ref, so Radix's restore is a
   * no-op and focus lands on `document.body`. Nothing errors; a keyboard user
   * is simply returned to the top of the page. `onCloseAutoFocus` is the way
   * back, and `preventDefault` is what makes it take effect.
   */
  it('restores focus where a triggerless dialog asks it to', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const opener = useRef<HTMLButtonElement | null>(null);
      return (
        <>
          <button ref={opener} onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title="Picture"
            hideTitle
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
          >
            <p>Contents</p>
          </Dialog>
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    expect(screen.getByRole('dialog', { name: 'Picture' })).toBeTruthy();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('drops the close button when hideClose is set, and still closes on Escape', async () => {
    render(
      <Dialog title="Menu" hideClose trigger={<button>Open</button>}>
        <p>Contents</p>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });

    // Opting out is only safe because Escape is unaffected — Radix supplies
    // that independently of whichever close button exists, or does not.
    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
