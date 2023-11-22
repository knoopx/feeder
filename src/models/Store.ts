import { values, autorun } from "mobx"
import { productName } from "../../package.json"
import { sumBy, max, map, orderBy, filter, flatten } from "lodash"
import { types as t, destroy, Instance } from "mobx-state-tree"

import { Item } from "./Item"
import { Source } from "./Source"
import { OEmbeds } from "./OEmbeds"
import { now } from "mobx-utils"

const disposables: (() => void)[] = []

export const Store = t
  .model("Store", {
    sources: t.optional(t.map(Source), {}),
    concurrency: t.optional(t.number, 4),
    filter: t.optional(t.string, ""),
    isEditing: t.optional(t.boolean, false),
    oEmbeds: t.optional(OEmbeds, {}),
    activeSource: t.maybeNull(t.safeReference(Source)),
    _activeItem: t.maybeNull(t.safeReference(Item)),
  })
  .views((self) => ({
    get newItemsCount() {
      return sumBy(this.allSources, "newItemsCount")
    },
    get updatedAt() {
      return max(map(this.allSources, "updatedAt"))
    },
    get pending() {
      return filter(this.allSources, { status: "pending" })
    },
    get running() {
      return filter(this.allSources, { status: "running" })
    },
    get done() {
      return filter(this.allSources, { status: "done" })
    },
    get progress() {
      return (
        (this.allSources.length - this.pending.length) / this.allSources.length
      )
    },
    get allSources() {
      return values(self.sources)
    },
    get allSourceItems() {
      return orderBy(
        flatten(map(this.allSources, "allItems")),
        "publishedAt",
        "desc",
      )
    },
    get sortedSources() {
      return orderBy(
        this.allSources,
        ["updatedAt", "newItemsCount", "title"],
        ["desc", "desc", "asc"],
      )
    },
    get sortedItems() {
      if (self.activeSource) {
        return self.activeSource.sortedItems
      }

      return this.allSourceItems
    },
    get filteredItems() {
      const regex = new RegExp(self.filter, "i")
      return this.sortedItems.filter((item) => {
        if (self.filter.length > 0) {
          return Object.values(item).some((x) => regex.test(x))
        }
        return true
      })
    },
    get activeItem() {
      return self.activeSource?.activeItem ?? self._activeItem
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
          if (self.activeSource && self.activeItem === null) {
            this.setActiveItem(self.filteredItems[0])
          }
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
    setActiveSource(source: Instance<typeof Source> | null) {
      self._activeItem = null
      self.activeSource = source
    },
    setActiveItem(item: Instance<typeof Item> | null) {
      self._activeItem = item
      item?.source.update({ activeItemId: item.id })
    },
    advanceSource(direction: number) {
      const nextIndex =
        self.sortedSources.indexOf(self.activeSource) + direction
      if (nextIndex >= -1 && nextIndex < self.sortedSources.length - 1) {
        this.setActiveSource(self.sortedSources[nextIndex])
        return true
      }
      return false
    },
    update(props: Partial<Instance<typeof self>>) {
      Object.assign(self, props)
    },
    addSource(source: Instance<typeof Source>) {
      self.sources.put(source)
      this.setActiveSource(source)
    },
    removeSource(source: Instance<typeof Source>) {
      if (self.activeSource === source) {
        this.setActiveSource(null)
      }
      destroy(source)
    },
    clearItems(reset = false) {
      if (self.activeSource) {
        self.activeSource.clearItems(reset)
      } else {
        self.allSources.forEach((x) => void x.clearItems(reset))
      }
    },
    fetchSources() {
      self.sortedSources.forEach((source) => {
        source.update({ status: "pending" })
      })
    },
  }))
