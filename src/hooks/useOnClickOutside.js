import { useEffect } from "react"

export function useOnClickOutside(ref, handler, bypassSelector) {
  const listener = (event) => {
    if (ref.current && event.target) {
      if (
        !ref.current.contains(event.target) ||
        (bypassSelector && event.target.closest(bypassSelector))
      ) {
        handler(event)
      }
    }
  }
  useEffect(() => {
    document.addEventListener("mousedown", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
    }
  }, [ref, handler, bypassSelector])
}
