<script lang="ts">
	import '../app.css'
	import { Theme } from '#lib'

	let { children } = $props()
</script>

<Theme />

{@render children()}
