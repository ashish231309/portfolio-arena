import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Matches the browsers this site actually targets (React 19 / Vite 8 era):
    // no legacy transpiling of syntax the platform already understands.
    target: 'es2020',
    // Production sourcemaps stay off: nothing in the deploy needs them yet.
    sourcemap: false,
    // 500 kB: everything that must be present for the first paint lives in the
    // entry chunk — measured 458.87 kB (448.12 KiB / 140.05 KiB gzip) after route
    // splitting, of which React + the shell animation runtime are the bulk. The
    // threshold sits just above that so it stays a real tripwire: it fires if the
    // eager bundle grows, while every route page and the below-the-fold home
    // sections are separate chunks that never trip it.
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        // Explicit, predictable names: entry + route chunks under assets/,
        // images/fonts keep their own extension.
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
