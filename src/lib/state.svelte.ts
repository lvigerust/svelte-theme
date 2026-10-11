import { BROWSER } from 'esm-env'
import { on } from 'svelte/events'
import { MediaQuery } from 'svelte/reactivity'

/** The values `theme.override` accepts: a color scheme, or `'system'` to follow the OS. */
export const themes = ['light', 'dark', 'system'] as const
export type ThemeOverride = (typeof themes)[number]
export type ColorScheme = Exclude<ThemeOverride, 'system'>

/** The localStorage key. <Theme />'s inline script reads it too, before this module loads. */
const KEY = 'theme'

/** The stored override. Anything but a color scheme (nothing, junk, blocked storage) is `'system'`. */
const load = (): ThemeOverride => {
	try {
		const value = localStorage.getItem(KEY)
		return value === 'light' || value === 'dark' ? value : 'system'
	} catch {
		return 'system'
	}
}

const save = (value: ThemeOverride) => {
	try {
		if (value === 'system') localStorage.removeItem(KEY)
		else localStorage.setItem(KEY, value)
	} catch {
		// Storage is blocked: the override still applies to this page, it just isn't remembered.
	}
}

class ThemeState {
	// Getters rather than $derived: MediaQuery only subscribes inside an effect, so a derived
	// read outside one (an event handler, say) would cache a stale OS setting.
	#prefersDark = new MediaQuery('(prefers-color-scheme: dark)')
	#override = $state<ThemeOverride>(BROWSER ? load() : 'system')

	constructor() {
		if (BROWSER) {
			// Another tab changed the override (or cleared storage). The singleton lives as long
			// as the page, so the listener is never removed.
			on(window, 'storage', (event) => {
				if (event.key === KEY || event.key === null) this.#override = load()
			})
		}
	}

	/** The OS color scheme, from `prefers-color-scheme`. Always `'light'` on the server. */
	get system(): ColorScheme {
		return this.#prefersDark.current ? 'dark' : 'light'
	}

	/** The user's choice, persisted to localStorage and synced across tabs. */
	get override() {
		return this.#override
	}

	set override(value: ThemeOverride) {
		save(value)
		this.#override = value
	}

	/** The color scheme in effect: `override`, or `system` while `override` is `'system'`. */
	get current(): ColorScheme {
		return this.#override === 'system' ? this.system : this.#override
	}
}

export const theme = new ThemeState()
