<script lang="ts">
	import { theme } from '#lib'
	import ThemeSwitch from './ThemeSwitch.svelte'
</script>

<main class="mx-auto flex max-w-xl flex-col gap-8 p-8">
	<header class="flex items-center justify-between gap-4">
		<h1 class="text-xl font-semibold">@lvigerust/svelte-theme</h1>
		<ThemeSwitch />
	</header>

	<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm">
		<dt class="text-zinc-500 dark:text-zinc-400">theme.override</dt>
		<dd>{theme.override}</dd>
		<dt class="text-zinc-500 dark:text-zinc-400">theme.system</dt>
		<dd>{theme.system}</dd>
		<dt class="text-zinc-500 dark:text-zinc-400">theme.current</dt>
		<dd>{theme.current}</dd>
	</dl>

	<p class="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
		This panel switches on <code>dark:</code> utilities, which match the <code>.dark</code> class &lt;Theme
		/&gt; sets on &lt;html&gt;. Reload with a stored override, or change the OS setting with override
		on system, and the page should never flash the other theme.
	</p>
</main>
