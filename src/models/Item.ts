import { types as t, flow, getParent } from "mobx-state-tree"
import { parseDocument } from "../support/parseDOM"
import { fetchDoc } from "../support/fetchDoc"
import { Readability } from "readability"

export const Item = t
  .model("Item", {
    id: t.identifier,
    // id: t.optional(t.identifier, () => Math.random().toString(36).substr(2, 9)),
    title: t.string,
    author: t.maybeNull(t.string),
    link: t.string,
    description: t.maybeNull(t.string),
    publishedAt: t.optional(t.Date, () => new Date()),
    isNew: t.optional(t.boolean, true),
  })
  .views((self) => ({
    get source() {
      return getParent(self, 2)
    },
    get summary() {
      const doc = parseDocument(self.description)
      return doc.body.innerText.slice(0, 200)
    },
    get key() {
      return [self.source.href, self.link]
    },
  }))
  .volatile(() => ({
    readableDescription: false,
  }))
  .actions((self) => ({
    markAsRead() {
      self.isNew = false
    },
    makeReadable: flow(function* () {
      const doc = yield fetchDoc(self.link)
      const { content } = new Readability(doc).parse()
      self.readableDescription = content
    }),
  }))
