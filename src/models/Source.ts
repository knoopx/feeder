import q from "domqs"
import { Item } from "./Item"
import { autorun, values } from "mobx"
import { orderBy } from "lodash"
import { types as t, flow, getParent, destroy, Instance } from "mobx-state-tree"
import { parseFeed } from "../support/parseFeed"
import { fetchDoc } from "../support/fetchDoc"

const disposables: (() => void)[] = []

const sha256 = async (x: string) => {
  const buffer = new TextEncoder().encode(x)
  const hash = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const parseDOM = async (
  doc: Document,
  selectors: Instance<typeof Selectors>,
) => {
  const { item, ...rest } = selectors
  return q([item], rest)(doc)
}

type Response = {
  items: Instance<typeof Item>[]
  source: Partial<Instance<typeof Source>>
}

const Selectors = t
  .model("Selectors", {
    item: t.optional(t.string, ""),
    title: t.optional(t.string, ""),
    link: t.optional(t.string, ""),
    description: t.optional(t.string, ""),
    image: t.optional(t.string, ""),
  })
  .actions((self) => ({
    update(props: Partial<Instance<typeof self>>) {
      Object.assign(self, props)
    },
  }))

export const Source = t
  .model("Source", {
    kind: t.optional(t.enumeration(["feed", "xml", "json", "html"]), "feed"),
    title: t.string,
    href: t.identifier,
    link: t.maybeNull(t.string),
    image: t.maybeNull(t.string),
    description: t.maybeNull(t.string),
    language: t.maybeNull(t.string),
    items: t.optional(t.map(Item), {}),
    clearedAt: t.maybeNull(t.Date),
    status: t.optional(
      t.enumeration(["pending", "running", "done"]),
      "pending",
    ),
    readability: t.optional(t.boolean, false),
    selectors: t.optional(Selectors, {}),
  })
  .volatile(() => ({
    error: null,
    lastResponse: null as Document | null,
    parsedItems: [] as Instance<typeof Item>[],
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
        autorun(async () => {
          if (self.activeSource) {
            const results = await self.activeSource.parse()
            console.log(results.items)
            self.update({ parsedItems: results.items })
          }
        }),
      )
    },
    beforeDestroy() {
      disposables.forEach((dispose) => dispose())
    },
    update(snapshot: Partial<Instance<typeof self>>) {
      Object.assign(self, snapshot)
    },
    clearItems() {
      if (self.lastPublishedAt) {
        self.clearedAt = self.lastPublishedAt
      }
      self.allItems.forEach((item) => {
        destroy(item)
      })
    },
    addItem({ link, publishedAt, ...rest }: Instance<typeof Item>) {
      if (!self.clearedAt || publishedAt > self.clearedAt) {
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

    async parse(): Promise<Response> {
      if (!self.lastResponse) {
        return { items: [], source: {} }
      }

      switch (self.kind) {
        case "feed":
          return parseFeed(self.lastResponse)
        case "xml":
        case "html":
          const items = await parseDOM(self.lastResponse, self.selectors)
          return { items, source: {} }
        case "json":
          return parseJSON(self.lastResponse)
        default:
          throw new Error(`Unable to handle source of type "${self.kind}"`)
      }
    },
    fetch: flow(function* () {
      try {
        self.error = null
        self.update({ status: "running" })

        self.lastResponse = yield fetchDoc(self.href)

        const { items, source } = yield self.parse()
        self.parsedItems = items
        console.log(self.href, { items, source })

        try {
          self.update(source)
        } catch (err) {
          console.warn(err)
        }

        for (const item of items) {
          try {
            const id = yield sha256(self.href + item.link)
            self.addItem({ id, ...item })
          } catch (err) {
            console.warn(err)
          }
        }
        // items.forEach(async (item) => {
        //   try {
        //     self.addItem({ id: await sha256(self.href + item.href), ...item })
        //   } catch (err) {
        //     console.warn(err)
        //   }
        // })
      } catch (err) {
        self.error = err
        console.warn(err)
      } finally {
        self.update({ status: "done", lastUpdateAt: Date.now() })
      }
    }),
  }))
