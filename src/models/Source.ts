import q from "../support/q"
import { Item } from "./Item"
import { reaction, values } from "mobx"
import { orderBy, uniqBy } from "lodash"
import {
  types as t,
  flow,
  getParent,
  destroy,
  Instance,
  getSnapshot,
} from "mobx-state-tree"
import { fetchDoc } from "../support/fetchDoc"
import { summarize } from "../support/processor"
import { parseDocument } from "../support/parseDOM"
import sha256 from "sha256"
import { min } from "date-fns"

const disposables: (() => void)[] = []

const parseDOM = (doc: Document, selectors: Instance<typeof Selectors>) => {
  const { item, ...rest } = selectors
  return q(item, rest)(doc)
}

const Selectors = t
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
    lastItems: [],
  }))
  .views((self) => ({
    get id() {
      return self.href
    },
    get preview() {
      try {
        let preview: Document | null = null
        if (self.document !== null) {
          preview = self.document.cloneNode(true) as Document
          // if (self.selectors.item) {
          //   const matches = preview.querySelectorAll(self.selectors.item)
          //   preview.documentElement.replaceChildren(...matches)
          // }
        }
        return preview
      } catch (err) {
        console.warn(err)
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
      disposables.push(
        reaction(
          () => getSnapshot(self),
          () => {
            try {
              self.parse()
            } catch (err) {
              console.warn(err)
            }
          },
        ),
      )
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

    parse() {
      if (!self.document) {
        self.lastItems = []
        return
      }
      function adapter() {
        switch (self.kind) {
          case "xml":
          case "html":
            return parseDOM(self.document, self.selectors)
          case "json":
            return parseJSON(self.document, self.selectors)
          default:
            throw new Error(`Unable to handle source of type "${self.kind}"`)
        }
      }

      const parsed = adapter().map((props, i) => {
        return {
          id: sha256(self.href + props.href).slice(0, 8),
          ...props,
          summary: props.description
            ? summarize(parseDocument(props.description))
            : null,
          source: self,
        }
      })

      self.lastItems = orderBy(uniqBy(parsed, "href"), "publishedAt", "desc")
    },
    fetch: flow(function* (onlyFetch = false) {
      try {
        self.error = null
        self.update({ status: "running" })

        console.log("fetching", self.href)
        self.document = yield fetchDoc(self.href)
        self.parse()
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
