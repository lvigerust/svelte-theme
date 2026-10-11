/**
 * Packaging test: the package as a consumer installs it.
 *
 * The browser tests import src/lib; nothing else exercises what gets published. This packs the
 * real tarball (prepack builds dist/ with svelte-package and runs publint), installs it into a
 * temp consumer, imports the entry through Vite, server-renders <Theme /> and type-checks a
 * consumer file under `moduleResolution: bundler`.
 */
import { execFileSync } from 'node:child_process'
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import ts from 'typescript'
import { createServer, type ViteDevServer } from 'vite-plus'
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test'

const NAME = '@lvigerust/svelte-theme'
const packageRoot = fileURLToPath(new URL('../..', import.meta.url))

type Manifest = {
	exports: Record<string, Record<string, string>>
	dependencies?: Record<string, string>
	peerDependencies?: Record<string, string>
}

let consumer: string
let installed: string
let manifest: Manifest
let server: ViteDevServer | undefined

/** Packs the package, installs the tarball and symlinks its (peer) dependencies into a temp app. */
const install = () => {
	consumer = mkdtempSync(join(tmpdir(), 'lvigerust-svelte-theme-'))
	installed = join(consumer, 'node_modules', NAME)
	mkdirSync(installed, { recursive: true })

	const tarball = execFileSync('pnpm', ['pack', '--pack-destination', consumer, '--json'], {
		cwd: packageRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	})
	const { filename } = JSON.parse(tarball.slice(tarball.indexOf('{'))) as { filename: string }
	execFileSync('tar', ['-xzf', filename, '-C', installed, '--strip-components=1'])
	manifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'))

	const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies }
	for (const name of Object.keys(dependencies)) {
		const link = join(consumer, 'node_modules', name)
		mkdirSync(dirname(link), { recursive: true })
		symlinkSync(realpathSync(join(packageRoot, 'node_modules', name)), link, 'dir')
	}

	writeFileSync(
		join(consumer, 'package.json'),
		JSON.stringify({
			name: 'consumer',
			private: true,
			type: 'module',
			dependencies: { [NAME]: '*', ...dependencies }
		})
	)
}

beforeAll(async () => {
	install()
	server = await createServer({
		root: consumer,
		configFile: false,
		logLevel: 'silent',
		plugins: [svelte({ configFile: false })],
		server: { middlewareMode: true, hmr: false, ws: false }
	})
}, 120_000)

afterAll(async () => {
	await server?.close()
	if (consumer) rmSync(consumer, { recursive: true, force: true })
})

describe('the packed package', { timeout: 60_000 }, () => {
	it('has one entry, published from dist/ with types', () => {
		expect(manifest.exports).toEqual({
			'.': { types: './dist/index.d.ts', svelte: './dist/index.js' }
		})
		expect(() => readFileSync(join(installed, 'dist/index.d.ts'))).not.toThrow()
	})

	it('exports theme, themes and <Theme />', async () => {
		const module = (await server!.ssrLoadModule(NAME)) as Record<string, unknown>

		expect(Object.keys(module).sort()).toEqual(['Theme', 'theme', 'themes'])
		expect(module.themes).toEqual(['light', 'dark', 'system'])
	})

	it('server-renders the before-paint script into <head>', async () => {
		const { Theme } = (await server!.ssrLoadModule(NAME)) as { Theme: never }
		const { render } = (await server!.ssrLoadModule('svelte/server')) as {
			render: (component: never) => { head: string; body: string }
		}

		const { head } = render(Theme)

		expect(head).toContain('<script>')
		expect(head).toContain("localStorage.getItem('theme')")
		expect(head).toContain('prefers-color-scheme: dark')
	})

	it('type-checks a consumer, with ThemeOverride and ColorScheme as distinct unions', () => {
		const file = join(consumer, 'consumer.ts')
		writeFileSync(
			file,
			[
				`import { Theme, theme, themes, type ColorScheme, type ThemeOverride } from '${NAME}'`,
				`export const component = Theme`,
				`export const override: ThemeOverride = themes[2]`,
				`export const current: ColorScheme = theme.current`,
				`theme.override = 'system'`,
				`// @ts-expect-error 'system' is an override, not a color scheme`,
				`export const scheme: ColorScheme = 'system'`,
				`// @ts-expect-error not an override`,
				`theme.override = 'blue'`
			].join('\n')
		)

		const program = ts.createProgram([file], {
			strict: true,
			noEmit: true,
			skipLibCheck: true,
			target: ts.ScriptTarget.ES2022,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
			types: []
		})
		const errors = ts.getPreEmitDiagnostics(program).map((diagnostic) =>
			ts.formatDiagnostic(diagnostic, {
				getCanonicalFileName: (name) => name,
				getCurrentDirectory: () => consumer,
				getNewLine: () => '\n'
			})
		)

		expect(errors).toEqual([])
	})
})
