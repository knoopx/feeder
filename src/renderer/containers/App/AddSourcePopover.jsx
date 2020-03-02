import React from "react"
import { Popover, Spinner } from "components"
import { inject, observer, useLocalStore } from "mobx-react"
import { scrape } from "support/parse"
import query from "support/query"
import { MdError } from "react-icons/md"

const findFeeds = query(["link[type='application/rss+xml']@href"])

export const AddSourcePopover = inject("store")(
  observer(({ store, onDismiss, ...props }) => {
    const state = useLocalStore(() => ({
      value: "",
      isLoading: false,
      error: false,
      get properValue() {
        if (state.value.startsWith("http")) {
          return state.value
        }
        return `http://${state.value}`
      },
    }))

    const resolve = async (href) => {
      console.log(`resolving ${href}`)
      try {
        state.isLoading = true
        state.error = false
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
        state.error = err
      } finally {
        state.isLoading = false
      }
    }

    const onSubmit = (e) => {
      e.preventDefault()
      resolve(state.properValue)
    }
    return (
      <Popover
        placement="bottom"
        className="p-1"
        onDismiss={onDismiss}
        {...props}
      >
        <form className="flex items-center" onSubmit={onSubmit}>
          {state.isLoading && <Spinner className="mx-2" size="1rem" />}
          <input
            autoFocus
            className="outline-none px-2 py-1 border rounded"
            value={state.value}
            placeholder="http://example.com"
            onChange={(e) => {
              state.value = e.target.value
            }}
          />
          {state.error && (
            <span className="mx-2 text-red-600" title={state.error.message}>
              <MdError size="1.25rem" />
            </span>
          )}
        </form>
      </Popover>
    )
  }),
)
