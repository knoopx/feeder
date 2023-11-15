import { types as t, flow, getParent, getParentOfType } from "mobx-state-tree"
import { parseDocument } from "../support/parseDOM"
import { fetchDoc } from "../support/fetchDoc"
import { Readability } from "@mozilla/readability"
import { Store } from "./Store"
import { summarize } from "../support/processor"

export const Item = t
  .model("Item", {
    id: t.identifier,
    title: t.maybeNull(t.string),
    author: t.maybeNull(t.string),
    href: t.string,
    description: t.maybeNull(t.string),
    image: t.maybeNull(t.string),
    publishedAt: t.maybeNull(t.Date),
    isNew: t.optional(t.boolean, true),
    repunctuatedAt: t.maybeNull(t.Date),
  })
  .views((self) => ({
    get source() {
      return getParent(self, 2)
    },
    get document() {
      return parseDocument(self.description ?? "", "text/html", self.href)
    },
    get summary() {
      return summarize(this.document)
    },
    get htmlDescription() {
      return this.document.body.innerHTML
    },
    get key() {
      return [self.source.href, self.href]
    },
    get oembed() {
      const store = getParentOfType(self, Store)
      return store.oEmbeds.cache.get(self.href)
    },
  }))
  .volatile(() => ({
    readableDescription: false,
  }))
  .actions((self) => ({
    update(props: Partial<typeof self>) {
      Object.assign(self, props)
    },
    makeReadable: flow(function* () {
      const doc = yield fetchDoc(self.href)
      const result = new Readability(doc).parse()
      if (!result) return
      self.update({ readableDescription: result.content })
    }),
  }))
