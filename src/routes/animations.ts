// The sandbox's animations, as Web Animations API attachments. None of them touches the page's
// colours: animating those would smooth a flash of the other theme into a fade and hide it.
import type { Attachment } from 'svelte/attachments'
import { prefersReducedMotion } from 'svelte/motion'

/**
 * Holds the element at `value()` opacity, animating from the previous value on each change.
 * The first run only sets it, so a page that loads dimmed doesn't fade into being dimmed.
 */
export const opacity =
	(value: () => number, duration = 300): Attachment<HTMLElement | SVGElement> =>
	(node) => {
		const to = String(value())
		const from = node.style.opacity || to
		node.style.opacity = to
		if (from === to || prefersReducedMotion.current) return
		const animation = node.animate([{ opacity: from }, { opacity: to }], {
			duration,
			easing: 'ease-out'
		})
		return () => animation.cancel()
	}

/** Reveals the text one character at a time, like a terminal printing it. */
export const type: Attachment<HTMLElement> = (node) => {
	const chars = node.textContent?.length ?? 0
	if (!chars || prefersReducedMotion.current) return
	const animation = node.animate(
		[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
		{ duration: chars * 18, easing: `steps(${chars})` }
	)
	return () => animation.cancel()
}

/** Blinks like a terminal cursor: on for half a second, off for half. */
export const blink: Attachment<HTMLElement> = (node) => {
	if (prefersReducedMotion.current) return
	const animation = node.animate(
		[{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }],
		{ duration: 1000, iterations: Infinity }
	)
	return () => animation.cancel()
}
