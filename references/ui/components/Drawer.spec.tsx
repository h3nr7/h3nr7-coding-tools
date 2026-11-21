import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';

afterEach(cleanup);

/*
 * The wiring is what matters here, as in Dialog.spec.tsx: which presses close
 * it, what stays usable behind it, and where focus goes.
 */

/** A page with an opener and a button of its own, beside a controlled drawer. */
function Page({
  modal,
  hideClose,
  onPagePress = () => {},
}: {
  modal: boolean;
  hideClose?: boolean;
  onPagePress?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <button ref={opener} onClick={() => setOpen((o) => !o)}>
        Ask
      </button>
      <button onClick={onPagePress}>On the page</button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={modal}
        title="Chat"
        closeLabel="Close chat"
        hideClose={hideClose}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      >
        <input aria-label="Question" />
        <button>Send</button>
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('is named, has its own close control, and closes on Escape', async () => {
    render(<Page modal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const drawer = screen.getByRole('dialog', { name: 'Chat' });
    expect(drawer.classList.contains('h3-drawer')).toBe(true);
    expect(within(drawer).getByRole('button', { name: 'Close chat' }).classList).toContain(
      'h3-drawer-close',
    );

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes from its close control', async () => {
    render(<Page modal={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close chat' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hideClose: no close control, and Escape still closes', async () => {
    render(<Page modal={false} hideClose />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const drawer = screen.getByRole('dialog', { name: 'Chat' });
    expect(within(drawer).queryByRole('button', { name: 'Close chat' })).toBeNull();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('non-modal: leaves the page usable, and stays open when it is pressed', async () => {
    const onPagePress = vi.fn();
    render(<Page modal={false} onPagePress={onPagePress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));

    await userEvent.click(screen.getByRole('button', { name: 'On the page' }));
    expect(onPagePress).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog', { name: 'Chat' })).toBeTruthy();
    // Focus may leave for the page, and the page is not hidden from anyone.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'On the page' }));
  });

  it('modal: traps focus inside, and hides the page from assistive technology', async () => {
    render(<Page modal />);
    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const drawer = screen.getByRole('dialog', { name: 'Chat' });

    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(drawer.contains(document.activeElement), `tab ${i + 1}`).toBe(true);
    }
    // Radix's `hideOthers`: the page is outside the accessibility tree.
    expect(screen.queryByRole('button', { name: 'On the page' })).toBeNull();
  });

  it('sends focus where onCloseAutoFocus says, as it has no trigger of its own', async () => {
    for (const modal of [false, true]) {
      render(<Page modal={modal} />);
      const opener = screen.getByRole('button', { name: 'Ask' });
      await userEvent.click(opener);
      await userEvent.click(screen.getByRole('textbox', { name: 'Question' }));
      await userEvent.keyboard('{Escape}');
      expect(document.activeElement, `modal=${modal}`).toBe(opener);
      cleanup();
    }
  });
});
