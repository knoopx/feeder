import { values } from "mobx"
import { orderBy, reverse } from "lodash"
import { types as t, flow, getParent, destroy } from "mobx-state-tree"
import { parseFeed } from "support/feed"

import Item from "./Item"

const disposables = []

export default t
  .model("Source", {
    title: t.string,
    href: t.identifier,
    link: t.maybeNull(t.string),
    description: t.maybeNull(t.string),
    language: t.maybeNull(t.string),
    items: t.optional(t.map(Item), {}),
    publishedAt: t.maybeNull(t.Date),
    clearedAt: t.maybeNull(t.Date),
    fetchedAt: t.maybeNull(t.Date),
    status: t.optional(
      t.enumeration(["pending", "running", "done"]),
      "pending",
    ),
    readability: t.optional(t.boolean, false),
  })
  .volatile(() => ({
    error: null,
  }))
  .views((self) => ({
    get isLoading() {
      return self.status === "running"
    },
    get store() {
      return getParent(self, 2)
    },
    get allItems() {
      return values(self.items)
    },
    get sortedItems() {
      return orderBy(self.allItems, ["publishedAt"], ["desc"])
    },
    get newItemsCount() {
      return values(self.items).filter((item) => item.isNew).length
    },
  }))
  .actions((self) => ({
    beforeDestroy() {
      disposables.forEach((dispose) => dispose())
    },
    update(snapshot) {
      Object.assign(self, snapshot)
    },
    clearItems() {
      self.clearedAt = new Date()
      self.allItems.forEach((item) => {
        destroy(item)
      })
    },
    setStatus(status) {
      self.status = status
    },
    addItem({ link, publishedAt, ...rest }) {
      if (!self.clearedAt || !publishedAt || publishedAt > self.clearedAt) {
        const item = self.items.get(link)

        self.items.put({
          link,
          publishedAt,
          ...item,
          ...rest,
        })
      }
    },
    toggleReadability() {
      self.readability = !self.readability
    },
    fetch: flow(function*() {
      try {
        self.error = null
        self.setStatus("running")
        const { items, ...source } = yield parseFeed(self.href)

        try {
          self.update(source)
        } catch (err) {
          console.warn(err)
        }

        reverse(items).forEach((item) => {
          try {
            self.addItem(item)
          } catch (err) {
            console.warn(err)
          }
        })
      } catch (err) {
        self.error = err
        console.warn(err)
      } finally {
        self.setStatus("done")
      }
    }),
  }))
