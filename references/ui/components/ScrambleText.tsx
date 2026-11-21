import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { registerReveal } from '../lib/reveal-queue';

/**
 * Text that flips on hover, like a split-flap departure board.
 *
 * Each character rolls forward through the alphabet a card at a time, tinting
 * to grey as it goes, and lands back on its real letter — staggered along the
 * string so the whole title reads as a wave travelling left to right.
 *
 * Two details are what make it read as a *flap* rather than as noise:
 *
 *   - **The roll is sequential, not random.** A departure board steps through
 *     its cards in order; it cannot teleport. Characters advance one glyph per
 *     flap.
 *   - **It arrives rather than snaps.** The starting offset is computed
 *     backwards from the real character, so the last flap lands on it by
 *     rolling into place. Snapping at the end is the tell that it was never a
 *     board.
 *
 * Four constraints shaped the DOM below, each learned the hard way:
 *
 * **1. Layout must not move.** Substituting `W` for `i` in a proportional serif
 * changes the advance width, so a naive swap makes the line jitter and re-wrap.
 * Every character is measured once at activation and pinned to its own width.
 *
 * **2. Words must not break.** Per-character `inline-block` spans give the
 * browser a break opportunity between every letter, so a long title would wrap
 * mid-word. Characters are grouped into `nowrap` word spans; breaks happen
 * between words, as in ordinary text.
 *
 * **3. A screen reader must never hear the flapping.** While it runs, the split
 * characters are `aria-hidden` and a visually-hidden copy of the real string
 * carries the accessible name — otherwise a keyboard user focusing the link
 * hears whatever glyphs happen to be on screen at that instant.
 *
 * **4. No React state per frame.** The loop writes `textContent` and one custom
 * property straight to the DOM. Setting state would re-render the subtree sixty
 * times a second for a decoration.
 *
 * **5. A ligature must arrive in one piece.** `st` is a single glyph in this
 * face. Flapping the `s` and the `t` on separate offsets means the `s` settles,
 * sits there as a plain `s`, and then visibly changes shape when the `t` lands
 * beside it and the two fuse. So a ligature group is ONE cell, rolling and
 * arriving together — see `toCells`.
 *
 * Server-rendered output is the plain string — the split exists only while the
 * effect runs, so the HTML that ships, that a crawler reads and that a visitor
 * copies is just text.
 */

/**
 * The card deck.
 *
 * Letters and digits rather than the usual box-drawing and punctuation soup:
 * this sets in Mrs Eaves, and `▓╫§` in a Baskerville revival reads as a
 * rendering fault rather than as an effect. It is also what a real board holds.
 */
const DEFAULT_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * The flap's effect runs before paint in the browser, so `animateIn` hides its
 * letters before the finished text is ever drawn. `useEffect` on the server,
 * where neither runs and React would otherwise warn.
 */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Milliseconds one card spends in view. Roughly a real Solari flap. */
const FLAP_MS = 55;

/**
 * How long a self-reveal holds the settled text before blurring it again.
 *
 * Added on top of the flap's own run, so the title is readable for a beat after
 * the last character lands. Without it the blur begins on the same frame the
 * roll ends, and the reveal reads as a glitch rather than as a sentence
 * surfacing.
 */
const REVEAL_SETTLE_MS = 1200;

/**
 * How much quicker the roll is on the way out.
 *
 * Leaving is not information. Arriving tells the reader what the title says, so
 * it takes the time to be read; going is the text getting out of the way of
 * wherever the pointer has moved to, and at full speed it holds the eye on
 * something the reader has already left behind. 0.6 is fast enough to read as a
 * retreat and slow enough to still be the same mechanism rather than a cut.
 *
 * It matches the direction of the blur's own asymmetry — one gesture, not two —
 * though not its ratio: the filter fade is slower outward (1/2 against 2/5)
 * because a fast blur snaps the text away from a pointer that merely passed
 * over, while the roll has no such problem.
 */
const EXIT_FLAP_SCALE = 0.6;

/**
 * How far the breathing period varies between instances, either side of the
 * mean.
 *
 * **A shared phase offset is not enough.** Titles started at different points
 * of the same 5.2s cycle still rise and fall at the same rate, so the run reads
 * as one organism with a delay line rather than as several things breathing —
 * and any two of them that happen to start near each other stay near each other
 * for as long as the page is open. Different periods make them drift, which is
 * what stops the pattern ever settling.
 *
 * 0.18 gives roughly 4.3s to 6.1s around a 5.2s mean: far enough apart to come
 * unstuck within a cycle or two, close enough that no single title reads as
 * hurried or becalmed next to its neighbours.
 */
