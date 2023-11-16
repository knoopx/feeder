import q from "../support/q"
import { Popover, Spinner } from "."
import { inject, observer, useLocalStore } from "mobx-react"
import { MdError } from "react-icons/md"
import { fetchDoc } from "../support/fetchDoc"

const findFeed = q("link[type='application/rss+xml']@href", (x) =>
  new URL(x, href).toString(),
)

export const AddSourcePopover = inject("store")(
  observer(({ store, onDismiss, ...props }) => {
    const state = useLocalStore(() => ({
      value: "",
      isLoading: false,
      error: false,
      get httpPrefixed() {
        if (state.value.startsWith("http")) {
          return state.value
        }
        return `https://${state.value}`
      },
      update(props) {
        Object.assign(state, props)
      },
    }))

    const resolve = async (href) => {
      console.log(`resolving ${href}`)
      try {
        state.update({ isLoading: true, error: false })
        const doc = await fetchDoc(href)
        const rootNode = doc.querySelector(":root").nodeName.toLowerCase()
        if (rootNode == "rss") {
          store.addSource({
            title: doc.querySelector("title").textContent.trim(),
            // link: doc.querySelector("link").textContent.trim(),
            href,
            selectors: {
              item: "item",
              href: "guid[isPermaLink='true'], link",
              author: "author",
              description: "description",
              publishedAt: "pubDate",
            },
          })
          onDismiss()
        } else if (rootNode == "feed") {
          store.addSource({
            title: doc.querySelector("title").textContent.trim(),
            // link: doc.querySelector("link").textContent.trim(),
            href,
            selectors: {
              item: "entry",
              title: "title",
              href: "link@href",
              author: "author name",
              description: "content",
              publishedAt: "updated",
            },
          })
        } else {
          const feed = findFeed(doc)

          if (feed) {
            store.addSource({
              title: "Loading...",
              href: feed,
            })
            onDismiss()
          } else {
            store.addSource({
              title: "New Source",
              href,
              kind: "html",
            })
            onDismiss()
          }
        }
      } catch (err) {
        console.warn(err)
        state.update({ isLoading: false, error: err })
      } finally {
        state.update({ isLoading: false })
      }
    }

    const onSubmit = (e) => {
      e.preventDefault()
      resolve(state.httpPrefixed)
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
