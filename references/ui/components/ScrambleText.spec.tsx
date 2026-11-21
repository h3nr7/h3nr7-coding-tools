import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ScrambleText, toCells } from './ScrambleText';
import { resetRevealQueue } from '../lib/reveal-queue';

afterEach(cleanup);

/*
 * The flap cells are what decides whether a ligature arrives in one piece or in
 * two — the whole reason this function exists — so the grouping is tested even
 * though nothing here renders.
 */
describe('toCells', () => {
  it('keeps a ligature pair in one cell', () => {
    // 's' and 't' fuse into a single glyph, so they have to flap together.
    expect(toCells('still')).toEqual(['st', 'i', 'l', 'l']);
  });

  it('groups every pair in the face, not just the first', () => {
    expect(toCells('structure')).toEqual(['st', 'r', 'u', 'ct', 'u', 'r', 'e']);
  });

  it('prefers the longest ligature at each position', () => {
    /*
     * The ordering rule, and the reason DEFAULT_LIGATURES is longest-first.
     * Matched greedily in the wrong order this is ['ff', 'i', ...] and the
     * three-character glyph never forms.
     */
    expect(toCells('affix')).toEqual(['a', 'ffi', 'x']);
  });

  it('leaves ordinary characters alone', () => {
    expect(toCells('Boids')).toEqual(['B', 'o', 'i', 'd', 's']);
  });

  it('groups the pairs a scan of the face found, not the ones folklore expects', () => {
    /*
     * `it` is the one that surfaced the bug: Mrs Eaves Italic fuses it, most
     * faces do not, and a list written from memory omits it — so "identity"
     * jumped. `ee` and `Th` are in the same category.
     */
    expect(toCells('identity')).toEqual(['i', 'd', 'e', 'n', 't', 'it', 'y']);
    expect(toCells('three')).toEqual(['t', 'h', 'r', 'ee']);
    expect(toCells('Three')).toEqual(['Th', 'r', 'ee']);
  });

  it('groups interlocking capitals, which is where a title lives', () => {
    expect(toCells('VAULT')).toEqual(['VA', 'UL', 'T']);
    expect(toCells('BOOK')).toEqual(['B', 'OO', 'K']);
  });

  it('does not group pairs the published set claims but this kit does not draw', () => {
    /*
     * A widely-copied Mrs Eaves ligature list includes these. Measured against
     * the served webfont every one is a flat 0.000 in both cuts, and grouping
     * them would flip half of every ordinary word two letters at a time.
     *
     * This test is the guard on that decision: it fails the moment someone
     * pastes the published list in without re-running the scan.
     */
    for (const word of ['as', 'co', 'll', 'oo', 're', 'ri', 'tr', 'tu']) {
      expect(toCells(word)).toEqual([word[0], word[1]]);
    }
    expect(toCells('the')).toEqual(['t', 'h', 'e']);
    expect(toCells('and')).toEqual(['a', 'n', 'd']);
    expect(toCells('for')).toEqual(['f', 'o', 'r']);
    expect(toCells('CO')).toEqual(['C', 'O']);
    expect(toCells('AR')).toEqual(['A', 'R']);
  });

  it('treats ff plus a letter as ff, since only ffi and ffl are their own glyph', () => {
    // "ffe" measures exactly ff's own delta, so it is ff + e — not a
    // three-character glyph, and grouping all three would be wrong.
    expect(toCells('ffe')).toEqual(['ff', 'e']);
    expect(toCells('ffi')).toEqual(['ffi']);
    expect(toCells('ffl')).toEqual(['ffl']);
  });

  it('does not group across a capital', () => {
    // "St" is two glyphs — the ligature is lowercase only, so grouping them
    // would pin a width the font never draws.
    expect(toCells('Stop')).toEqual(['S', 't', 'o', 'p']);
  });

  it('does not run past the end of the word', () => {
    // A word ending in the first character of a ligature must not match it:
    // 's' alone is not 'st'.
    expect(toCells('as')).toEqual(['a', 's']);
  });

  it('counts by code point, so an astral character stays whole', () => {
    // Array indexing would split this into two lone surrogates and render two
    // replacement characters.
    expect(toCells('a😀b')).toEqual(['a', '😀', 'b']);
  });

  it('takes a different set for a face with a different table', () => {
    expect(toCells('street', ['tr'])).toEqual(['s', 'tr', 'e', 'e', 't']);
  });
});

