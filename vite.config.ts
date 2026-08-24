import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'
import manifest from './manifest.config.ts'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    // Every asset is bundled inside the extension, so there is no latency to
    // hide by preloading. The generated tags also carry `crossorigin`, which
    // puts the preload in a different credentials mode from the import that
    // follows — Chrome then fetches each chunk twice and warns that the
    // preload went unused.
    modulePreload: false,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
