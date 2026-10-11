# Svelte Theme

`@lvigerust/svelte-theme`: which color scheme a page shows, as chosen by the user or taken from the OS, and how it reaches the page's styles.

## Language

**Color scheme**:
Light or dark: what the page actually shows.
_Avoid_: Mode, theme (for the two-valued thing)

**Override**:
The user's choice: a color scheme, or system to follow the OS. Remembered per browser and shared across its tabs.
_Avoid_: Preference, setting, saved theme

**System color scheme**:
The color scheme the OS asks for (`prefers-color-scheme`).
_Avoid_: OS theme, default

**Current color scheme**:
The override when it names a color scheme, otherwise the system color scheme.
_Avoid_: Active theme, resolved theme

**`.dark` contract**:
The promise that `<html>` carries the `dark` class exactly while the current color scheme is dark; stylesheets decide what dark looks like.
_Avoid_: Dark mode class, theme class

**Before-paint script**:
The inline script that applies the `.dark` contract before the browser first paints, so a server-rendered page never flashes the other color scheme.
_Avoid_: FOUC script, blocking script
