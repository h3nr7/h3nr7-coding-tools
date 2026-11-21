import { useId } from 'react';
import { cn } from '../lib/cn';
import { Slider } from './Slider';
import { Switch } from './Switch';

/**
 * Folders of live controls: a switch or a slider per row, a card per folder.
 *
 * Data in, changes out. It holds no state and knows nothing about where the
 * values live, so anything with a handful of settings to tweak can draw them
 * with this: today the canvas dev tool (`apps/web/app/components/canvas-devtool.tsx`
 * feeds it from `@h3nr7/canvas`), later anything else.
 *
 * Styled here, with the site's tokens, so a consumer gets the look without a
 * stylesheet. The card matches `.h3-card` in `apps/web/app/app.css` (surface,
 * `--radius-lg`, `--space-3`, `--text-sm`), so a folder sits in the navi's
 * panel as Explore's cards do. Each part also carries an `h3-controls-*` class
 * for anything that wants to override it.
 *
 * Folder names are `<p>`, not headings: a site stylesheet may set h1 to h4 in
 * the display face unlayered, which no utility here can override. Each folder
 * is a labelled `group`, which is what a screen reader needs from it.
 */

/** One control. The same shape `@h3nr7/canvas`'s dev-tool store hands out. */
export type ControlsItem =
  | { key: string; label: string; type: 'boolean'; value: boolean }
  | {
      key: string;
      label: string;
      type: 'number';
      value: number;
      min: number;
      max: number;
      step: number;
    };

export type ControlsFolder = { name: string; controls: readonly ControlsItem[] };

export type ControlsProps = {
  folders: readonly ControlsFolder[];
  onChange: (folder: string, key: string, value: boolean | number) => void;
  /** Shown when there are no folders. */
  empty?: string;
  className?: string;
};

const CARD = cn(
  'bg-surface text-ink',
  'rounded-[var(--radius-lg)] p-[var(--space-3)]',
  'text-[length:var(--text-sm)] leading-[var(--leading-normal)]',
);

export function Controls({
  folders,
  onChange,
  empty = 'Nothing registered',
  className,
}: ControlsProps) {
  if (folders.length === 0) {
    return (
      <div className={cn('h3-controls', className)}>
        <p className={cn('h3-controls-empty', CARD, 'text-ink-muted')}>{empty}</p>
      </div>
    );
  }

  return (
    <div className={cn('h3-controls flex flex-col gap-[var(--space-1)]', className)}>
      {folders.map((folder) => (
        <Folder key={folder.name} folder={folder} onChange={onChange} />
      ))}
    </div>
  );
}

function Folder({
  folder,
  onChange,
}: {
  folder: ControlsFolder;
  onChange: ControlsProps['onChange'];
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      className={cn('h3-controls-folder flex flex-col gap-[var(--space-2)]', CARD)}
    >
      <p id={id} className="h3-controls-name font-medium">
        {folder.name}
      </p>
      {folder.controls.map((control) => (
        <Row
          key={control.key}
          control={control}
          onChange={(value) => onChange(folder.name, control.key, value)}
        />
      ))}
    </div>
  );
}

/** Decimal places a step implies: 1 → 0, 0.05 → 2. For the readout. */
function decimals(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

function Row({
  control,
  onChange,
}: {
  control: ControlsItem;
  onChange: (value: boolean | number) => void;
}) {
  const id = useId();
  const row = 'h3-controls-row flex items-center justify-between gap-[var(--space-2)]';
  const label = (
    <label htmlFor={id} id={`${id}-label`} className="h3-controls-label min-w-0 flex-1 text-ink-muted">
      {control.label}
    </label>
  );

  if (control.type === 'boolean') {
    return (
      <div className={row}>
        {label}
        <Switch id={id} checked={control.value} onCheckedChange={(checked) => onChange(checked)} />
      </div>
    );
  }

  return (
    <div className={row}>
      {label}
      {/* The slider takes a fixed share of the row, the readout a fixed width,
          so a value changing length does not shove the track about. */}
      <Slider
        id={id}
        aria-labelledby={`${id}-label`}
        className="w-28 shrink-0"
        min={control.min}
        max={control.max}
        step={control.step}
        value={[control.value]}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next);
        }}
      />
      {/* For the eye only. The slider already reports its value to a screen
          reader, and an `<output>` is a live region: dragging would read every
          value out twice. */}
      <span
        aria-hidden="true"
        className="h3-controls-value w-10 shrink-0 text-right tabular-nums text-ink"
      >
        {control.value.toFixed(decimals(control.step))}
      </span>
    </div>
  );
}
