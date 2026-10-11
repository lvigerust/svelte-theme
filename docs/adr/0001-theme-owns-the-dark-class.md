# `.dark` on `<html>` is the public contract, and `<Theme />` owns it

The package's one output that other code depends on is a `dark` class on `<html>` while the current color scheme is dark. `@lvigerust/components/styles` switches its tokens and its `dark:` variant on it (`&:where(.dark, .dark *)`), so the class name and element can't change without breaking every consumer of the components.

`<Theme />` is the only thing that writes the class: its inline script sets it before first paint, and an `$effect` keeps it in step after hydration. The `theme` state never touches the DOM.

## Considered Options

- **State writes the class, as in the old package (0.0.5).** It toggled the class from an effect created only while something read `theme` inside an effect, so an app whose buttons only wrote `theme.override` never saw the class change, and an OS switch went unnoticed. Writing from the setter as well would cover writes but still miss OS changes.
- **`<Theme />` owns it (chosen).** Every app already renders `<Theme />` for the before-paint script, so the class lives in one component that's mounted for the page's lifetime.

## Consequences

- An app that reads and writes `theme` but doesn't render `<Theme />` gets no class. The README says to render it once, in the root layout.
- The inline script and `state.svelte.ts` each read the stored override; a test checks that they agree for every stored value.
