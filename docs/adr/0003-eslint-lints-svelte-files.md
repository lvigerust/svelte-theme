# ESLint lints `.svelte` files; oxlint lints the rest

`vp migrate` replaces ESLint with oxlint, loading `eslint-plugin-svelte` as an oxlint JS plugin. That looks complete but isn't: oxlint reads only the `<script>` of a `.svelte` file, so template rules such as `svelte/require-each-key` and `svelte/no-at-html-tags` never fire (checked with vite-plus 1.1.0 / oxlint 1.87). So ESLint (`vp run lint`) lints `.svelte` files and the Svelte plugin's rules in `.svelte.ts` modules, and oxlint (`vp lint`, `vp check`) ignores `.svelte`. Both read the house rules from `lint-rules.js`. This is the same split as `catalyst-svelte`.

## Consequences

- Running `vp migrate --full` again would fold ESLint back into oxlint. Check its diff against this ADR.
- Drop ESLint once oxlint runs Svelte template rules. To re-test after a vite-plus upgrade, run `vp lint` over a `.svelte` file with an unkeyed `{#each}` and an `{@html}` under the migrated config: both should be reported.
