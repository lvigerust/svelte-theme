import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'
import { rules } from './.config/lint-rules.js'

// src/lib is the package. The SvelteKit app in src/routes is a sandbox for local
// development only; it is never deployed, so it has no adapter. It is prerendered
// (src/routes/+layout.ts): `vp build && vp preview` serves it as static HTML, the
// case the before-paint script exists for, and the build warns that no adapter is set.

export default defineConfig({
	// Only `vp dev`/`vp test` need the plugins; `vp check` skips loading them.
	plugins: lazyPlugins(() => [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]),
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [{ browser: 'chromium' }],
						commands: {
							/** Sets `prefers-color-scheme` for the page under test. */
							emulateColorScheme: ({ page }, colorScheme: 'light' | 'dark') =>
								page.emulateMedia({ colorScheme })
						}
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
	staged: {
		// ESLint first so oxlint and the formatter have the last word.
		'*': ['eslint --fix --no-warn-ignored', 'vp check --fix']
	},
	// Oxlint lints .ts/.js (including .svelte.ts modules); ESLint lints .svelte files
	// (eslint.config.js). Type checking stays with svelte-check (`vp run check`).
	lint: {
		plugins: ['typescript', 'unicorn', 'oxc'],
		jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
		ignorePatterns: ['**/*.svelte'],
		rules: {
			...rules,
			'vite-plus/prefer-vite-plus-imports': 'error'
		},
		options: { typeAware: true }
	},
	fmt: {
		semi: false,
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none',
		printWidth: 100,
		bracketSameLine: true,
		svelte: true,
		sortTailwindcss: { stylesheet: './src/app.css' },
		ignorePatterns: ['pnpm-lock.yaml']
	}
})
