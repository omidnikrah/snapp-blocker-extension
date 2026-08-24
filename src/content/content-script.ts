import { ChromeBlockedShopsRepository } from '@/domain/blocked-shops-repository'
import { isContextInvalidated } from '@/shared/extension-context'
import { ContentApp } from './app'

const app = new ContentApp(new ChromeBlockedShopsRepository())
app.start()

/**
 * Catch-all for anything reaching storage outside the app's own guards. Once
 * the extension has been reloaded out from under this page every call rejects
 * the same way, so the script shuts down instead of logging on every hop.
 */
window.addEventListener('unhandledrejection', (event) => {
  if (!isContextInvalidated(event.reason)) return
  event.preventDefault()
  app.stop()
})
