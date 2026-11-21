import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerReveal, resetRevealQueue } from './reveal-queue';

/**
 * The queue is what makes a run of titles legible rather than busy, so what is
 * worth testing is the ordering and the never-two-at-once guarantee — not the
 * milliseconds, which are a look.
 */
describe('reveal queue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRevealQueue();
  });

  afterEach(() => {
    resetRevealQueue();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /** A member that reports when it ran and claims to be busy for `busy` ms. */
  function member(log: string[], name: string, busy = 100) {
    return () => {
      log.push(name);
      return busy;
    };
  }

  it('waits a gap before the first turn', () => {
    // A page that opens with a reveal has moved before the reader has looked
    // at it.
    const log: string[] = [];
    registerReveal(member(log, 'a'), 1000);

    // Below the shortest gap the draw can produce (half the mean): silent.
    vi.advanceTimersByTime(400);
    expect(log).toEqual([]);

    /*
     * Past the longest (one and a half times it): it has run. Not asserting a
     * count — the rotation continues, so how many turns fit in the window
     * depends on the draw, and pinning it would test Math.random rather than
     * the queue.
     */
    vi.advanceTimersByTime(1200);
    expect(log.length).toBeGreaterThan(0);
  });

  it('takes turns in registration order, and wraps', () => {
    const log: string[] = [];
    registerReveal(member(log, 'a'), 100);
    registerReveal(member(log, 'b'), 100);
    registerReveal(member(log, 'c'), 100);

    vi.advanceTimersByTime(10_000);
    expect(log.slice(0, 5)).toEqual(['a', 'b', 'c', 'a', 'b']);
  });

  it('never starts a turn before the previous one has finished', () => {
    /*
     * The whole point. A shared interval cannot promise this however it is
     * tuned, because it does not know how long a member will be busy — and a
     * long title is busy for much longer than a short one.
     */
    let running = 0;
    let overlapped = false;
    const busy = 5_000;

    const claim = () => {
      running += 1;
      if (running > 1) overlapped = true;
      setTimeout(() => {
        running -= 1;
      }, busy);
      return busy;
    };

    for (let i = 0; i < 4; i++) registerReveal(claim, 200);
    vi.advanceTimersByTime(120_000);

    expect(overlapped).toBe(false);
  });

  it('leaves a gap on top of the turn, not inside it', () => {
    /*
     * With the draw pinned mid-range the gap is exactly the mean, so: first
     * turn at 1000, busy until 2000, second turn at 3000. If the gap were a
     * window the turn had to fit inside, the second would come at 2000.
     */
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const log: string[] = [];
    registerReveal(member(log, 'a', 1000), 1000);

    vi.advanceTimersByTime(1000);
    expect(log).toEqual(['a']);

    vi.advanceTimersByTime(1900);
    expect(log).toEqual(['a']);

    vi.advanceTimersByTime(200);
    expect(log).toEqual(['a', 'a']);
  });

  it('averages the requested gap rather than repeating it', () => {
    /*
     * "Random with a mean we can set" — so the draw has to vary and still
     * average out. Uniform across half to one-and-a-half times the mean gives
     * both, with bounded ends: an exponential would have the more natural
     * clustering but an unbounded tail, and on a page of eight titles that is
     * one of them sitting untouched for a minute.
     */
    const gaps: number[] = [];
    let last = 0;
    const mean = 1000;

    registerReveal(() => {
      gaps.push(Date.now() - last);
      last = Date.now();
      return 0;
    }, mean);

    vi.advanceTimersByTime(200 * mean);

    const measured = gaps.slice(1);
    const average = measured.reduce((a, b) => a + b, 0) / measured.length;
    expect(measured.length).toBeGreaterThan(50);
    // Within 10% of the mean over a long run.
    expect(Math.abs(average - mean)).toBeLessThan(mean * 0.1);
    // And genuinely varying, not a fixed period wearing a mean's clothes.
    expect(new Set(measured).size).toBeGreaterThan(10);
    // Bounded at both ends.
    expect(Math.min(...measured)).toBeGreaterThanOrEqual(mean * 0.5);
    expect(Math.max(...measured)).toBeLessThanOrEqual(mean * 1.5);
  });

  it('stops scheduling once the last member leaves', () => {
    // An idle page should hold no timers at all.
    const leave = registerReveal(() => 0, 1000);
    expect(vi.getTimerCount()).toBe(1);
    leave();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('skips a member that left, without skipping the one after it', () => {
    /*
     * Removing an entry shifts everything after it down one. Without adjusting
     * the cursor the queue silently steps over whoever moved into that slot —
     * a title that simply never reveals again, which is invisible until you
     * count.
     */
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const log: string[] = [];
    const leaveA = registerReveal(member(log, 'a'), 1000);
    registerReveal(member(log, 'b'), 1000);
    registerReveal(member(log, 'c'), 1000);

    // Turn one only: a at 1000, b not until 2100.
    vi.advanceTimersByTime(1500);
    expect(log).toEqual(['a']);

    // Only what happens AFTER leaving is the subject; the turn above was a
    // legitimate one and stays in the log.
    const before = log.length;
    leaveA();
    vi.advanceTimersByTime(20_000);
    const after = log.slice(before);

    expect(after).not.toContain('a');
    expect(after).toContain('b');
    expect(after).toContain('c');
    // Strictly alternating, which is the cursor having been adjusted rather
    // than left pointing one past where it should.
    expect(after.slice(0, 4)).toEqual(['b', 'c', 'b', 'c']);
  });
});
