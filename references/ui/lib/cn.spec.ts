import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('lets a caller override a component default', () => {
    // Without tailwind-merge this is "p-4 p-8" and which one wins depends on
    // the order Tailwind emitted them — a bug that reads as "sometimes the
    // override works".
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('keeps classes that do not conflict', () => {
    expect(cn('p-4', 'text-sm')).toBe('p-4 text-sm');
  });

  it('drops falsy values', () => {
    // Written the way a caller writes it — `isHidden && 'hidden'` — rather
    // than with a literal `false`, which is a constant expression and reads to
    // a linter as a mistake rather than as the case under test.
    const isHidden = Math.random() < 0;
    expect(cn('p-4', isHidden && 'hidden', undefined, null)).toBe('p-4');
  });
});
