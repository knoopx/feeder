import { types as t, flow, getParent } from "mobx-state-tree"
import { parse, scrape } from "support/parse"
import { prepDocument, grabArticle, getInnerText } from "support/readability"

const Item = t
  .model("Item", {
    guid: t.identifier,
    title: t.string,
    author: t.maybeNull(t.string),
    link: t.maybeNull(t.string),
    description: t.maybeNull(t.string),
    publishedAt: t.maybeNull(t.Date),
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
  }))
  .volatile(() => ({
    readableDescription: false,
  }))
  .actions((self) => ({
    markAsRead() {
      self.isNew = false
    },
    makeReadable: flow(function*() {
      const doc = yield scrape(self.link)
      prepDocument(doc)
      const content = grabArticle(doc)
      self.readableDescription = content.innerHTML
    }),
  }))

export default Item
