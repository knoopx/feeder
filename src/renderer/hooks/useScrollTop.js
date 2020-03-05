import { useEffect, useState } from "react"

export const useScrollTop = (ref) => {
  const [scrollTop, setScrollTop] = useState(0)
  const onScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }
  useEffect(() => {
    setScrollTop(ref.current.scrollTop)
    ref.current.addEventListener("scroll", onScroll)
    return () => ref.current.removeEventListener("scroll", onScroll)
  }, [ref.current])

  return scrollTop
}
