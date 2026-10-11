// The sandbox is static: there is no server to tell it the theme, which is exactly the case
// the before-paint script exists for. Prerendering keeps `vp preview` and
// the hosted sandbox honest about that.
export const prerender = true