const BREATHE_SPREAD = 0.18;

/**
 * Send the breath back to the top of its cycle.
 *
 * Called when the reader leaves, so the next breath starts from the beginning
 * rather than picking up wherever the cycle had drifted to while the text was
 * sharp.
 *
 * **Safe to do mid-fade, which it did not used to be.** The breath drives a
 * number now, not `filter`, so resetting it only moves the target the sleep
 * transition is easing toward — and at the top of the cycle that target IS the
 * resting value, so the text lands exactly where it was going anyway.
 *
 * The delay is cleared as well as the time. That delay exists to scatter a run
 * of titles on load; once one has been hovered, its phase has served its
 * purpose and starting at zero is what "reset" means. The instance keeps its
 * own PERIOD, which is what stops it falling back into step with its
 * neighbours.
 *
 * Module-level rather than a closure in the component, so the effects that call
 * it need no dependency on it.
 */
function resetBreath(host: HTMLElement | null): void {
  // getAnimations is not in older jsdom, and there is nothing to reset there.
  if (!host?.getAnimations) return;
  for (const animation of host.getAnimations()) {
    if ((animation as CSSAnimation).animationName !== 'h3-scramble-breathe') {
      continue;
    }
    animation.effect?.updateTiming({ delay: 0 });
    animation.currentTime = 0;
  }
}

/**
 * This instance's breathing rhythm: how long a breath takes, and where in one
 * it begins.
 *
 * **Derived from the text, not drawn at random.** Both values are rendered into
 * the markup as CSS, so they are computed on the server as well as in the
 * browser — and `Math.random()` would produce different numbers in each, which
 * React reports as a hydration mismatch and then fixes by throwing the server's
 * HTML away. A hash of the string is stable across both, different for every
 * title, and needs nothing stored.
 *
 * FNV-1a: four lines, well distributed over short strings, and `Math.imul`
 * keeps the multiply in 32 bits rather than drifting into float territory. Two
 * independent values are taken from it by reading different bits — the low
 * digits and a shifted slice — rather than by hashing twice.
 */
function breathRhythm(text: string, meanMs: number) {
  let hash = 2_166_136_261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  // >>> 0 first: the multiply leaves a signed 32-bit value, and a negative one
  // would put both of these on the wrong side of zero.
  const bits = hash >>> 0;

  const phase = (bits % 1000) / 1000;
  const spread = ((bits >>> 10) % 1000) / 1000;

  const periodMs = Math.round(meanMs * (1 + (spread - 0.5) * 2 * BREATHE_SPREAD));
  return {
    periodMs,
    // Negative: the animation begins partway through its own cycle instead of
    // waiting to start, which is what scatters a run of titles on load.
    delayMs: -Math.round(phase * periodMs),
  };
}

