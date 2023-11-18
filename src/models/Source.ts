import { Item } from "./Item"
import { values } from "mobx"
import { orderBy, uniqBy } from "lodash"
import { types as t, flow, getParent, destroy, Instance } from "mobx-state-tree"
import { fetchDoc } from "../support/fetchDoc"
import { summarize } from "../support/processor"
import { parseDocument } from "../support/parseDOM"
import sha256 from "sha256"
import { parse } from "../support/parsing"
import { parseDOM } from "../support/parseDOM"
import { h } from "../support/util"

const disposables: (() => void)[] = []

function htmlPreview(
  preview: Document,
  selectors: Instance<typeof Selectors>,
  activeIndex: number,
) {
  parse("script")(preview).map((el: Element) => el.remove())

  parse(selectors.item)(preview).map((el: Element, i: number) => {
    el.setAttribute("style", "border: 2px solid red !important;")
    el.setAttribute("data-i", String(i))
  })

  const fn = (index: number) => {
    const el = document.querySelector(`[data-i="${index}"]`)
    el?.scrollIntoView({ block: "center" })
  }
  preview.body.appendChild(
    h("script", {}, `(${fn.toString()})(${activeIndex})`),
  )
  return preview
}

export const Selectors = t
  .model("Selectors", {
    item: t.optional(t.string, ""),
    title: t.optional(t.string, ""),
    href: t.optional(t.string, ""),
    description: t.optional(t.string, ""),
    image: t.optional(t.string, ""),
    author: t.optional(t.string, ""),
    publishedAt: t.optional(t.string, ""),
  })
  .actions((self) => ({
    update(props: Partial<Instance<typeof self>>) {
      Object.assign(self, props)
    },
  }))

export const Source = t
  .model("Source", {
    title: t.string,
    href: t.identifier,
    image: t.maybeNull(t.string),
    description: t.maybeNull(t.string),
    baseURL: t.maybeNull(t.string),
    kind: t.optional(t.enumeration(["xml", "json", "html"]), "xml"),
    items: t.optional(t.map(Item), {}),
    status: t.optional(
      t.enumeration(["pending", "running", "done"]),
      "pending",
    ),
    readability: t.optional(t.boolean, false),
    selectors: t.optional(Selectors, {}),
    clearedAt: t.maybeNull(t.Date),
    lastUpdateAt: t.optional(t.Date, () => new Date()),
    interval: t.optional(t.number, 15), // minutes
  })
  .volatile(() => ({
    error: null,
    document: null as Document | null,
    activeIndex: 0,
  }))
  .views((self) => ({
    get id() {
      return self.href
    },
    get activeItem() {
      return this.lastItems[self.activeIndex]
    },
    get matches() {
      return orderBy(this._matches, "publishedAt", "desc")
    },
    get _matches() {
      if (!self.document) return []
      try {
        switch (self.kind) {
          case "xml":
          case "html":
            return parseDOM(self.document, self.selectors)
          case "json":
            return parseJSON(self.document, self.selectors)
          default:
            throw new Error(`Unable to handle source of type "${self.kind}"`)
        }
      } catch (err) {
        return []
      }
    },
    get lastItems() {
      const parsed = this.matches.map((props, i) => {
        return {
          id: sha256(self.href + props.href).slice(0, 8),
          ...props,
          summary: props.description
            ? summarize(parseDocument(props.description))
            : null,
          source: self,
        }
      })

      return uniqBy(parsed, "id")
    },
    get preview() {
      try {
        let preview: Document | null = null
        if (self.document !== null) {
          preview = self.document.cloneNode(true) as Document
          if (self.selectors.item) {
            if (self.kind === "html") {
              htmlPreview(preview, self.selectors, self.activeIndex)
            }
          }
        }
        return preview
      } catch (err) {
        // console.warn(err)
        return err
      }
    },
    get isLoading() {
      return self.status === "running"
    },
    get store() {
      return getParent(self, 2)
    },
    get allItems() {
      return values(self.items)
    },
    get sortedItems(): Instance<typeof Item>[] {
      return orderBy(this.allItems, ["publishedAt"], ["desc"])
    },
    get lastPublishedAt() {
      return this.sortedItems[0]?.publishedAt
    },
    get updatedAt() {
      return this.lastPublishedAt || self.clearedAt || 0
    },
    get newItemsCount() {
      return values(self.items).filter((item) => item.isNew).length
    },
  }))
  .actions((self) => ({
    afterCreate() {
      // disposables.push(
      //   reaction(
      //     () => getSnapshot(self),
      //     () => {
      //       try {
      //       } catch (err) {
      //         console.warn(err)
      //       }
      //     },
      //   ),
      // )
    },
    beforeDestroy() {
      disposables.forEach((dispose) => dispose())
    },
    update(snapshot: Partial<Instance<typeof self>>) {
      Object.assign(self, snapshot)
    },
    clearItems(reset = false) {
      if (reset) {
        self.clearedAt = null
      } else if (self.lastPublishedAt) {
        self.clearedAt = new Date()
      }
      self.allItems.forEach((item) => {
        if (item.publishedAt < self.clearedAt) {
          destroy(item)
        } else {
          item.update({ isNew: false })
        }
      })
    },
    addItem({ href, publishedAt, ...rest }: Instance<typeof Item>) {
      if (!self.clearedAt || publishedAt > self.clearedAt) {
        const item = self.items.get(href)
        self.items.put({
          href,
          publishedAt,
          ...item,
          ...rest,
        })
      }
    },
    toggleReadability() {
      self.readability = !self.readability
    },

    fetch: flow(function* (onlyFetch = false) {
      try {
        self.error = null
        self.update({ status: "running" })

        console.log("fetching", self.href)
        self.document = yield fetchDoc(self.href)
        if (onlyFetch) return

        for (const item of self.lastItems) {
          try {
            self.addItem(item)
          } catch (err) {
            console.warn(err)
          }
        }
      } catch (err) {
        self.update({ error: err })
        console.warn(err)
      } finally {
        self.update({ status: "done", lastUpdateAt: new Date() })
      }
    }),
  }))
