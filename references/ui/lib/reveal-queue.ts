/**
 * One self-reveal at a time, across every ScrambleText on the page.
 *
 * Independent per-instance timers gave every title its own clock, so on a run
 * of eight they overlapped constantly — two or three titles flapping at once
 * reads as the page glitching rather than as a sentence surfacing. What makes
 * it legible is that exactly one thing moves, and the eye knows where to go.
 *
 * So the instances do not schedule themselves. Each registers with this queue
 * and is called when its turn comes; the queue starts the next one only once
 * the previous has finished, which is the guarantee a shared timer cannot give
 * however carefully its interval is chosen.
 *
 * **Module-level, not a React context.** The same reasoning as `pointer.ts`:
 * there is one page and one queue, callers are spread across a route's markup
 * rather than under a common owner, and nothing here needs to re-render
 * anything. A provider would be ceremony around a single variable.
 */

/**
 * A registered reveal.
 *
 * `run` performs the reveal and returns how long it will be busy, in
 * milliseconds — so the queue waits for the flap it actually started rather
 * than for a duration it assumed. `mean` is the average gap to leave after it.
 */
type Member = { run: () => number; mean: number };

const members: Member[] = [];

/** Whose turn is next. FIFO: registration order, wrapping. */
let cursor = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * A random gap with the requested mean.
 *
 * Uniform across half to one-and-a-half times the mean, which preserves it
 * exactly while bounding both ends. The obvious alternative — an exponential,
 * as a Poisson process — has the more natural-looking clustering but an
 * unbounded tail, and on a page of eight titles that shows up as one of them
 * sitting untouched for a minute while its neighbours take three turns each.
 */
function gap(mean: number): number {
  return mean * (0.5 + Math.random());
}

function schedule(delay: number): void {
  clearTimeout(timer);
  timer = setTimeout(run, delay);
}

function run(): void {
  if (members.length === 0) {
    timer = undefined;
    return;
  }

  // A member may have unregistered since the last turn was scheduled.
  if (cursor >= members.length) cursor = 0;
  const member = members[cursor]!;

  const busyFor = member.run();
  cursor = (cursor + 1) % members.length;

  // The next turn begins only after this one has finished — the gap is on top
  // of the reveal, not a window it has to fit inside.
  schedule(Math.max(0, busyFor) + gap(member.mean));
}

/**
 * Join the rotation. Returns the function that leaves it.
 *
 * The first member starts the queue and the last one to leave stops it, so a
 * page with nothing registered schedules no timers at all.
 */
export function registerReveal(fn: () => number, meanGapMs: number): () => void {
  const member: Member = { run: fn, mean: meanGapMs };
  members.push(member);

  // A full gap before the first reveal, so a freshly loaded page is still for a
  // moment rather than opening with one.
  if (members.length === 1) schedule(gap(meanGapMs));

  return () => {
    const index = members.indexOf(member);
    if (index === -1) return;
    members.splice(index, 1);

    /*
     * Keep the cursor pointing at the same member it was pointing at. Removing
     * an earlier entry shifts everything after it down one, so without this the
     * queue silently skips whoever is now in that slot.
     */
    if (index < cursor) cursor -= 1;

    if (members.length === 0) {
      clearTimeout(timer);
      timer = undefined;
      cursor = 0;
    } else if (cursor >= members.length) {
      cursor = 0;
    }
  };
}

/** Test seam: drops every member and cancels the pending turn. */
export function resetRevealQueue(): void {
  clearTimeout(timer);
  timer = undefined;
  members.length = 0;
  cursor = 0;
}
