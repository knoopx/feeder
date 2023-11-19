import { Item } from "./Item"
import { values } from "mobx"
import { orderBy, uniqBy } from "lodash"
import { types as t, getParent, destroy, Instance } from "mobx-state-tree"
import { fetchDoc } from "../support/fetchDoc"
import { summarize } from "../support/processor"
import { parseDocument } from "../support/parseDOM"
import { parse } from "../support/parsing"
import { parseDOM } from "../support/parseDOM"
import { digest, h } from "../support/util"

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
    id: t.identifier,
    title: t.string,
    hrefs: t.array(t.string),
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
    activeItemId: t.maybeNull(t.string),
  })
  .volatile(() => ({
    error: null as Error | null,
    documents: [] as Document[],
  }))
  .views((self) => ({
    match(document: Document) {
      try {
        switch (self.kind) {
          case "xml":
          case "html":
            return parseDOM(document, self.selectors)
          case "json":
            return parseJSON(document, self.selectors)
          default:
            throw new Error(`Unable to handle source of type "${self.kind}"`)
        }
      } catch (err) {
        return []
      }
    },
    get activeIndex(): number {
      return this.lastItems.indexOf(self.activeItem)
    },
    get activeItem(): Instance<typeof Item> | null {
      return this.lastItems.find(({ id }) => id === self.activeItemId)
    },
    get activeElement(): Element | null {
      if (!this.activeItem?.document) return null

      return parse(self.selectors.item)(this.activeItem.document)[
        this.activeIndex
      ]
    },
    get matches(): Instance<typeof Selectors>[] {
      const matches = self.documents
        .flatMap((d: Document) =>
          this.match(d).map((m) => ({
            ...m,
            document: d,
          })),
        )
        .filter((m) => m.href)

      return orderBy(matches, "publishedAt", "desc")
    },
    get lastItems(): Instance<typeof Item>[] {
      const parsed = this.matches.map((props: Instance<typeof Selectors>) => {
        return {
          ...props,
          id: digest(props.href),
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
        if (this.activeItem?.document !== null) {
          preview = this.activeItem?.document.cloneNode(true) as Document
          if (self.selectors.item) {
            if (self.kind === "html") {
              htmlPreview(preview, self.selectors, this.activeIndex)
            } else {
              // TODO: implement
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
    afterCreate() {},
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

    async fetch(onlyFetch = false) {
      const documents = await Promise.all(self.hrefs.map(this.fetchUrl))
      this.update({ documents })
      if (onlyFetch) return
      for (const item of self.lastItems) {
        try {
          this.addItem(item)
        } catch (err) {
          console.warn(err)
        }
      }
    },
    async fetchUrl(href: string) {
      try {
        this.update({ error: null, status: "running" })
        console.info("fetching", href)
        return fetchDoc(href)
      } catch (error) {
        this.update({ error: error as Error })
        console.warn(error)
      } finally {
        this.update({ status: "done", lastUpdateAt: new Date() })
      }
    },
  }))
