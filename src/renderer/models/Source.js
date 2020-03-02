import { values } from "mobx"
import { orderBy } from "lodash"
import { types as t, flow, getParent } from "mobx-state-tree"
import { parseSource } from "support/feed"

import Item from "./Item"

const disposables = []

export default t
  .model("Source", {
    name: t.string,
    href: t.identifier,
    link: t.maybeNull(t.string),
    description: t.maybeNull(t.string),
    language: t.maybeNull(t.string),
    items: t.optional(t.map(Item), {}),
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
    get updatedAt() {
      return orderBy(self.allItems, "-publishedAt")[0]?.publishedAt || 0
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
      self.allItems.forEach((x) => x.markAsRead())
    },
    setStatus(status) {
      self.status = status
    },
    addItem({ guid, ...rest }) {
      const item = self.items.get(guid)
      self.items.put({
        guid,
        ...item,
        ...rest,
      })
    },
    toggleReadability() {
      self.readability = !self.readability
    },
    fetch: flow(function*() {
      try {
        self.setStatus("running")

        const { items, source } = yield parseSource(self.href)

        try {
          self.update(source)
        } catch (err) {
          console.warn(err)
        }

        items.forEach((item) => {
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
        self.lastUpdateAt = Date.now()
      }
    }),
  }))
