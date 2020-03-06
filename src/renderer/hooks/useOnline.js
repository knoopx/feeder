import { useState, useEffect } from "react"

export const useOnline = () => {
  const [isOnline, setOnline] = useState(navigator.onLine)

  const onChange = () => {
    setOnline(navigator.onLine)
  }

  useEffect(() => {
    window.addEventListener("online", onChange)
    window.addEventListener("offline", onChange)
    return () => {
      window.removeEventListener("online", onChange)
      window.removeEventListener("offline", onChange)
    }
  }, [])

  return isOnline
}