/**
 * Character pairs that fuse into a single glyph, and must therefore flap as one.
 *
 * A ligature is ONE glyph drawn from two or more characters. Split `st` across
 * two cells and they get two different stagger offsets: the `s` lands and sits
 * there as a plain `s`, then a flap later the `t` lands, the pair fuses, and
 * the already-settled `s` visibly changes shape. Two arrivals where the reader
 * should see one — which is the "jump".
 *
 * Grouping them into a single cell fixes it at the source: the pair shares one
 * offset, rolls together and arrives together, so the ligature appears in one
 * step. It also means the cell is MEASURED with the ligature formed, so the
 * pinned width is the real one.
 *
 * **This list is measured against the served webfont, not copied from a
 * reference.** Mrs Eaves carries a far larger set than the fi/fl most faces
 * stop at, and a hand-written list produced exactly the bug above: `it` fuses
 * in the italic, was missing, and "identity" jumped.
 *
 * How it was produced — every pair over `[A-Za-z]²`, plus the three-letter
 * candidates, in both cuts:
 *
 *   - render each candidate 100 times, every occurrence separated by a space,
 *     with `font-kerning: none` so a width change can only be a substitution;
 *   - measure once under `no-common-ligatures no-discretionary-ligatures
 *     no-contextual`, once under the page's own setting;
 *   - a per-occurrence delta above 0.15px at 64px is a substitution.
 *
 * Three things make it trustworthy, each learned by getting it wrong first:
 *
 *   - **The repeat.** A real substitution scales linearly with it while
 *     subpixel rounding stays bounded, so `st` at 0.19px per occurrence —
 *     invisible in a single sample — separates cleanly from noise.
 *   - **The separating spaces.** Repeating "ig" without them manufactures 99
 *     "gi" pairs, and every reversed pair reads as a false positive.
 *   - **A visual check.** Each cut was also rendered ligatures-off beside
 *     ligatures-on and compared by eye. It agreed with the width scan on every
 *     uppercase pair, which is what licenses trusting the numbers elsewhere.
 *
 * **The published Mrs Eaves ligature set is not what this kit serves.** A
 * widely-copied list of ~213 combinations includes `as co ll oo re ri tr tu`,
 * the capitals `AE AM AN AR AW AY WA YA CC CO GG GO LE LI LL LO LU LY NE NG OR
 * RA RE RI RO RU RY`, and the word-fusions `the and for`. Measured here, every
 * one of those is a flat 0.000 in both cuts — they are in the retail font, or
 * in nobody's font, but they are not in this one. Adding them would group
 * `on`, `or`, `re` and friends, which flips half of every ordinary word two
 * letters at a time for no reason. So the list below is only what was
 * observed, and it is worth re-running the scan if the kit is ever changed.
 *
 * Equally: `ffe ffo ffy ffg ffs ffu ffw ffx` each measure exactly `ff`'s own
 * delta, so they are `ff` plus a plain letter rather than three-letter glyphs.
 * Only `ffi` and `ffl` are their own.
 *
 * Which cut each belongs to:
 *
 *   both      ct, gi, gy, ky, sp, st, ty, tw, and every uppercase pair, Th
 *   italic    fr, ft, it, tt
 *   Roman     ae, ee, ff, ffi, ffl, fi, fj, fy, oe, py
 *
 * Both cuts are listed whichever one a caller sets in, because grouping a pair
 * the current face does NOT fuse costs nothing — those two characters simply
 * roll together. A missing pair is the only failure that shows.
 *
 * **Order matters: longest first.** `ffi` has to be tried before `ff` and `fi`,
 * or it is matched as `ff` + `i` and the three-character glyph never forms.
 */
const DEFAULT_LIGATURES = [
  // Three characters, first — see the ordering note above.
  'ffi', 'ffl',
  // Interlocking capitals. Display pairs, so they turn up in a title far more
  // often than in running text.
  'AA', 'AV', 'VA', 'LA', 'HE', 'OO', 'OC', 'OG',
  'MB', 'MD', 'ME', 'MP', 'NK', 'NT',
  'TE', 'TR', 'TT', 'TW', 'TY',
  'UB', 'UD', 'UL', 'UP', 'UR',
  'FF', 'FI', 'FL',
  // The one cap-plus-lowercase pair in the face.
  'Th',
  // Lowercase.
  'ae', 'ct', 'ee', 'ff', 'fi', 'fj', 'fr', 'ft', 'fy',
  'gi', 'gy', 'it', 'ky', 'oe', 'py', 'sp', 'st', 'tt', 'tw', 'ty',
];

/**
 * Split a word into flap cells: ligature groups stay whole, everything else is
 * one character.
 *
 * Exported for its tests — the ordering rule above is the kind of thing that
 * silently regresses when someone adds a pair to the list.
 *
 * Works on code points rather than UTF-16 units, so an accented character or an
 * emoji is one cell rather than half of one.
 */
export function toCells(word: string, ligatures: string[] = DEFAULT_LIGATURES): string[] {
  const chars = Array.from(word);
  const cells: string[] = [];

  for (let i = 0; i < chars.length; ) {
    const match = ligatures.find((lig) => {
      const parts = Array.from(lig);
      return (
        parts.length <= chars.length - i &&
        parts.every((part, n) => chars[i + n] === part)
      );
    });

    if (match) {
      cells.push(match);
      i += Array.from(match).length;
    } else {
      cells.push(chars[i]!);
      i += 1;
    }
  }

  return cells;
}

