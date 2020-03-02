import React, { useEffect, useState } from "react"
import { types, unprotect, onSnapshot } from "mobx-state-tree"
import { observer } from "mobx-react"
import { MdRssFeed } from "react-icons/md"
import classNames from "classnames"
import { useSpring, animated } from "react-spring"
import { scrape } from "support/parse"
import query from "support/query"
import * as R from "rambda"

const Store = types.map(types.string)
const cache = Store.create(JSON.parse(localStorage.faviconCache || "{}"))
unprotect(cache)

onSnapshot(cache, (snapshot) => {
  localStorage.faviconCache = JSON.stringify(snapshot)
})

const tryFetch = async (url) => {
  try {
    const res = await fetch(url, {
      method: "HEAD",
    })
    return res.status === 200
  } catch (err) {
    return false
  }
}

const match = R.pipe(
  query(["link"]),
  R.filter(
    R.pipe(
      R.map(R.prop("rel")),
      (rel) => ["apple-touch-icon", "shortcut icon", "icon"].includes(rel),
    ),
  ),
  R.map(R.prop("href")),
)

const fetchIcon = async (src) => {
  if (!cache.has(src)) {
    cache.set(src, "")

    try {
      const doc = await scrape(src, "text/html")
      const matches = match(doc)

      const links = [...matches, new URL("favicon.ico", src).toString()]

      for (const link of links) {
        if (await tryFetch(link)) {
          cache.set(src, link)
          break
        }
      }
    } catch (err) {
      console.warn(err)
    }
  }
}

const Placeholder = animated(MdRssFeed)

export const FavIcon = observer(({ src, className, ...props }) => {
  const [isLoaded, setLoaded] = useState(false)

  const { origin } = src ? new URL(src) : { origin: null }
  const iconSrc = cache.get(origin)

  useEffect(() => {
    if (src) {
      if (iconSrc) {
        const img = new Image()
        img.onload = () => void setLoaded(true)
        img.src = iconSrc
      } else {
        fetchIcon(origin)
      }
    }
  }, [src])

  const imgSpring = useSpring({
    opacity: isLoaded ? 1 : 0,
  })

  if (!iconSrc) {
    return (
      <Placeholder className={classNames("h-4 w-4", className)} {...props} />
    )
  }

  return (
    <animated.img
      {...props}
      className={classNames("h-4 w-4", className)}
      // style={imgSpring}
      src={iconSrc}
      // src={`https://api.statvoo.com/favicon/?url=${origin}`}
      // src={`https://www.google.com/s2/favicons?origin=${origin}`}
      // src={`https://besticon-demo.herokuapp.com/icon?size=16..${size}..16&url=${origin}`}
      // src={`https://api.faviconkit.com/${origin}/${size}`}
      // src={`https://f1.allesedv.com/${origin}`}
    />
  )
})
