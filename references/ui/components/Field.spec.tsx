import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from './Field';

afterEach(cleanup);

/*
 * These components carry almost no styling, so what is worth testing is the
 * wiring — the part that is invisible when it is missing and only shows up as
 * "the site is unusable with a screen reader".
 */

describe('Field', () => {
  it('associates the label with the input', async () => {
    render(<Field label="Email" name="email" />);
    // getByLabelText resolves through htmlFor/id, so this passing IS the
    // association.
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');

    // And clicking the label focuses the input, which is what the association
    // buys a pointer user.
    await userEvent.click(screen.getByText('Email'));
    expect(document.activeElement).toBe(input);
  });

  it('points aria-describedby at both the hint and the error', () => {
    render(<Field label="Email" hint="Work address" error="Required" />);
    const input = screen.getByLabelText('Email');
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');

    // Both, not whichever was remembered last.
    expect(ids).toHaveLength(2);
    const described = ids.map((id) => document.getElementById(id)?.textContent);
    expect(described).toContain('Work address');
    expect(described).toContain('Required');
  });

  it('marks the field invalid rather than only colouring it', () => {
    render(<Field label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('announces the error when it appears', () => {
    render(<Field label="Email" error="Required" />);
    // role=alert is what makes an error read out on arrival rather than only
    // when the field is next focused.
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('sets neither attribute when the field is fine', () => {
    render(<Field label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('gives every instance its own ids', () => {
    // Ids must be unique per document, and a form rendered twice is exactly
    // when hard-coded ones collide and the second label points at the first
    // input.
    render(
      <>
        <Field label="Email" hint="one" />
        <Field label="Email" hint="two" />
      </>,
    );
    const [first, second] = screen.getAllByLabelText('Email');
    expect(first!.id).not.toBe(second!.id);
    expect(first!.getAttribute('aria-describedby')).not.toBe(
      second!.getAttribute('aria-describedby'),
    );
  });
});
