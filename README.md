# @lvigerust/svelte-theme

Light/dark theme state for Svelte 5. Remembers the user's choice, follows the OS when there isn't one, syncs across tabs, and sets a `dark` class on `<html>`, before first paint and after.

## Install

The package is on GitHub Packages. Point the `@lvigerust` scope at it in your `.npmrc`, with a GitHub token that has `read:packages`:

```ini
@lvigerust:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
pnpm add @lvigerust/svelte-theme
```

## Usage

Render `<Theme />` once, in the root layout. It owns the `dark` class on `<html>`.

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { Theme } from '@lvigerust/svelte-theme'

	let { children } = $props()
</script>

<Theme />

{@render children()}
```

Read and set the theme anywhere through `theme`:

```svelte
<script>
	import { theme, themes } from '@lvigerust/svelte-theme'
</script>

{#each themes as value (value)}
	<button aria-pressed={theme.override === value} onclick={() => (theme.override = value)}>
		{value}
	</button>
{/each}

<p>Showing {theme.current}</p>
```

## API

### `theme`

| Property   | Type                            | Description                                                                                                          |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `override` | `'light' \| 'dark' \| 'system'` | The user's choice. Settable; persisted to `localStorage` (key `theme`) and synced across tabs. `'system'` clears it. |
| `system`   | `'light' \| 'dark'`             | The OS color scheme, from `prefers-color-scheme`.                                                                    |
| `current`  | `'light' \| 'dark'`             | What the page shows: `override`, or `system` while `override` is `'system'`.                                         |

All three are reactive. On the server, `override` is `'system'` and `system` is `'light'`, since neither the stored choice nor the OS setting is known there.

### `themes`

`['light', 'dark', 'system']`: the values `theme.override` accepts, in display order.

### Types

- `ThemeOverride`: `'light' | 'dark' | 'system'`
- `ColorScheme`: `'light' | 'dark'`

### `<Theme />`

Takes no props. During server rendering it puts an inline script in `<head>` that sets the class from `localStorage` and `prefers-color-scheme` before the page paints, so a reload never flashes the other theme. After hydration it keeps the class in step with `theme.current`.

The inline script needs a Content Security Policy that allows it (for example `'unsafe-inline'` or a hash of the script) if your app sets one.

## The `.dark` contract

`<html>` has the `dark` class exactly while `theme.current` is `'dark'`. This class is the package's public output. Stylesheets decide what `.dark` means. `@lvigerust/components/styles` switches its tokens and its Tailwind `dark` variant on it, so changing the class name or element is a breaking change.

A Tailwind app that doesn't import `@lvigerust/components/styles` needs the same variant itself:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Upgrading from 0.0.x

- The `Theme` type is now `ThemeOverride`. In 0.0.x the `Theme` component's type shadowed it, so `import type { Theme }` never gave you the union.
- `theme.current` and `theme.system` are typed `ColorScheme`, without `'system'`.
- `<Theme />` now owns the `dark` class. In 0.0.x the class only updated while something read `theme` inside an effect. Make sure `<Theme />` is rendered in the root layout.

## Development

Requires Node 22.22.1+ and [Vite+](https://viteplus.dev) (`vp`). pnpm is pinned in `package.json`.

```sh
vp install            # also installs the pre-commit hook
vp dev                # sandbox app in src/routes (never deployed)
vp run ready          # what CI runs: format, oxlint, ESLint, svelte-check, tests
```

`src/lib` is the package. Tests live in `src/tests`: browser-mode tests (`*.svelte.test.ts`, Chromium via Playwright; run `vp exec playwright install chromium` once) and a packaging test that packs and installs the real tarball.

## Releasing

1. Set `version` in `package.json` and commit it to `main`.
2. Tag the commit and push the tag: `git tag v0.1.0 && git push origin v0.1.0`.

The Release workflow runs CI, publishes to GitHub Packages and creates a GitHub release with generated notes ([ADR-0002](docs/adr/0002-release-by-pushing-a-version-tag.md)).