export type ScrambleTextProps = {
  /** The real string. Always what is server-rendered and read by AT. */
  text: string;
  className?: string;
  /** How long one character keeps flapping before it settles. */
  duration?: number;
  /** Delay between neighbouring characters. This is what makes it a wave. */
  stagger?: number;
  /** The deck each character rolls through. */
  glyphs?: string;
  /**
   * Pairs that must flap as a unit because they fuse into one glyph. Longest
   * first. Pass a different set for a face with a different ligature table.
   */
  ligatures?: string[];
  /**
   * Sit blurred and dimmed until hovered or focused.
   *
   * The resting state carries the invitation: a run of soft titles reads as
   * "these do something" without any of them being underlined or coloured.
   *
   * Applied only where hovering is possible — see the `(hover: hover)` note in
   * scramble.css. On a touch screen there is nothing to undo it with, so the
   * text would stay blurred for the whole visit.
   */
  blurred?: boolean;
  /** Opacity at rest. Ignored unless `blurred`. */
  restOpacity?: number;
  /** Blur radius at rest, in pixels. Ignored unless `blurred`. */
  restBlur?: number;
  /**
   * Let the resting blur drift in and out, like breathing.
   *
   * Not an effect anyone should catch happening. What it changes is a page
   * nobody has touched yet: text that is exactly static reads as an image of
   * text, and a few tenths of a pixel of drift is the difference between a
   * screenshot and something alive.
   *
   * Needs `blurred` — it modulates the resting state, so without one there is
   * nothing to breathe. Off under `prefers-reduced-motion`: it is the one part
   * of this component that happens without being asked.
   */
  breathe?: boolean;
  /** One full breath, in and out, in ms. Ignored unless `breathe`. */
  breatheMs?: number;
  /**
   * How deep the breath goes, as a fraction of the resting values.
   *
   * At the peak the blur is `restBlur × (1 + depth)` and the opacity is
   * `restOpacity × (1 - depth)`. Proportional rather than absolute so retuning
   * the resting look carries the breath with it.
   */
  breatheDepth?: number;
  /**
   * Surface by itself, now and then.
   *
   * With this on, the text unblurs at a random interval, holds, and blurs
   * again — so a run of titles breathes rather than waiting to be found. Each
   * instance keeps its own timer, which is what makes a list of them arrive
   * unevenly instead of pulsing in unison.
   *
   * A reveal is the whole effect, not half of it: the text comes sharp, flaps,
   * settles, and blurs again — the same sequence a hover produces, minus the
   * reader.
   *
   * Needs `blurred`; on its own there is nothing to reveal.
   */
  randomReveal?: boolean;
  /**
   * Average gap between one reveal ending and the next beginning, in ms.
   *
   * A mean, not a period: the actual wait is random around it, so the run
   * breathes instead of ticking. It is measured across the whole page — every
   * instance shares one queue — so this is the gap between reveals, not between
   * this title's own turns.
   */
  revealGapMs?: number;
  /**
   * How long a self-reveal stays sharp before blurring again, in ms.
   *
   * A floor, not the value: a reveal always holds long enough for the flap to
   * finish, so a long title is not cut off mid-roll.
   */
  revealHoldMs?: number;
  /**
   * Flap by itself: once on mount, and again whenever `text` changes.
   *
   * For text that is a signal rather than a title — the brain chat's
   * "Thinking…" line, which has no pointer aimed at it, and whose changing
   * wording is the news. Hover and focus still flap it too. Nothing under
   * `prefers-reduced-motion`, by the same guard every flap goes through.
   */
  autoplay?: boolean;
  /**
   * With `autoplay`, keep flapping for as long as it is mounted, so a wait
   * reads as work going on: each flap ends, the text holds for
   * `repeatDuration`, and the next begins.
   */
  repeat?: boolean;
  /** The pause between one repeated flap ending and the next, in ms. */
  repeatDuration?: number;
  /**
   * Called when a flap begins, and when it ends.
   *
   * **This component knows nothing about audio, and must not.** `@h3nr7/ui` is
   * behaviour and tokens; what a flap sounds like is the application's business.
   * So it reports what it is doing and the caller decides what that means:
   *
   * ```tsx
   * const flap = useSound('splitflap');   // from @h3nr7/audio
   * <ScrambleText text={title} onFlapStart={flap.start} onFlapEnd={flap.stop} />
   * ```
   *
   * **They fire for every flap, not only for a hover.** Arriving, leaving on the
   * faster exit roll, and an unattended self-reveal all go through the same two
   * functions — so anything hung off them tracks the animation rather than the
   * pointer, which is the only version that stays correct as triggers are added.
   *
   * Neither fires under `prefers-reduced-motion`, because the flap itself does
   * not: `onFlapStart` sits after that guard, so there is no second check to
   * keep in sync with the first.
   *
   * `onFlapEnd` always follows an `onFlapStart` — it is skipped when `stop` runs
   * without a flap in progress, which is what unmounting mid-hover looks like.
   * A caller holding a resource between the two can rely on the pairing.
   *
   * Read through a ref, so an inline arrow is safe: a changing identity here
   * cannot restart the animation.
   */
  onFlapStart?: () => void;
  onFlapEnd?: () => void;
  /**
   * Arrive letter by letter: on mount, and again whenever `text` changes, each
   * character stays hidden until its turn, flaps, and lands, the wave crossing
   * the whole string in `animateInDuration`.
   *
   * For text that is arriving rather than waiting to be found: the brain
   * chat's answers on `/assistant`, a paragraph at a time. The space each
   * letter will take is held from the start, so the line never reflows as it
   * fills. Under `prefers-reduced-motion` the text is simply there, by the same
   * guard every flap goes through.
   */
  animateIn?: boolean;
  /**
   * How long the whole entrance takes, first letter to last, in ms: 0.65s by
   * default, whatever the length. One letter's own flap is the shorter of
   * `duration` and half of this; the wave fits the rest, so a long paragraph
   * ripples quickly and a short word slowly, and both are done on time.
   */
  animateInDuration?: number;
  /**
   * Flap when the pointer or focus arrives on the text (or the link or button
   * around it). On by default: it is what a title is for. Off for running text
   * a reader moves across while reading, which should hold still.
   */
  flapOnHover?: boolean;
};

