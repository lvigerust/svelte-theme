# AGENTS.md

`@lvigerust/svelte-theme`: a single SvelteKit 3 library on Vite+ (`vp`). `src/lib` is the package, `src/routes` a dev-only sandbox, `src/tests` the tests. Vocabulary is in `GLOSSARY.md`.

## The `.dark` contract is load-bearing

`@lvigerust/components` and every app using it style dark mode off the `dark` class on `<html>`, which `<Theme />` alone writes ([ADR-0001](docs/adr/0001-theme-owns-the-dark-class.md)). Treat any change to the class name, the element, the `localStorage` key or the before-paint script as a breaking change: raise it with the user before making it. The before-paint script and `load()` in `state.svelte.ts` read the stored override independently; change them together, and the inline-script test proves they still agree.

## Checks

`vp run ready` is the gate (CI runs exactly this). `vp check` alone covers only format and oxlint, which skips `.svelte` files; ESLint (`vp run lint`) and svelte-check (`vp run check`) cover the rest ([ADR-0003](docs/adr/0003-eslint-lints-svelte-files.md)). DOM behaviour gets browser-mode tests (`*.svelte.test.ts`); `render` from `vitest-browser-svelte` is async.

Vite+, SvelteKit 3 and Vitest 5 are newer than your memory of them. Read `node_modules/vite-plus/docs` and the Svelte MCP docs before relying on how they behave.

## Porting from the old package

The old implementation lives at `~/Developer/@lvigerust/packages/svelte-theme`; it is evidence, not a template. Name the problem a piece solved there (its `git log`, comments, CHANGELOG), check whether Svelte or Vite+ now solves it, then write it fresh. "The old package had it" is not a reason.

## Decisions and releases

Record structural decisions as ADRs in `docs/adr/` (`domain-modeling` skill). Commit messages explain the problem solved.

Pushing a `v*` tag publishes to GitHub Packages ([ADR-0002](docs/adr/0002-release-by-pushing-a-version-tag.md)). Tagging, publishing and anything else outward-facing waits for the user's go-ahead.
