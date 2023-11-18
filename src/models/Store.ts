import { values, autorun } from "mobx"
import { productName } from "../../package.json"
import { sumBy, max, map, orderBy, flatten } from "lodash"
import { types as t, destroy, Instance } from "mobx-state-tree"

import { Item } from "./Item"
import { Source } from "./Source"
import { OEmbeds } from "./OEmbeds"
import { now } from "mobx-utils"

const disposables = []

export const Store = t
  .model("Store", {
    sources: t.optional(t.map(Source), {}),
    concurrency: t.optional(t.number, 4),
    filter: t.optional(t.string, ""),
    isEditing: t.optional(t.boolean, false),
    activeSourceIndex: t.optional(t.number, -1),
    oEmbeds: t.optional(OEmbeds, {}),
    activeItem: t.maybeNull(
      t.reference(Item, {
        onInvalidated(e) {
          e.removeRef()
        },
      }),
    ),
  })
  .views((self) => ({
    get noEmbed() {
      return new NoEmbed()
    },
    get newItemsCount() {
      return sumBy(self.allSources, "newItemsCount")
    },
    get updatedAt() {
      return max(map(self.allSources, "updatedAt"))
    },
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
    get allSourceItems() {
      return orderBy(
        flatten(map(self.allSources, "allItems")),
        "publishedAt",
        "desc",
      )
    },
    get sortedSources() {
      return orderBy(
        self.allSources,
        ["updatedAt", "newItemsCount", "title"],
        ["desc", "desc", "asc"],
      )
    },
    get sortedItems() {
      if (self.activeSource) {
        return self.activeSource.sortedItems
      }

      return self.allSourceItems
    },
    get filteredItems() {
      const regex = new RegExp(self.filter, "i")
      return self.sortedItems.filter((item) => {
        if (self.filter.length > 0) {
          return Object.values(item).some((x) => regex.test(x))
        }
        return true
      })
    },
    get activeSource() {
      return self.sortedSources[self.activeSourceIndex]
    },
    get activeItemIndex() {
      return self.filteredItems.indexOf(self.activeItem)
    },
  }))
  .actions((self) => ({
    afterCreate() {
      disposables.push(
        autorun(() => {
          document.title = `${productName} (${self.newItemsCount})`
        }),
      )

      disposables.push(
        autorun(() => {
          if (self.isEditing) return
          self.allSources.forEach((source) => {
            if (source.status === "done") {
              if (now() - source.lastUpdateAt > source.interval * 60 * 1000) {
                source.update({ status: "pending" })
              }
            }
          })
        }),
      )

      disposables.push(
        autorun(() => {
          this.setActiveItem(self.filteredItems[0])
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
    toggleEdit() {
      self.isEditing = !self.isEditing
    },
    setActiveSource(source) {
      self.activeSourceIndex = self.sortedSources.indexOf(source)
    },
    setActiveItem(value) {
      self.activeItem = value
    },
    advanceSource(direction) {
      const nextIndex = self.activeSourceIndex + direction
      if (nextIndex >= -1 && nextIndex < self.sortedSources.length - 1) {
        self.setActiveSource(self.sortedSources[nextIndex])
        return true
      }
      return false
    },
    setFilter(value) {
      self.filter = value
    },
    update(props: Partial<Instance<typeof self>>) {
      Object.assign(self, props)
    },
    addSource(source) {
      self.sources.put(source)
      this.setActiveSource(source)
    },
    removeSource(source) {
      if (self.activeSource === source) {
        self.setActiveSource(null)
      }
      destroy(source)
    },
    clearItems(reset = false) {
      if (self.activeSource) {
        self.activeSource.clearItems(reset)
      } else {
        self.allSources.forEach((x) => x.clearItems(reset))
      }
    },
    fetchSources() {
      self.sortedSources.forEach((source) => {
        source.update({ status: "pending" })
      })
    },
  }))
