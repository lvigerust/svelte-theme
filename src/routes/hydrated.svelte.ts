/**
 * Whether the page has hydrated. The server can't see localStorage or prefers-color-scheme, so
 * it renders `theme.override` and `theme.system` as 'system' and 'light'. Pages hide those values
 * until this flips, and show the current color scheme with `dark:` classes so it is right before
 * paint.
 */
export const sandbox = $state({ hydrated: false })
