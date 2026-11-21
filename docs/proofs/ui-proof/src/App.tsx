import { useState } from 'react';
import { Controls, Dialog, type ControlsFolder } from './ui';

// One Tailwind component (Controls, with a Switch and a Slider inside it)
// and one plain component (Dialog). Rendering both proves the copied
// folder compiles and styles without h3nr7's fonts or app stylesheet.
export default function App() {
  const [values, setValues] = useState({ showRay: false, radius: 50 });

  const folders: ControlsFolder[] = [
    {
      name: 'Flock',
      controls: [
        { key: 'showRay', label: 'Show ray', type: 'boolean', value: values.showRay },
        { key: 'radius', label: 'Radius', type: 'number', value: values.radius, min: 5, max: 200, step: 1 },
      ],
    },
  ];

  return (
    <main style={{ padding: 'var(--space-6)', maxWidth: 'var(--measure-form)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)' }}>UI proof</h1>
      <Controls
        folders={folders}
        onChange={(_folder, key, value) => setValues((v) => ({ ...v, [key]: value }))}
      />
      <Dialog title="About" trigger={<button type="button">Open the dialog</button>}>
        <p>A plain component, styled by the app through its h3-dialog class.</p>
      </Dialog>
    </main>
  );
}
