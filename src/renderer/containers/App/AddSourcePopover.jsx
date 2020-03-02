import React from "react"
import { Popover } from "components"
import { inject, observer, useLocalStore } from "mobx-react"
import { scrape } from "support/parse"
import query from "support/query"
import { parseSource } from "support/feed"

const findFeeds = query(["link[type='application/rss+xml']@href"])

export const AddSourcePopover = inject("store")(
  observer(({ store, onDismiss, ...props }) => {
    const localStore = useLocalStore(() => ({
      value: "",
    }))

    const resolve = async (href) => {
      console.log(`resolving ${href}`)
      try {
        const doc = await scrape(href)
        console.log(doc.querySelector(":root").nodeName)
        if (["rss", "feed"].includes(doc.querySelector(":root").nodeName)) {
          store.addSource({
            name: "Loading...",
            href,
          })
          onDismiss()
        } else {
          const feeds = findFeeds(doc).map((x) => new URL(x, href).toString())
          if (feeds.length > 0) {
            store.addSource({
              name: "Loading...",
              href: feeds[0],
            })
            onDismiss()
          }
        }
      } catch (err) {
        console.warn(err)
      }
    }

    const onSubmit = (e) => {
      e.preventDefault()
      resolve(localStore.value)
    }
    return (
      <Popover
        placement="bottom"
        className="p-2"
        onDismiss={onDismiss}
        {...props}
      >
        <form onSubmit={onSubmit}>
          <input
            className="px-2 border border-pink-600 rounded"
            value={localStore.value}
            placeholder="http://example.com"
            onChange={(e) => {
              localStore.value = e.target.value
            }}
          />
        </form>
      </Popover>
    )
  }),
)
