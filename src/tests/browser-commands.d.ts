import 'vite-plus/test/browser'

declare module 'vitest/browser' {
	interface BrowserCommands {
		/** Sets `prefers-color-scheme` for the page under test. */
		emulateColorScheme: (colorScheme: 'light' | 'dark') => Promise<void>
	}
}
