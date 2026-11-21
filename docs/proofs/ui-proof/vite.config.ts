import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// One file for Vite and Vitest. The test block matches h3nr7's
// packages/ui/vitest.config.ts: jsdom, because the specs assert on what a
// screen reader reads, and jest-dom's matchers from the setup file.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
