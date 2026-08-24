import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: 'SnappBlocker',
  short_name: 'SnappBlocker',
  description: 'Block SnappFood and SnappMarket stores and never see them again.',
  version: pkg.version,

  icons: {
    128: 'public/icons/logo-128.png',
  },

  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      128: 'public/icons/logo-128.png',
    },
  },

  content_scripts: [
    {
      matches: ['https://snappfood.ir/*', 'https://snapp.market/*'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],

  permissions: ['storage'],
})
