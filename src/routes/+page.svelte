<!-- The sandbox: a terminal readout of the theme state, and a log that prints each step of the
     resolution as it happens. -->
<script lang="ts">
	import '@fontsource-variable/jetbrains-mono'
	import { theme, themes, type ColorScheme, type ThemeOverride } from '#lib'
	import { untrack } from 'svelte'
	import { blink, opacity, type } from './animations'
	import { sandbox } from './hydrated.svelte'

	type Line = { id: number; time: string; tag: string; text: string }
	type State = { override: ThemeOverride; system: ColorScheme; current: ColorScheme }

	const lines = $state<Line[]>([])
	let next = 0
	let previous: State | undefined
	const start = performance.now()

	const print = (tag: string, text: string) =>
		untrack(() => {
			const time = ((performance.now() - start) / 1000).toFixed(2).padStart(6, '0')
			lines.push({ id: next++, time, tag, text })
			if (lines.length > 8) lines.shift()
		})

	const html = (scheme: ColorScheme) => (scheme === 'dark' ? '<html class="dark">' : '<html>')

	$effect(() => {
		const state = { override: theme.override, system: theme.system, current: theme.current }
		if (!previous) {
			print('boot', `override=${state.override} system=${state.system} current=${state.current}`)
		} else {
			if (state.override !== previous.override) print('set', `theme.override = '${state.override}'`)
			if (state.system !== previous.system) print('os', `prefers-color-scheme: ${state.system}`)
			if (state.current !== previous.current) print('apply', html(state.current))
		}
		previous = state
	})
</script>

<div
	class="relative min-h-dvh bg-[#F2F2EE] font-mono text-[#111] dark:bg-[#0A0A0A] dark:text-[#EAEAEA]">
	<div class="scanlines pointer-events-none fixed inset-0"></div>

	<main
		class="relative mx-auto flex max-w-3xl flex-col gap-10 px-6 pt-20 pb-24 text-[13px] leading-[1.5]">
		<header
			class="flex justify-between gap-4 border-b border-black/15 pb-3 text-xs dark:border-white/15">
			<h1>[ @lvigerust/svelte-theme ]</h1>
			<span class="tracking-[0.08em] uppercase opacity-60">tty</span>
		</header>

		<div class="grid gap-x-10 gap-y-8 md:grid-cols-[auto_1fr]">
			<dl class="grid grid-cols-[7rem_1fr] content-start gap-y-2 tracking-[0.06em] uppercase">
				<dt class="opacity-60">&gt; override</dt>
				<dd
					class:opacity-0={!sandbox.hydrated}
					{@attach opacity(() => (sandbox.hydrated ? 1 : 0), 500)}>
					{theme.override}
				</dd>
				<dt class="opacity-60">&gt; system</dt>
				<dd
					class:opacity-0={!sandbox.hydrated}
					{@attach opacity(() => (sandbox.hydrated ? 1 : 0), 500)}>
					{theme.system}
				</dd>
				<dt class="opacity-60">&gt; current</dt>
				<dd class="text-[#E61919] dark:text-[#FF2A2A]">
					<span class="dark:hidden">light</span><span class="hidden dark:inline">dark</span>
				</dd>
			</dl>

			<!-- Native radios: one Tab stop for the group, and the arrow keys move and set the override. -->
			<fieldset class="tracking-[0.06em] uppercase">
				<legend class="mb-2 opacity-60">set override</legend>
				<div class="flex flex-wrap gap-1">
					{#each themes as value (value)}
						<label
							class="cursor-pointer px-1.5 py-0.5 select-none has-checked:bg-[#111] has-checked:text-[#F2F2EE] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#E61919] dark:has-checked:bg-[#EAEAEA] dark:has-checked:text-[#0A0A0A] dark:has-focus-visible:outline-[#FF2A2A]">
							<input
								class="sr-only"
								type="radio"
								name="override"
								{value}
								checked={sandbox.hydrated && theme.override === value}
								onchange={() => (theme.override = value)} />
							<span aria-hidden="true">[&nbsp;</span>{value}<span aria-hidden="true">&nbsp;]</span>
						</label>
					{/each}
				</div>
			</fieldset>
		</div>

		<ol
			class="flex min-h-[15.5rem] flex-col border border-black/15 p-4 dark:border-white/15"
			aria-live="polite">
			{#each lines as line, i (line.id)}
				<li class="flex gap-4">
					<span class="opacity-40">{line.time}</span>
					<span class="w-12 text-[#E61919] dark:text-[#FF2A2A]">{line.tag}</span>
					<span {@attach type}>{line.text}</span>
					{#if i === lines.length - 1}
						<span
							class="h-[1.1em] w-[0.6em] self-center bg-current"
							aria-hidden="true"
							{@attach blink}></span>
					{/if}
				</li>
			{/each}
		</ol>

		<p class="max-w-[64ch] border-l-2 border-[#E61919] pl-4 opacity-70 dark:border-[#FF2A2A]">
			Flip the switch, or change the OS setting with override on system, and watch each step land.
			The page should never flash the other theme on reload.
		</p>
	</main>
</div>

<style>
	:global(.dark) .scanlines {
		background: repeating-linear-gradient(
			0deg,
			transparent 0 2px,
			rgb(255 255 255 / 0.025) 2px 4px
		);
	}
</style>
