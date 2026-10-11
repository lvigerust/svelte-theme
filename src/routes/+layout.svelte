<script lang="ts">
	import '../app.css'
	import { Theme } from '#lib'
	import { onMount } from 'svelte'
	import { sandbox } from './hydrated.svelte'

	let { children } = $props()

	onMount(() => {
		sandbox.hydrated = true
	})
</script>

<Theme />

{@render children()}
