import { values, autorun } from "mobx"
import { orderBy, flatten, map } from "lodash"
import { types as t, destroy } from "mobx-state-tree"
import { remote } from "electron"
import { parseOPML } from "support/opml"

import Item from "./Item"
import Source from "./Source"

const disposables = []

export default t
  .model("Store", {
    activeSource: t.maybeNull(
      t.reference(Source, {
        onInvalidated(e) {
          e.removeRef()
        },
      }),
    ),
    sources: t.optional(t.map(Source), {}),
    concurrency: t.optional(t.number, 4),
    filter: t.optional(t.string, ""),
    mode: t.optional(t.enumeration(["split", "stream"]), "split"),
    activeItem: t.maybeNull(
      t.reference(Item, {
        onInvalidated(e) {
          e.removeRef()
        },
      }),
    ),
  })
  .views((self) => ({
    get pending() {
      return self.allSources.filter((source) => source.status === "pending")
    },
    get running() {
      return self.allSources.filter((source) => source.status === "running")
    },
    get done() {
      return values(self.sources).filter((source) => source.status === "done")
    },
    get progress() {
      return (
        (self.allSources.length - self.pending.length) / self.allSources.length
      )
    },
    get allSources() {
      return values(self.sources)
    },
    get sortedSources() {
      return orderBy(self.allSources, "updatedAt", "desc")
    },
    get allItems() {
      if (self.activeSource) {
        return self.activeSource.allItems
      }

      return orderBy(
        flatten(map(self.allSources, "allItems")),
        "publishedAt",
        "desc",
      )
    },
    get filteredItems() {
      const regex = new RegExp(self.filter, "i")
      return self.allItems.filter((item) => {
        if (self.filter.length > 0) {
          return Object.values(item).some((x) => regex.test(x))
        }
        return true
      })
    },
    get activeSourceIndex() {
      return self.sortedSources.indexOf(self.activeSource)
    },
    get activeItemIndex() {
      return self.filteredItems.indexOf(self.activeItem)
    },
    get notificationCount() {
      return self.sortedSources.reduce(
        (count, source) => count + source.newItemsCount,
        0,
      )
    },
  }))
  .actions((self) => ({
    afterCreate() {
      disposables.push(
        autorun(() => {
          remote.app.badgeCount = self.notificationCount
        }),
      )

      disposables.push(
        autorun(() => {
          self.setActiveItem(self.allItems[0])
        }),
      )

      disposables.push(
        autorun(() => {
          if (
            self.activeItem?.source.readability &&
            !self.activeItem?.readableDescription
          ) {
            self.activeItem.makeReadable()
          }
        }),
      )

      disposables.push(
        autorun(async () => {
          if (
            self.pending.length > 0 &&
            self.running.length < self.concurrency
          ) {
            const source = self.pending.shift()
            source.fetch()
          }
        }),
      )
    },
    afterDestroy() {
      disposables.forEach((dispose) => dispose())
    },
    setActiveSource(source) {
      self.activeSource = source
    },
    setActiveItem(value) {
      self.activeItem = value
    },
    advanceItem(direction) {
      const nextIndex = self.activeItemIndex + direction
      if (self.filteredItems[nextIndex]) {
        self.setActiveItem(self.filteredItems[nextIndex])
        return true
      }
      return false
    },
    advanceSource(direction) {
      const nextIndex = self.activeSourceIndex + direction
      if (self.sortedSources[nextIndex]) {
        self.setActiveSource(self.sortedSources[nextIndex])
        return true
      }
      return false
    },
    setFilter(value) {
      self.filter = value
    },
    setMode(mode) {
      self.mode = mode
    },
    addSource(source) {
      self.sources.put(source)
    },
    removeSource(source) {
      if (self.activeSource === source) {
        self.setActiveSource(null)
      }
      destroy(source)
    },
    clearItems() {
      self.allItems.forEach((x) => x.markAsRead())
    },
    fetchSources() {
      self.sortedSources.forEach((source) => {
        source.setStatus("pending")
      })
    },
    importOPML(path) {
      const sources = parseOPML(path)

      sources.forEach((source) => {
        try {
          self.addSource(source)
        } catch (err) {
          console.warn(err)
        }
      })
    },
  }))
