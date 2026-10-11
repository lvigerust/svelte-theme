<!--
	@component
	Owns the `.dark` class on <html>, which @lvigerust/components' tokens and `dark:` variant
	switch on. Render it once, in the root layout.
-->
<script lang="ts">
	import { theme } from './state.svelte.js'

	// After hydration: follows override changes, the OS setting and other tabs.
	$effect(() => {
		document.documentElement.classList.toggle('dark', theme.current === 'dark')
	})
</script>

<svelte:head>
	<!-- Before first paint, so a server-rendered page never flashes the wrong theme.
	     Reads the override as state.svelte.ts's load() does. -->
	<script>
		;(() => {
			let stored = null
			try {
				stored = localStorage.getItem('theme')
			} catch {}
			document.documentElement.classList.toggle(
				'dark',
				stored === 'dark' ||
					(stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
			)
		})()
	</script>
</svelte:head>
