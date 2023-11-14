import q from "domqs"
import React, { useEffect, useState } from "react"
import { types, unprotect, onSnapshot } from "mobx-state-tree"
import { observer } from "mobx-react"
import { MdRssFeed } from "react-icons/md"
import { fetchDoc } from "../support/fetchDoc"

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

const match = q(["link[rel*='icon']@href"])

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
    console.warn(err)
  }
}

export const FavIcon = observer(({ src, className, ...props }) => {
  const { origin } = src ? new URL(src) : { origin: null }
  const iconSrc = cache.get(origin)

  useEffect(() => {
    if (src && !iconSrc) {
      resolveIcons(origin)
    }
  }, [src, iconSrc])

  if (!iconSrc) {
    return <MdRssFeed className={["h-4 w-4", className]} {...props} />
  }

  return <img {...props} className={["h-4 w-4", className]} src={iconSrc} />
})
