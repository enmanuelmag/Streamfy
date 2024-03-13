import { flushSync } from 'react-dom'

export const transitionView = (updateCb: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => flushSync(updateCb))
  } else {
    updateCb()
  }
}

export const backTransition = (updateCb: () => void) => {
  window.addEventListener(
    'popstate',
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      transitionView(() => updateCb)
    },
    { passive: true },
  )

  return () => {
    window.removeEventListener('popstate', (e) => {
      e.preventDefault()
      e.stopPropagation()
      transitionView(() => updateCb)
    })
  }
}
