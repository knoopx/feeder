import { types as t, flow, getParent } from "mobx-state-tree"
import { parse, scrape } from "../support/parse"
import { Readability } from "readability"

const Item = t
  .model("Item", {
    title: t.string,
    author: t.maybeNull(t.string),
    link: t.identifier,
    description: t.maybeNull(t.string),
    publishedAt: t.optional(t.Date, () => new Date()),
    isNew: t.optional(t.boolean, true),
  })
  .views((self) => ({
    get source() {
      return getParent(self, 2)
    },
    get summary() {
      const doc = parse(self.description)
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
      const doc = yield scrape(self.link)
      const { content } = new Readability(doc).parse()
      self.readableDescription = content
    }),
  }))

export default Item
