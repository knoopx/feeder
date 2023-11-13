import { useState, useEffect } from "react"

export function useHover(ref) {
  const [state, set] = useState(false)

  const handleEnter = () => {
    set(true)
  }
  const handleLeave = () => {
    set(false)
  }

  const handleTouchOut = (e) => {
    if (ref.current && e.target) {
      if (!ref.current.contains(e.target)) {
        handleLeave()
      }
    }
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("pointerenter", handleEnter)
      ref.current.addEventListener("pointerleave", handleLeave)
    }
    document.addEventListener("touchstart", handleTouchOut)

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("pointerenter", handleEnter)
        ref.current.removeEventListener("pointerleave", handleLeave)
      }
      document.removeEventListener("touchstart", handleTouchOut)
    }
  }, [ref.current])

  return state
}