export function ScrambleText({
  text,
  className,
  duration = 460,
  stagger = 26,
  glyphs = DEFAULT_GLYPHS,
  ligatures = DEFAULT_LIGATURES,
  blurred = false,
  restOpacity = 0.55,
  restBlur = 3.8,
  breathe = false,
  breatheMs = 5_200,
  breatheDepth = 0.18,
  randomReveal = false,
  revealGapMs = 3_500,
  revealHoldMs = 1_600,
  autoplay = false,
  repeat = false,
  repeatDuration = 250,
  onFlapStart,
  onFlapEnd,
  animateIn = false,
  animateInDuration = 650,
  flapOnHover = true,
}: ScrambleTextProps) {
  const hostRef = useRef<HTMLSpanElement>(null);

  /**
   * The flap callbacks, kept out of the effect's dependencies.
   *
   * The alternative is listing them, and then an inline arrow at the call site
   * — the obvious way to write one — tears down and rebuilds every listener on
   * every parent render, cancelling any flap in progress. A title that stopped
   * mid-roll because an unrelated sibling updated would be a genuinely horrible
   * bug to find, so the shape that cannot cause it is the one to ship.
   */
  const soundRef = useRef<Pick<ScrambleTextProps, 'onFlapStart' | 'onFlapEnd'>>(
    {},
  );
  useEffect(() => {
    soundRef.current = { onFlapStart, onFlapEnd };
  }, [onFlapStart, onFlapEnd]);

  /** This instance's own period and starting point. Pure, so SSR agrees. */
  const rhythm = breathRhythm(text, breatheMs);


  /**
   * The flap, reachable from the reveal timer below.
   *
   * `start` closes over everything the animation needs and is rebuilt whenever
   * those change, so it lives inside its effect. A ref is what lets the second
   * effect call the current one without owning any of it — and without the
   * reveal timer being torn down and re-randomised every time a flap option
   * changes, which would be a visible hitch for a decision the reader made
   * nothing about.
   */
  const startRef = useRef<((scale?: number) => void) | null>(null);

  useBeforePaint(() => {
    const host = hostRef.current;
    if (!host) return;

    /*
     * Listen on the interactive ancestor, not on the text.
     *
     * The link is what the visitor is aiming at, and it usually has padding the
     * text does not cover — binding to the span alone means the effect fails to
     * fire in the gap between the text and the edge of its own hit area. It
     * also gets keyboard users the effect for free, through focus on the same
     * element.
     */
    const trigger: HTMLElement = host.closest('a, button') ?? host;


    let frame = 0;
    let running = false;
    /** The pause before the next flap, with `autoplay` and `repeat`. */
    let replay: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      /*
       * Read before clearing, and report only if there was something to end.
       *
       * `stop` is the effect's cleanup as well as the animation's natural end,
       * so it runs whether or not a flap was in progress — on unmount, on a
       * prop change, on a title that was never hovered. An unguarded callback
       * here would tell the caller a flap ended that never began, and anything
       * pairing the two would release a resource it never took.
       */
      const wasRunning = running;

      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      running = false;
      // Back to one text node: the split is scaffolding, not content.
      host.textContent = text;
      host.removeAttribute('data-flapping');

      if (wasRunning) soundRef.current.onFlapEnd?.();
    };

    /**
     * @param scale multiplies the timings. 1 is the full roll; the exit uses
     *   EXIT_FLAP_SCALE, which is the same animation played faster.
     * @param entering the `animateIn` entrance: each cell hidden until its
     *   turn, and the wave fitted to `animateInDuration`.
     */
    const start = (scale = 1, entering = false) => {
      if (running) return;

      /*
       * Read the preference at activation rather than at mount, so someone who
       * changes it mid-session is honoured without a reload. Reduced motion
       * gets no flapping at all — the CSS still tints on hover, which keeps the
       * affordance without the movement.
       */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      running = true;
      host.setAttribute('data-flapping', '');

      /*
       * After both guards, so it reports only flaps that actually happen.
       *
       * Being below the reduced-motion check is what makes "no sound under
       * reduced motion" free rather than a second condition that can drift out
       * of step with the first. Being below the `running` check is what keeps
       * one flap to one report when a self-reveal lands on a title the reader
       * is already hovering.
       */
      soundRef.current.onFlapStart?.();

      // The accessible name, intact while the visible glyphs are nonsense.
      const label = document.createElement('span');
      label.className = 'h3-visually-hidden';
      label.textContent = text;

      const stage = document.createElement('span');
      stage.setAttribute('aria-hidden', 'true');

      /*
       * Scaled once, here, so every derived timing below moves together.
       *
       * An entrance fits itself to `animateInDuration` instead: one letter's
       * flap is at most half of it, and the stagger spreads the rest across
       * the characters (the wave's unit, as below), so the last letter lands
       * on time however long the text is.
       */
      const characters = Array.from(text.replace(/\s+/g, '')).length;
      const dur = entering ? Math.min(duration, animateInDuration / 2) : duration * scale;
      const stg = entering ? (animateInDuration - dur) / Math.max(1, characters) : stagger * scale;
      const flapsPerChar = Math.max(1, Math.round(dur / FLAP_MS));

      /**
       * One flap cell: usually a single character, and for a ligature the whole
       * group. `parts` is what rolls; `offset` is where the cell sits in the
       * wave.
       */
      type Part = { real: string; from: number; rolls: boolean };
      type Cell = { el: HTMLElement; real: string; parts: Part[]; offset: number };
      const cells: Cell[] = [];

      /*
       * The wave is measured in CHARACTERS, not in cells.
       *
       * A ligature cell holds two characters but flips once, so counting cells
       * would make the wave accelerate through a word like "structure" and slow
       * down through one without ligatures. Advancing the offset by the number
       * of characters a cell contains keeps the wave travelling at one rate
       * across the whole string, whatever it is made of.
       */
      let offset = 0;

      // Split into words so wrapping still happens at spaces, then into cells
      // within each word.
      for (const [index, word] of text.split(/(\s+)/).entries()) {
        if (word === '') continue;
        if (index % 2 === 1) {
          // The separator itself, as a plain text node: making whitespace an
          // inline-block collapses it and closes up the words.
          stage.appendChild(document.createTextNode(word));
          continue;
        }
        const wordEl = document.createElement('span');
        wordEl.className = 'h3-scramble-word';
        for (const group of toCells(word, ligatures)) {
          const cell = document.createElement('span');
          cell.className = 'h3-scramble-char';
          /*
           * The group goes in as ONE text node, so a ligature actually forms
           * inside the cell — which is what the width measurement below then
           * captures. Two nested spans would defeat both.
           */
          cell.textContent = group;
          // Not there until its turn, though its space is: the line is laid
          // out once, as it will finally read.
          if (entering) cell.style.visibility = 'hidden';
          wordEl.appendChild(cell);

          const parts = Array.from(group).map((char) => {
            /*
             * Where this character's roll begins.
             *
             * Counted BACKWARDS from the real glyph so the final flap arrives
             * on it. A character outside the deck — punctuation, a dash, an
             * accent — cannot roll to itself, so it sits the animation out
             * rather than being replaced by something it will never become.
             */
            const target = glyphs.indexOf(char);
            return {
              real: char,
              rolls: target >= 0,
              from: target >= 0 ? (target - flapsPerChar) % glyphs.length : 0,
            };
          });

          cells.push({ el: cell, real: group, parts, offset });
          offset += parts.length;
        }
        stage.appendChild(wordEl);
      }

      host.textContent = '';
      /*
       * `appendChild` twice rather than one `append(label, stage)`.
       *
       * `apps/web` compiles with @cloudflare/workers-types in scope, where
       * `append` resolves to the Workers `Body`/`FormData` signature — which
       * takes a string, not a node — so the DOM overload is shadowed and the
       * call fails to typecheck in the consuming app while looking fine here.
       */
      host.appendChild(label);
      host.appendChild(stage);

      /*
       * Measure, then pin. One forced layout here, deliberately: reading every
       * width before writing any of them keeps this to a single reflow rather
       * than one per cell.
       *
       * A ligature cell is measured with its glyph already formed, because the
       * group went in as one text node above — so the width pinned here is the
       * width of `st`, not of `s` plus `t`.
       */
      const widths = cells.map((cell) => cell.el.getBoundingClientRect().width);
      cells.forEach((cell, i) => {
        cell.el.style.width = `${widths[i]}px`;
      });

      // `offset` finished the loop holding the total character count, which is
      // what the wave is measured in.
      const total = offset * stg + dur;
      const began = performance.now();

      const tick = (now: number) => {
        const elapsed = now - began;

        for (const cell of cells) {
          const progress = (elapsed - cell.offset * stg) / dur;

          // An entrance's letter before its turn: still hidden.
          if (entering && progress <= 0) continue;
          if (entering) cell.el.style.removeProperty('visibility');

          if (progress <= 0 || progress >= 1) {
            // Before its turn, or done. Either way it shows the real group,
            // ligature and all.
            if (cell.el.textContent !== cell.real) cell.el.textContent = cell.real;
            cell.el.style.removeProperty('--flap');
            continue;
          }

          // Which card is showing, and how far through its flap it is. The
          // fraction drives the hinge in CSS so each new card swings into place
          // instead of appearing.
          const position = progress * flapsPerChar;
          const card = Math.floor(position);

          /*
           * Every character in the cell advances on the SAME card, so a
           * ligature group rolls as one object and lands as one object. A part
           * with no card in the deck holds its real character while the rest
           * of the group rolls around it.
           */
          const showing = cell.parts
            .map((part) => {
              if (!part.rolls) return part.real;
              const index =
                (((part.from + card) % glyphs.length) + glyphs.length) % glyphs.length;
              return glyphs[index]!;
            })
            .join('');

          cell.el.textContent = showing;
          cell.el.style.setProperty('--flap', String(position - card));
        }

        if (elapsed < total) {
          frame = requestAnimationFrame(tick);
          return;
        }
        stop();
        // Only a flap that ran to its end schedules the next; the cleanup's
        // `stop` never reaches here, so unmounting ends the loop.
        if (autoplay && repeat) replay = setTimeout(() => start(), repeatDuration);
      };

      frame = requestAnimationFrame(tick);
    };

    /*
     * Both directions roll. Arriving and leaving are the same animation, and
     * the only difference is speed: the exit is quicker because it is not
     * telling the reader anything they are waiting for — it is getting out of
     * the way of wherever they just went.
     */
    const enter = () => start();
    const leave = () => {
      // Before the flap, not after: the two are independent, and this one must
      // not be skipped if `start` bails out.
      if (breathe) resetBreath(host);
      start(EXIT_FLAP_SCALE);
    };

    if (flapOnHover) {
      trigger.addEventListener('pointerenter', enter);
      trigger.addEventListener('focusin', enter);
      trigger.addEventListener('pointerleave', leave);
      trigger.addEventListener('focusout', leave);
    }
    startRef.current = start;

    // In this effect, so a new `text` re-runs it: it arrives, or flaps, anew.
    if (animateIn) start(1, true);
    else if (autoplay) start();

    return () => {
      trigger.removeEventListener('pointerenter', enter);
      trigger.removeEventListener('focusin', enter);
      trigger.removeEventListener('pointerleave', leave);
      trigger.removeEventListener('focusout', leave);
      clearTimeout(replay);
      startRef.current = null;
      stop();
    };
  }, [
    text,
    duration,
    stagger,
    glyphs,
    ligatures,
    breathe,
    autoplay,
    repeat,
    repeatDuration,
    animateIn,
    animateInDuration,
    flapOnHover,
  ]);

  /**
   * The self-reveal, taken from a page-wide queue.
   *
   * **One at a time.** Each instance registers a turn rather than running its
   * own clock; `reveal-queue` calls exactly one member at a time and starts the
   * next only once this one has finished. Independent timers meant two or three
   * titles flapping at once on a run of eight, which reads as the page
   * glitching rather than as a sentence surfacing.
   *
   * The rules it has to obey, in one place:
   *
   *   - **Nothing without `blurred`.** There is no resting state to come out
   *     of, so a reveal would be a no-op holding a place in the rotation.
   *   - **Nothing under reduced motion.** The blur fade itself is not movement,
   *     but a thing that repeatedly draws the eye on a page nobody is touching
   *     is exactly what that setting is asking to be spared. Hover still works;
   *     what stops is the unattended part.
   *   - **Nothing where hover is unavailable.** The CSS applies the resting
   *     blur only under `(hover: hover)`, so on a touch screen there is no blur
   *     to undo and toggling the attribute would just flicker `will-change`.
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !blurred || !randomReveal) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    /*
     * Long enough for the flap to finish, whatever `revealHoldMs` says.
     *
     * The run is `characters × stagger + duration` — the wave is measured in
     * characters, and whitespace is not a cell — so a long title takes longer
     * than a short one. Blurring on a fixed hold would cut the last few
     * characters off mid-roll on exactly the titles that took longest to get
     * there, which reads as the effect breaking rather than as it ending.
     *
     * `revealHoldMs` is therefore a floor, not the value: the settled text is
     * held for a beat after the last character lands, so it is legible sharp
     * before it goes.
     */
    const flapMs =
      Array.from(text.replace(/\s+/g, '')).length * stagger + duration;
    const hold = Math.max(revealHoldMs, flapMs + REVEAL_SETTLE_MS);
    const exitMs = flapMs * EXIT_FLAP_SCALE;

    let timer: ReturnType<typeof setTimeout>;

    /**
     * One turn: come sharp and roll, hold, then roll back out and blur.
     *
     * Returns how long all of that takes, which is what stops the queue from
     * starting the next title while this one is still moving.
     */
    const takeTurn = () => {
      host.setAttribute('data-awake', '');
      /*
       * Unblur AND flap. The reveal is the same event as a hover, minus the
       * reader: coming sharp without the roll would show the title arriving by
       * a mechanism the page never uses anywhere else.
       *
       * `start` is a no-op while a flap is already running, so a reveal landing
       * on a title the reader is hovering does nothing rather than restarting
       * it under their pointer.
       */
      startRef.current?.();

      timer = setTimeout(() => {
        // Blur and roll out together, the mirror of coming in — and quicker,
        // for the reason in EXIT_FLAP_SCALE.
        host.removeAttribute('data-awake');
        startRef.current?.(EXIT_FLAP_SCALE);
        // A self-reveal ends the same way a hover does, so the breath restarts
        // from the top for it too.
        if (breathe) resetBreath(host);
      }, hold);

      return hold + exitMs;
    };

    const leave = registerReveal(takeTurn, revealGapMs);

    return () => {
      leave();
      clearTimeout(timer);
      host.removeAttribute('data-awake');
    };
  }, [
    blurred,
    randomReveal,
    revealGapMs,
    revealHoldMs,
    // The hold is computed from these, so a change to any of them has to
    // re-derive it rather than keep holding for the old title's length.
    text,
    stagger,
    duration,
    breathe,
  ]);

  return (
    <span
      ref={hostRef}
      className={className ? `h3-scramble ${className}` : 'h3-scramble'}
      /*
       * Server-rendered, so the resting blur is correct before hydration and
       * correct if the script never arrives. The blur is driven by `:hover` in
       * CSS rather than by this component precisely so that stays true — the
       * failure mode of a JS-controlled blur is body text nobody can read.
       */
      data-blurred={blurred ? '' : undefined}
      /*
       * Only when there is a resting state to modulate. `breathe` on its own
       * would animate between two values the CSS never applies.
       */
      data-breathe={blurred && breathe ? '' : undefined}
      style={
        blurred
          ? ({
              '--h3-scramble-rest-opacity': restOpacity,
              '--h3-scramble-rest-blur': `${restBlur}px`,
              ...(breathe
                ? {
                    /*
                     * `breatheMs` is the MEAN, not the period. Each instance
                     * gets its own within ±BREATHE_SPREAD of it, so a run of
                     * titles drifts apart instead of rising and falling
                     * together at one rate for the life of the page.
                     */
                    '--h3-scramble-breathe-ms': `${rhythm.periodMs}ms`,
                    '--h3-scramble-breathe-depth': breatheDepth,
                    '--h3-scramble-breathe-delay': `${rhythm.delayMs}ms`,
                  }
                : {}),
              /*
               * Asymmetric, and derived from `duration` rather than from the
               * whole run.
               *
               * The full animation is `characters × stagger + duration`, so it
               * is longer for a longer title — pinning the fade to that would
               * give every title in a list a different hover speed, which reads
               * as inconsistency rather than as rhythm. `duration` is one
               * character's flap and is the same everywhere.
               *
               * Coming sharp is 2/5: it answers the reader, and a slow answer
               * feels like lag. Going back is 1/2, because nobody is waiting
               * for it and a fast blur snaps the text away from a pointer that
               * merely passed over.
               */
              '--h3-scramble-wake-ms': `${Math.round((duration * 2) / 5)}ms`,
              '--h3-scramble-sleep-ms': `${Math.round(duration / 2)}ms`,
            } as CSSProperties)
          : undefined
      }
    >
      {text}
    </span>
  );
}
