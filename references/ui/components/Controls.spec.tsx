import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls, type ControlsFolder } from './Controls';

afterEach(cleanup);

// What Radix's slider measures its track with, and jsdom lacks. Inert, as in
// apps/web's navi.spec.tsx.
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

const FOLDERS: ControlsFolder[] = [
  {
    name: 'Flock',
    controls: [
      { key: 'showRay', label: 'Show ray', type: 'boolean', value: false },
      { key: 'radius', label: 'Radius', type: 'number', value: 50, min: 5, max: 200, step: 1 },
      { key: 'strength', label: 'Strength', type: 'number', value: 1, min: 0, max: 3, step: 0.05 },
    ],
  },
  { name: 'Grid', controls: [{ key: 'dense', label: 'Dense', type: 'boolean', value: true }] },
];

describe('Controls', () => {
  it('draws a labelled group per folder', () => {
    render(<Controls folders={FOLDERS} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Flock' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Grid' })).toBeInTheDocument();
  });

  it('names every control by its label', () => {
    render(<Controls folders={FOLDERS} onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Show ray' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Dense' })).toBeChecked();
    expect(screen.getByRole('slider', { name: 'Radius' })).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows a number to the precision of its step', () => {
    render(<Controls folders={FOLDERS} onChange={() => {}} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('1.00')).toBeInTheDocument();
  });

  it('reports a switch with its folder and key', async () => {
    const onChange = vi.fn();
    render(<Controls folders={FOLDERS} onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch', { name: 'Show ray' }));
    expect(onChange).toHaveBeenCalledWith('Flock', 'showRay', true);
  });

  it('reports a slider moved from the keyboard', async () => {
    const onChange = vi.fn();
    render(<Controls folders={FOLDERS} onChange={onChange} />);
    screen.getByRole('slider', { name: 'Radius' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('Flock', 'radius', 51);
  });

  it('says so when there is nothing to control', () => {
    render(<Controls folders={[]} onChange={() => {}} empty="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});
