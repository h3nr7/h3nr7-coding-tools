import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Join class names, letting a caller's utility win over a component's default.
 *
 * `clsx` handles the conditionals; `tailwind-merge` resolves conflicts by
 * keeping the last of any pair that sets the same property. Without the second
 * half, `<Button className="p-8">` produces `p-4 p-8` and which one applies
 * depends on the order Tailwind happened to emit them in — a bug that shows up
 * as "sometimes the override works".
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
