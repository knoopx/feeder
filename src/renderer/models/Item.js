import { types as t, flow, getParent } from "mobx-state-tree"
import { parse, scrape } from "support/parse"
import Readability from "readability"

const Item = t
  .model("Item", {
    title: t.string,
    author: t.maybeNull(t.string),
    link: t.identifier,
    description: t.maybeNull(t.string),
    publishedAt: t.maybeNull(t.Date),
    isNew: t.optional(t.boolean, true),
    readability: t.optional(
      t.model({
        content: t.maybeNull(t.string),
        status: t.optional(
          t.enumeration(["pending", "running", "done", "error"]),
          "pending",
        ),
      }),
      {},
    ),
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
  .actions((self) => ({
    markAsRead() {
      self.isNew = false
    },
    makeReadable: flow(function*() {
      try {
        self.readability.status = "running"
        const doc = yield scrape(self.link)
        const { content } = new Readability(doc).parse()
        self.readability.content = content
        self.readability.status = "done"
      } catch (err) {
        self.readability.status = "error"
        console.warn(err)
      }
    }),
  }))

export default Item
