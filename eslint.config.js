import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { defineConfig, includeIgnoreFile } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import { rules } from './lint-rules.js'

// Oxlint (`vp lint`) lints .ts/.js, including .svelte.ts modules. It reads only the script
// block of a .svelte file and eslint-plugin-svelte's template rules don't run under it, so
// it ignores .svelte files. ESLint covers the rest: everything in .svelte files, and the
// Svelte plugin's rules in .svelte.ts/.svelte.js modules.
const components = ['**/*.svelte']
const modules = ['**/*.svelte.ts', '**/*.svelte.js']

const scope = (files, configs) => configs.flat().map((config) => ({ ...config, files }))

export default defineConfig(
	includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
	scope(components, [
		js.configs.recommended,
		ts.configs.recommended,
		{
			languageOptions: { globals: { ...globals.browser, ...globals.node } },
			rules: {
				...rules,
				'no-undef': 'off', // TypeScript checks this
				'prefer-const': 'off', // svelte/prefer-const instead: it understands $props()
				'svelte/prefer-const': 'error'
			}
		}
	]),
	scope(
		[...components, ...modules],
		[
			svelte.configs.recommended,
			// Oxfmt formats (Prettier-compatible), so turn off rules that fight it.
			prettier,
			svelte.configs.prettier,
			{
				languageOptions: {
					parserOptions: {
						projectService: true,
						extraFileExtensions: ['.svelte'],
						parser: ts.parser
					}
				},
				// A library has no app routes to resolve links against.
				rules: { 'svelte/no-navigation-without-resolve': 'off' }
			}
		]
	)
)