describe('ScrambleText', () => {
  it('server-renders the plain string', () => {
    // What ships in the HTML, what a crawler reads and what a visitor copies.
    // The split into cells exists only while the effect is running.
    render(<ScrambleText text="still life" />);
    expect(screen.getByText('still life')).toBeInTheDocument();
  });

  it('builds a ligature group as ONE cell, so it arrives in one piece', async () => {
    /*
     * The regression this guards: with `st` split across two cells the two
     * characters get different stagger offsets, the `s` settles first, and the
     * already-settled `s` then visibly changes shape when the `t` lands beside
     * it and the pair fuses.
     *
     * jsdom has no font metrics, so this asserts the STRUCTURE — one cell
     * holding "st" — which is the part that decides the timing. Whether the
     * glyph fuses is the font's business, and is measured in the browser.
     */
    const { container } = render(<ScrambleText text="still" />);
    const host = container.querySelector('.h3-scramble') as HTMLElement;

    // matchMedia is read at activation, and jsdom does not implement it.
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia;

    host.dispatchEvent(new Event('pointerenter'));

    const cells = [...container.querySelectorAll('.h3-scramble-char')];
    expect(cells.map((cell) => cell.textContent)).toEqual(['st', 'i', 'l', 'l']);
  });

  describe('autoplay', () => {
    const motion = (reduce: boolean) => {
      window.matchMedia = ((query: string) => ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })) as unknown as typeof window.matchMedia;
    };
    const flapping = (container: HTMLElement) =>
      container.querySelector('.h3-scramble')!.hasAttribute('data-flapping');

    afterEach(() => vi.useRealTimers());

    it('flaps on mount without a pointer, and again on new text', () => {
      motion(false);
      const { container, rerender } = render(<ScrambleText text="Thinking" autoplay />);
      expect(flapping(container)).toBe(true);
      rerender(<ScrambleText text="Checking" autoplay />);
      expect(flapping(container)).toBe(true);
    });

    it('with repeat, flaps again after repeatDuration, and stops when unmounted', () => {
      motion(false);
      vi.useFakeTimers();
      const onFlapStart = vi.fn();
      const { container, unmount } = render(
        <ScrambleText text="Hi" autoplay repeat onFlapStart={onFlapStart} />,
      );
      // The callback ref is set in an effect after the first flap started.
      onFlapStart.mockClear();
      // The first flap (2 × 26 + 460ms) runs out on the fake rAF clock...
      act(() => vi.advanceTimersByTime(600));
      expect(flapping(container)).toBe(false);
      // ...then the default 0.25s pause, and the next one begins.
      act(() => vi.advanceTimersByTime(300));
      expect(onFlapStart).toHaveBeenCalledOnce();
      expect(flapping(container)).toBe(true);

      unmount();
      onFlapStart.mockClear();
      act(() => vi.advanceTimersByTime(5000));
      expect(onFlapStart).not.toHaveBeenCalled();
    });

    it('without repeat, flaps once', () => {
      motion(false);
      vi.useFakeTimers();
      const { container } = render(<ScrambleText text="Hi" autoplay />);
      act(() => vi.advanceTimersByTime(3000));
      expect(flapping(container)).toBe(false);
    });

    it('does nothing under reduced motion', () => {
      motion(true);
      const { container } = render(<ScrambleText text="Thinking" autoplay repeat />);
      expect(flapping(container)).toBe(false);
    });

    it('does nothing without autoplay', () => {
      motion(false);
      const { container } = render(<ScrambleText text="Thinking" />);
      expect(flapping(container)).toBe(false);
    });
  });

  describe('animateIn', () => {
    const motion = (reduce: boolean) => {
      window.matchMedia = ((query: string) => ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })) as unknown as typeof window.matchMedia;
    };
    const host = (container: HTMLElement) => container.querySelector<HTMLElement>('.h3-scramble')!;
    const cells = (container: HTMLElement) => [
      ...container.querySelectorAll<HTMLElement>('.h3-scramble-char'),
    ];

    afterEach(() => vi.useRealTimers());

    it('hides each letter until its turn, and lands the whole text in 0.65s by default', () => {
      motion(false);
      vi.useFakeTimers();
      const { container } = render(<ScrambleText text="Hello there" animateIn />);
      expect(host(container).hasAttribute('data-flapping')).toBe(true);
      // Nothing has had its turn yet: the first and last letters are both hidden.
      expect(cells(container)[0]!.style.visibility).toBe('hidden');
      expect(cells(container).at(-1)!.style.visibility).toBe('hidden');

      act(() => vi.advanceTimersByTime(300));
      // Partway: the first letters are in, the last is still to come.
      expect(cells(container)[0]!.style.visibility).not.toBe('hidden');
      expect(cells(container).at(-1)!.style.visibility).toBe('hidden');

      act(() => vi.advanceTimersByTime(300));
      expect(host(container).hasAttribute('data-flapping')).toBe(true);
      act(() => vi.advanceTimersByTime(100));
      expect(host(container).hasAttribute('data-flapping')).toBe(false);
      expect(host(container).textContent).toBe('Hello there');
    });

    it('takes the whole entrance from animateInDuration', () => {
      motion(false);
      vi.useFakeTimers();
      const { container } = render(<ScrambleText text="Hello there" animateIn animateInDuration={1200} />);
      act(() => vi.advanceTimersByTime(1100));
      expect(host(container).hasAttribute('data-flapping')).toBe(true);
      act(() => vi.advanceTimersByTime(150));
      expect(host(container).hasAttribute('data-flapping')).toBe(false);
    });

    it('keeps the whole text for a screen reader while it animates in', () => {
      motion(false);
      const { container } = render(<ScrambleText text="Hello there" animateIn />);
      expect(container.querySelector('.h3-visually-hidden')).toHaveTextContent('Hello there');
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('shows the text as it is under reduced motion', () => {
      motion(true);
      const { container } = render(<ScrambleText text="Hello there" animateIn />);
      expect(host(container).hasAttribute('data-flapping')).toBe(false);
      expect(host(container).textContent).toBe('Hello there');
    });

    it('does not animate in without the prop', () => {
      motion(false);
      const { container } = render(<ScrambleText text="Hello there" />);
      expect(host(container).hasAttribute('data-flapping')).toBe(false);
    });

    it('with flapOnHover off, a pointer leaves it alone', () => {
      motion(false);
      const { container } = render(<ScrambleText text="Hello there" flapOnHover={false} />);
      act(() => {
        host(container).dispatchEvent(new Event('pointerenter'));
      });
      expect(host(container).hasAttribute('data-flapping')).toBe(false);
    });
  });

  describe('blurred at rest', () => {
    const host = (container: HTMLElement) =>
      container.querySelector('.h3-scramble') as HTMLElement;

    it('marks itself blurred in the server-rendered markup', () => {
      /*
       * The attribute has to be in the HTML, not applied on hydration: the
       * blur is driven by `:hover` in CSS precisely so it is right before the
       * script lands and right if it never does.
       */
      const { container } = render(<ScrambleText text="still life" blurred />);
      expect(host(container)).toHaveAttribute('data-blurred');
    });

    it('carries nothing at all when the prop is off', () => {
      // The default must stay free of the custom properties, or every existing
      // caller pays for a feature it did not ask for.
      const { container } = render(<ScrambleText text="still life" />);
      expect(host(container)).not.toHaveAttribute('data-blurred');
      expect(host(container).getAttribute('style')).toBeNull();
    });

    it('unblurs faster than it re-blurs', () => {
      /*
       * The asymmetry IS the effect: coming sharp answers the reader, so it is
       * quick (2/5 of a flap); going back is slower (1/2) because nobody is
       * waiting for it and a fast blur snaps the text away from a pointer that
       * merely passed over.
       */
      const { container } = render(
        <ScrambleText text="still life" blurred duration={500} />,
      );
      const style = host(container).style;
      expect(style.getPropertyValue('--h3-scramble-wake-ms')).toBe('200ms');
      expect(style.getPropertyValue('--h3-scramble-sleep-ms')).toBe('250ms');
    });

    it('takes the resting opacity and blur from its props', () => {
      const { container } = render(
        <ScrambleText text="still life" blurred restOpacity={0.4} restBlur={6} />,
      );
      const style = host(container).style;
      expect(style.getPropertyValue('--h3-scramble-rest-opacity')).toBe('0.4');
      expect(style.getPropertyValue('--h3-scramble-rest-blur')).toBe('6px');
    });

    it('always states a resting opacity and blur, prop or default', () => {
      /*
       * Deliberately not asserting the numbers. They are a look, and a look
       * gets tuned — a test pinning 0.7 fails the moment someone nudges it to
       * 0.55, which is a passing change reported as a broken one. What must
       * hold is that BOTH properties are written, because the CSS falls back
       * silently and a missing one shows up as text that never sharpens.
       */
      const { container } = render(<ScrambleText text="still life" blurred />);
      const style = host(container).style;
      expect(style.getPropertyValue('--h3-scramble-rest-opacity')).not.toBe('');
      expect(style.getPropertyValue('--h3-scramble-rest-blur')).toMatch(/px$/);
    });
  });

  describe('breathing', () => {
    const host = (container: HTMLElement) =>
      container.querySelector('.h3-scramble') as HTMLElement;

    it('marks itself, and states the cycle and the depth', () => {
      const { container } = render(
        <ScrambleText text="still life" blurred breathe breatheMs={4000} breatheDepth={0.25} />,
      );
      const style = host(container).style;
      expect(host(container)).toHaveAttribute('data-breathe');
      expect(style.getPropertyValue('--h3-scramble-breathe-depth')).toBe('0.25');

      // `breatheMs` is the MEAN, not the period — each instance takes its own
      // within the spread, so this is a range rather than an equality.
      const period = Number(
        style.getPropertyValue('--h3-scramble-breathe-ms').replace('ms', ''),
      );
      expect(period).toBeGreaterThan(4000 * 0.8);
      expect(period).toBeLessThan(4000 * 1.2);
    });

    it('does not breathe without a resting state to breathe from', () => {
      // The keyframes interpolate the rest blur and opacity, which only exist
      // when `blurred` is on. Alone, this would animate between two values the
      // CSS never applies.
      const { container } = render(<ScrambleText text="still life" breathe />);
      expect(host(container)).not.toHaveAttribute('data-breathe');
    });

    it('leaves the properties off entirely when not breathing', () => {
      const { container } = render(<ScrambleText text="still life" blurred />);
      const style = host(container).style;
      expect(host(container)).not.toHaveAttribute('data-breathe');
      expect(style.getPropertyValue('--h3-scramble-breathe-ms')).toBe('');
      expect(style.getPropertyValue('--h3-scramble-breathe-delay')).toBe('');
    });

    it('starts each instance partway through, with a negative delay', () => {
      // A positive delay would make the breath start LATE — every title holding
      // still and then beginning — rather than starting mid-cycle.
      const { container } = render(
        <ScrambleText text="still life" blurred breathe breatheMs={5000} />,
      );
      const delay = host(container).style.getPropertyValue(
        '--h3-scramble-breathe-delay',
      );
      const ms = Number(delay.replace('ms', ''));
      expect(ms).toBeLessThanOrEqual(0);
      expect(ms).toBeGreaterThan(-5000);
    });

    it('gives every title its own period, not just its own phase', () => {
      /*
       * A shared phase offset is not enough. Titles started at different points
       * of the SAME cycle still rise and fall at one rate, so the run reads as
       * one organism with a delay line — and any two that begin near each other
       * stay near each other for as long as the page is open. Different periods
       * are what make them drift.
       */
      const { container } = render(
        <>
          <ScrambleText text="A brand identity" blurred breathe breatheMs={5000} />
          <ScrambleText text="Physics Basics" blurred breathe breatheMs={5000} />
          <ScrambleText text="R3F Boids" blurred breathe breatheMs={5000} />
          <ScrambleText text="Dynamic CV" blurred breathe breatheMs={5000} />
        </>,
      );
      const periods = [...container.querySelectorAll('.h3-scramble')].map((element) =>
        (element as HTMLElement).style.getPropertyValue('--h3-scramble-breathe-ms'),
      );

      expect(new Set(periods).size).toBe(periods.length);

      // Around the mean, not wandering off it: no title reads as hurried or
      // becalmed beside its neighbours.
      for (const period of periods) {
        const ms = Number(period.replace('ms', ''));
        expect(ms).toBeGreaterThan(5000 * 0.8);
        expect(ms).toBeLessThan(5000 * 1.2);
      }
    });

    it('gives different titles different phases', () => {
      /*
       * The point of the phase at all. Identical delays mean a run of titles
       * inhales in unison, which is a pulse rather than a page breathing.
       */
      const { container } = render(
        <>
          <ScrambleText text="A brand identity" blurred breathe />
          <ScrambleText text="Physics Basics" blurred breathe />
          <ScrambleText text="R3F Boids" blurred breathe />
          <ScrambleText text="Dynamic CV" blurred breathe />
        </>,
      );
      const delays = [...container.querySelectorAll('.h3-scramble')].map((element) =>
        (element as HTMLElement).style.getPropertyValue('--h3-scramble-breathe-delay'),
      );
      expect(new Set(delays).size).toBe(delays.length);
    });

    it('sends the breath back to the top of its cycle when the reader leaves', () => {
      /*
       * The reset. The phase delay exists to scatter a run of titles on load;
       * once one has been hovered, its phase has served its purpose and the
       * next breath should start from the beginning.
       *
       * Clearing the delay is part of it: with a negative delay still in place,
       * `currentTime = 0` lands partway through the cycle rather than at its
       * start.
       */
      const timing: { delay?: number }[] = [];
      let currentTime: number | null = null;
      const fake = {
        animationName: 'h3-scramble-breathe',
        effect: { updateTiming: (t: { delay?: number }) => timing.push(t) },
        set currentTime(value: number | null) {
          currentTime = value;
        },
      };

      const { container } = render(
        <ScrambleText text="still life" blurred breathe />,
      );
      const element = host(container);
      // jsdom implements neither CSS animations nor getAnimations.
      element.getAnimations = () => [fake as unknown as Animation];

      /*
       * Dispatched on the host itself, which IS the trigger here: the component
       * listens on the nearest `a`/`button` and falls back to its own span when
       * there is none, so a bare render binds to the span.
       */
      element.dispatchEvent(new Event('pointerleave'));

      expect(timing).toEqual([{ delay: 0 }]);
      expect(currentTime).toBe(0);
    });

    it('leaves other animations on the element alone', () => {
      // The flap writes its own styles and the card has its own transitions;
      // resetting anything that is not the breath would be a side effect.
      let touched = false;
      const other = {
        animationName: 'something-else',
        effect: {
          updateTiming: () => {
            touched = true;
          },
        },
        set currentTime(_value: number | null) {
          touched = true;
        },
      };

      const { container } = render(
        <ScrambleText text="still life" blurred breathe />,
      );
      const element = host(container);
      element.getAnimations = () => [other as unknown as Animation];

      element.dispatchEvent(new Event('pointerleave'));
      expect(touched).toBe(false);
    });

    it('survives a browser with no getAnimations at all', () => {
      // jsdom is one. The reset is decoration; it must never take the leave
      // handler down with it, which also runs the exit flap.
      const { container } = render(
        <ScrambleText text="still life" blurred breathe />,
      );
      expect(() =>
        host(container).dispatchEvent(new Event('pointerleave')),
      ).not.toThrow();
    });

    it('derives the phase from the text, so it survives hydration', () => {
      /*
       * The reason `breathPhase` hashes rather than calling Math.random.
       *
       * This value is rendered into the markup, so it is computed on the server
       * too. A random one would differ between the two renders, React would
       * report a hydration mismatch, and it would then discard the server's
       * HTML — a real cost for a decoration. Rendering the same text twice must
       * produce the same delay.
       */
      const { container: first } = render(<ScrambleText text="still life" blurred breathe />);
      const { container: second } = render(<ScrambleText text="still life" blurred breathe />);
      const read = (c: HTMLElement) =>
        host(c).style.getPropertyValue('--h3-scramble-breathe-delay');
      expect(read(first)).toBe(read(second));
      expect(read(first)).not.toBe('');
    });
  });

  describe('randomReveal', () => {
    /** jsdom implements neither, and both are read before a turn is taken. */
    function stubMedia(matches: (query: string) => boolean) {
      window.matchMedia = ((query: string) => ({
        matches: matches(query),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })) as unknown as typeof window.matchMedia;
    }

    const canHover = (query: string) => query.includes('hover');

    beforeEach(() => {
      vi.useFakeTimers();
      stubMedia(canHover);
      /*
       * The gap is `mean × (0.5 + random)`, so a real `Math.random` puts each
       * turn somewhere in a 1000ms window and every assertion after the first
       * lands in an ambiguous one — a test that passes or fails on the draw.
       * Pinned to 0.5, the gap is exactly the mean and the whole schedule is
       * arithmetic. The randomness itself is covered by `reveal-queue.spec`.
       */
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      // Module-level state, so one test's members would otherwise still be in
      // the rotation during the next.
      resetRevealQueue();
    });

    afterEach(() => {
      resetRevealQueue();
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    const hosts = (container: HTMLElement) =>
      [...container.querySelectorAll('.h3-scramble')] as HTMLElement[];
    const host = (container: HTMLElement) => hosts(container)[0]!;
    const awake = (container: HTMLElement) =>
      hosts(container).filter((h) => h.hasAttribute('data-awake')).length;

    it('surfaces on its own, then goes back', () => {
      const { container } = render(
        <ScrambleText
          text="still life"
          blurred
          randomReveal
          revealGapMs={1000}
          // Well above the flap's own run, so the hold is this number and the
          // test does not depend on the animation's length.
          revealHoldMs={5000}
        />,
      );

      // Asleep to begin with: a full gap before the first turn, so a freshly
      // loaded page is still for a moment rather than opening with a reveal.
      expect(host(container)).not.toHaveAttribute('data-awake');

      act(() => void vi.advanceTimersByTime(1000));
      expect(host(container)).toHaveAttribute('data-awake');

      act(() => void vi.advanceTimersByTime(5000));
      expect(host(container)).not.toHaveAttribute('data-awake');

      // And it comes back round, rather than firing once.
      act(() => void vi.advanceTimersByTime(2000));
      expect(host(container)).toHaveAttribute('data-awake');
    });

    it('reveals one at a time, never two at once', () => {
      /*
       * The reason the queue exists. With a timer each, eight titles on a page
       * overlapped constantly — two or three flapping together reads as the
       * page glitching rather than as a sentence surfacing.
       */
      const { container } = render(
        <>
          <ScrambleText text="one" blurred randomReveal revealGapMs={500} revealHoldMs={2000} />
          <ScrambleText text="two" blurred randomReveal revealGapMs={500} revealHoldMs={2000} />
          <ScrambleText text="six" blurred randomReveal revealGapMs={500} revealHoldMs={2000} />
        </>,
      );

      let sawOverlap = false;
      let sawAReveal = false;
      for (let i = 0; i < 200; i++) {
        act(() => void vi.advanceTimersByTime(100));
        const n = awake(container);
        if (n > 1) sawOverlap = true;
        if (n === 1) sawAReveal = true;
      }

      expect(sawAReveal).toBe(true);
      expect(sawOverlap).toBe(false);
    });

    it('gives every instance a turn, in registration order', () => {
      const { container } = render(
        <>
          <ScrambleText text="one" blurred randomReveal revealGapMs={500} revealHoldMs={1000} />
          <ScrambleText text="two" blurred randomReveal revealGapMs={500} revealHoldMs={1000} />
          <ScrambleText text="six" blurred randomReveal revealGapMs={500} revealHoldMs={1000} />
        </>,
      );

      const order: number[] = [];
      const seen = [false, false, false];
      for (let i = 0; i < 400; i++) {
        act(() => void vi.advanceTimersByTime(50));
        hosts(container).forEach((element, index) => {
          const isAwake = element.hasAttribute('data-awake');
          if (isAwake && !seen[index]) order.push(index);
          seen[index] = isAwake;
        });
      }

      // FIFO: first registered goes first, and the rotation wraps.
      expect(order.slice(0, 4)).toEqual([0, 1, 2, 0]);
    });

    it('runs the flap as well as unblurring', () => {
      /*
       * A reveal is the whole effect, not half of it. Coming sharp without the
       * roll would show a title arriving by a mechanism the page uses nowhere
       * else.
       *
       * The split into cells is the flap's own scaffolding and exists only
       * while it runs, so finding it IS the animation having started.
       */
      const { container } = render(
        <ScrambleText
          text="still life"
          blurred
          randomReveal
          revealGapMs={1000}
          revealHoldMs={5000}
        />,
      );
      expect(container.querySelectorAll('.h3-scramble-char')).toHaveLength(0);

      act(() => void vi.advanceTimersByTime(1000));
      expect(host(container)).toHaveAttribute('data-flapping');
      expect(
        container.querySelectorAll('.h3-scramble-char').length,
      ).toBeGreaterThan(0);
    });

    it('flaps on the way out too, not only on the way in', () => {
      const { container } = render(
        <ScrambleText
          text="still life"
          blurred
          randomReveal
          revealGapMs={1000}
          revealHoldMs={2000}
        />,
      );

      act(() => void vi.advanceTimersByTime(1000));
      // Let the entry flap finish, so a second `data-flapping` can only be the
      // exit rather than the tail of the entry.
      act(() => void vi.advanceTimersByTime(1500));
      expect(host(container)).not.toHaveAttribute('data-flapping');

      act(() => void vi.advanceTimersByTime(600));
      expect(host(container)).not.toHaveAttribute('data-awake');
      expect(host(container)).toHaveAttribute('data-flapping');
    });

    it('holds long enough for a long title to finish flapping', () => {
      /*
       * `revealHoldMs` is a floor. The run is `characters × stagger +
       * duration`, so a fixed hold would blur the last characters of a long
       * title mid-roll — on exactly the titles that took longest to get there.
       *
       * 20 characters × 50 + 400 = 1400ms of flapping, so a 100ms hold must be
       * ignored in favour of that plus the settle beat.
       */
      const { container } = render(
        <ScrambleText
          text="aaaaaaaaaaaaaaaaaaaa"
          blurred
          randomReveal
          revealGapMs={5000}
          revealHoldMs={100}
          stagger={50}
          duration={400}
        />,
      );

      act(() => void vi.advanceTimersByTime(5000));
      expect(host(container)).toHaveAttribute('data-awake');

      /*
       * Measure how long it actually held, rather than asserting a settle
       * value.
       *
       * This used to advance a hardcoded 2000ms, on the arithmetic
       * `1400 + REVEAL_SETTLE_MS`. That made a tuning constant part of the
       * test's contract: retuning the settle beat — a number chosen by eye,
       * exactly the kind that gets changed — failed this test without anything
       * being broken.
       *
       * The property is that the 100ms hold it was given loses to the length of
       * the flap. So: step until it blurs, and check it outlasted the roll.
       */
      const FLAP_MS = 20 * 50 + 400;
      const LIMIT = 20_000;
      let held = 0;
      while (host(container)?.hasAttribute('data-awake') && held < LIMIT) {
        act(() => void vi.advanceTimersByTime(100));
        held += 100;
      }

      expect(held).toBeGreaterThanOrEqual(FLAP_MS);
      // It does end. Without this the assertion above passes on a title that
      // never blurs again.
      expect(held).toBeLessThan(LIMIT);
    });

    it('does nothing without `blurred`, having nothing to reveal', () => {
      const { container } = render(
        <ScrambleText text="still life" randomReveal revealGapMs={10} />,
      );
      act(() => void vi.advanceTimersByTime(5_000));
      expect(host(container)).not.toHaveAttribute('data-awake');
    });

    it('stays still under prefers-reduced-motion', () => {
      /*
       * The blur fade is not movement, but a thing that repeatedly draws the
       * eye on a page nobody is touching is what the setting is asking to be
       * spared. Hover is unaffected; the unattended part stops.
       */
      stubMedia(() => true);
      const { container } = render(
        <ScrambleText text="still life" blurred randomReveal revealGapMs={10} />,
      );
      act(() => void vi.advanceTimersByTime(5_000));
      expect(host(container)).not.toHaveAttribute('data-awake');
    });

    it('stays still where hovering is impossible', () => {
      // The CSS applies the resting blur only under `(hover: hover)`, so on a
      // touch screen there is no blur to undo.
      stubMedia((query) => !query.includes('hover'));
      const { container } = render(
        <ScrambleText text="still life" blurred randomReveal revealGapMs={10} />,
      );
      act(() => void vi.advanceTimersByTime(5_000));
      expect(host(container)).not.toHaveAttribute('data-awake');
    });
  });

  /**
   * The flap callbacks.
   *
   * These are how `@h3nr7/audio` attaches a sound without this package learning
   * that audio exists. What they must guarantee is a strict pairing — a caller
   * holds a resource between them — and that they describe the ANIMATION rather
   * than the pointer, since a flap has three triggers and only one is a hover.
   */
  describe('flap callbacks', () => {
    function stubMedia(reduce = false) {
      window.matchMedia = ((query: string) => ({
        matches: reduce ? query.includes('reduced-motion') : false,
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })) as unknown as typeof window.matchMedia;
    }

    const host = (container: HTMLElement) =>
      container.querySelector('.h3-scramble') as HTMLElement;

    beforeEach(() => stubMedia());
    afterEach(() => vi.restoreAllMocks());

    it('reports a flap starting', () => {
      const onFlapStart = vi.fn();
      const { container } = render(
        <ScrambleText text="still" onFlapStart={onFlapStart} />,
      );

      host(container).dispatchEvent(new Event('pointerenter'));
      expect(onFlapStart).toHaveBeenCalledTimes(1);
    });

    it('reports it once, however many times the trigger fires', () => {
      // A self-reveal landing on a title already under the pointer must not
      // open a second voice — `start` is a no-op while one is running.
      const onFlapStart = vi.fn();
      const { container } = render(
        <ScrambleText text="still" onFlapStart={onFlapStart} />,
      );

      host(container).dispatchEvent(new Event('pointerenter'));
      host(container).dispatchEvent(new Event('pointerenter'));
      host(container).dispatchEvent(new Event('focusin'));

      expect(onFlapStart).toHaveBeenCalledTimes(1);
    });

    it('reports the end when the flap is cleaned up', () => {
      const onFlapStart = vi.fn();
      const onFlapEnd = vi.fn();
      const { container, unmount } = render(
        <ScrambleText
          text="still"
          onFlapStart={onFlapStart}
          onFlapEnd={onFlapEnd}
        />,
      );

      host(container).dispatchEvent(new Event('pointerenter'));
      expect(onFlapEnd).not.toHaveBeenCalled();

      unmount();
      expect(onFlapEnd).toHaveBeenCalledTimes(1);
    });

    it('does not report an end that never had a beginning', () => {
      /*
       * `stop` is the effect's cleanup as well as the animation's natural end,
       * so it runs on every unmount whether or not anything flapped. A caller
       * pairing the two would otherwise release a resource it never took.
       */
      const onFlapEnd = vi.fn();
      const { unmount } = render(
        <ScrambleText text="still" onFlapEnd={onFlapEnd} />,
      );

      unmount();
      expect(onFlapEnd).not.toHaveBeenCalled();
    });

    it('fires for the exit roll too, not only the arrival', () => {
      /*
       * Leaving is the same animation played faster, and it is a flap in its
       * own right — so anything bound to these follows the ANIMATION rather
       * than the pointer. That distinction is the whole reason the callbacks
       * live in `start`/`stop` instead of on the listeners: a hover is one of
       * three triggers, alongside focus and the unattended self-reveal.
       *
       * Dispatched without a preceding `pointerenter`, which is not a
       * contrivance: `start` is a no-op while a flap is running, so the exit
       * only ever rolls once the arrival has settled.
       */
      const onFlapStart = vi.fn();
      const { container } = render(
        <ScrambleText text="still" onFlapStart={onFlapStart} />,
      );

      host(container).dispatchEvent(new Event('pointerleave'));
      expect(onFlapStart).toHaveBeenCalledTimes(1);
    });

    it('fires when the text reveals itself, with no reader involved', () => {
      // The third trigger. A page nobody is touching still flaps, so anything
      // hung off these happens unattended too — by design, and worth asserting
      // rather than discovering.
      const onFlapStart = vi.fn();
      const { container } = render(
        <ScrambleText text="still" onFlapStart={onFlapStart} />,
      );

      host(container).dispatchEvent(new Event('focusin'));
      expect(onFlapStart).toHaveBeenCalledTimes(1);
    });

    it('stays silent under prefers-reduced-motion', () => {
      /*
       * Free, and it must stay free: `onFlapStart` sits BELOW the reduced-motion
       * guard inside `start`, so there is no second condition here that could
       * drift out of step with the one that stops the animation.
       */
      stubMedia(true);
      const onFlapStart = vi.fn();
      const onFlapEnd = vi.fn();
      const { container, unmount } = render(
        <ScrambleText
          text="still"
          onFlapStart={onFlapStart}
          onFlapEnd={onFlapEnd}
        />,
      );

      host(container).dispatchEvent(new Event('pointerenter'));
      unmount();

      expect(onFlapStart).not.toHaveBeenCalled();
      expect(onFlapEnd).not.toHaveBeenCalled();
    });

    it('does not restart the animation when an inline callback changes identity', () => {
      /*
       * The reason these are read through a ref rather than listed as effect
       * dependencies. An inline arrow is the obvious way to write a callback at
       * a call site; if that rebuilt the effect, a parent re-render would tear
       * down the listeners and cancel a flap in progress — a title stopping
       * mid-roll because an unrelated sibling updated.
       */
      const onFlapStart = vi.fn();
      const { container, rerender } = render(
        <ScrambleText text="still" onFlapStart={() => onFlapStart()} />,
      );

      host(container).dispatchEvent(new Event('pointerenter'));
      expect(onFlapStart).toHaveBeenCalledTimes(1);

      // A new function identity, every time, exactly as an inline arrow gives.
      rerender(<ScrambleText text="still" onFlapStart={() => onFlapStart()} />);

      // Still flapping: the effect was not rebuilt, so `running` is still true
      // and a fresh trigger is still a no-op.
      host(container).dispatchEvent(new Event('pointerenter'));
      expect(onFlapStart).toHaveBeenCalledTimes(1);
      expect(host(container)).toHaveAttribute('data-flapping');
    });

    it('works with neither callback given', () => {
      const { container, unmount } = render(<ScrambleText text="still" />);
      expect(() => {
        host(container).dispatchEvent(new Event('pointerenter'));
        unmount();
      }).not.toThrow();
    });
  });
});
