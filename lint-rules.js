/**
 * House rules, shared by oxlint (`lint` in vite.config.ts) and ESLint (eslint.config.js,
 * for .svelte files). Oxlint accepts the ESLint rule names, so both read this one list.
 *
 * @satisfies {import('vite-plus/lint').DummyRuleMap}
 */
export const rules = {
	// Modern JavaScript
	'no-var': 'error', // Use let/const instead of var
	'prefer-template': 'warn', // `Hello ${name}` over 'Hello ' + name
	'object-shorthand': 'warn', // { x } over { x: x }
	'func-style': ['warn', 'expression', { allowArrowFunctions: true }], // const fn = () => {} over function fn() {}
	// const { x } = obj over const x = obj.x; plain assignments (x = obj.x) are left alone
	'prefer-destructuring': [
		'warn',
		{
			VariableDeclarator: { array: false, object: true },
			AssignmentExpression: { array: false, object: false }
		}
	],

	// Code Quality
	eqeqeq: ['error', 'always'], // === over ==

	// TypeScript
	'@typescript-eslint/no-explicit-any': 'error', // Never use any
	'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }], // import type {} from
	'@typescript-eslint/no-unused-vars': [
		'warn',
		{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' } // Prefix unused with _
	]
}
