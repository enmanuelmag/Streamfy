import { flushSync } from 'react-dom'

export const transitionView = (updateCb: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => flushSync(updateCb))
  } else {
    updateCb()
  }
}
