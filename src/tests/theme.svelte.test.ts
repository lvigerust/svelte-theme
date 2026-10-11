import { flushSync } from 'svelte'
import { commands } from 'vite-plus/test/browser'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import { render } from 'vitest-browser-svelte'
import { Theme, theme, type ColorScheme } from '#lib'

const isDark = () => document.documentElement.classList.contains('dark')

/** What another tab does when it writes the override: set storage, and this tab gets an event. */
const otherTab = (value: string | null) => {
	if (value === null) localStorage.clear()
	else localStorage.setItem('theme', value)
	window.dispatchEvent(
		new StorageEvent('storage', { key: value === null ? null : 'theme', newValue: value })
	)
}

beforeEach(() => commands.emulateColorScheme('light'))

afterEach(() => {
	theme.override = 'system'
	document.documentElement.classList.remove('dark')
})

describe('theme', () => {
	it('persists a color scheme, and forgets it for system', () => {
		theme.override = 'dark'
		expect(localStorage.getItem('theme')).toBe('dark')

		theme.override = 'system'
		expect(localStorage.getItem('theme')).toBeNull()
	})

	it('reports the OS setting as system, and as current while override is system', async () => {
		await commands.emulateColorScheme('dark')

		await expect.poll(() => theme.system).toBe('dark')
		expect(theme.current).toBe('dark')

		theme.override = 'light'
		expect(theme.current).toBe('light')
		expect(theme.system).toBe('dark')
	})

	it('picks up an override another tab writes', () => {
		otherTab('dark')
		expect(theme.override).toBe('dark')

		otherTab('light')
		expect(theme.override).toBe('light')
	})

	it('treats junk or cleared storage from another tab as system', () => {
		theme.override = 'dark'
		otherTab('blue')
		expect(theme.override).toBe('system')

		theme.override = 'dark'
		otherTab(null)
		expect(theme.override).toBe('system')
	})
})

describe('<Theme />', () => {
	it('sets .dark on <html> while the current theme is dark', async () => {
		await render(Theme)

		theme.override = 'dark'
		flushSync()
		expect(isDark()).toBe(true)

		theme.override = 'light'
		flushSync()
		expect(isDark()).toBe(false)
	})

	it('follows the OS while override is system', async () => {
		await render(Theme)

		await commands.emulateColorScheme('dark')
		await expect.poll(isDark).toBe(true)

		await commands.emulateColorScheme('light')
		await expect.poll(isDark).toBe(false)
	})

	it('follows an override another tab writes', async () => {
		await render(Theme)

		otherTab('dark')
		flushSync()
		expect(isDark()).toBe(true)
	})

	describe('inline script', () => {
		/**
		 * The before-paint script <Theme /> puts in <head>. A client render inserts it without
		 * running it, so this re-inserts its text as a fresh <script>, which the browser runs at
		 * once, as it does the server-rendered one.
		 */
		const inlineScript = async () => {
			const { unmount } = await render(Theme)
			const { textContent } = [...document.head.querySelectorAll('script')].find((element) =>
				element.textContent.includes('prefers-color-scheme')
			)!
			await unmount()
			return () => {
				const script = document.createElement('script')
				script.textContent = textContent
				document.head.append(script)
				script.remove()
			}
		}

		const cases: [stored: string | null, os: ColorScheme][] = [
			['dark', 'light'],
			['light', 'dark'],
			[null, 'dark'],
			[null, 'light'],
			['blue', 'dark']
		]

		it.each(cases)('agrees with theme.current (stored %s, OS %s)', async (stored, os) => {
			const run = await inlineScript()
			await commands.emulateColorScheme(os)
			await expect.poll(() => theme.system).toBe(os)
			otherTab(stored)

			document.documentElement.classList.remove('dark')
			run()

			expect(isDark()).toBe(theme.current === 'dark')
		})
	})
})
