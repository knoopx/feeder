import { useEffect } from "react"
import { types, unprotect, onSnapshot } from "mobx-state-tree"
import { observer } from "mobx-react"
import { MdRssFeed } from "react-icons/md"
import { fetchDoc } from "../support/fetchDoc"
import { parse } from "../support/parsing"
import clsx from "clsx"

const Store = types.map(types.string)
const cache = Store.create(JSON.parse(localStorage.faviconCache || "{}"))
unprotect(cache)

onSnapshot(cache, (snapshot) => {
  localStorage.faviconCache = JSON.stringify(snapshot)
})

const tryFetchImage = async (url) => {
  try {
    const res = await fetch(url)
    return res.ok && res.headers.get("Content-Type").includes("image")
  } catch (err) {
    return false
  }
}

const match = parse("link[rel*='icon']@href")

const resolveIcons = async (src: string) => {
  cache.set(src, "")

  try {
    const doc = await fetchDoc(src, "text/html")
    const matches = match(doc)

    const candidates = new Set([
      ...matches,
      new URL("favicon.ico", src).toString(),
    ])

    for (const candidate of candidates) {
      if (await tryFetchImage(candidate)) {
        cache.set(src, candidate)
        break
      }
    }
  } catch (err) {
    // console.warn(err)
  }
}

export const FavIcon = observer(({ src, className, ...props }) => {
  let origin: string | null = null
  try {
    const url = new URL(src)
    origin = url.origin
  } catch (err) {}

  const iconSrc = cache.get(origin)
  useEffect(() => {
    if (src && origin && !iconSrc) {
      resolveIcons(origin)
    }
  }, [src, iconSrc])

  if (!iconSrc) {
    return <MdRssFeed className={clsx("h-4 w-4", className)} {...props} />
  }

  return <img {...props} className={clsx("h-4 w-4", className)} src={iconSrc} />
})
