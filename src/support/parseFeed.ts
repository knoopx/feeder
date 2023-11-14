import q from "domqs"
import { parseISO } from "date-fns"

const parseDate = (x: string) => {
  if (x === null) return new Date()
  const date = new Date(x)
  return isNaN(date) ? new Date() : date
}

const parseRSSSource = q({
  title: "title",
  link: "link",
  description: "description",
  language: "language",
})

const parseRSSItems = q(["item"], {
  title: "title",
  link: "guid[isPermaLink='true'], link",
  author: "author",
  description: "description",
  publishedAt: q("pubDate", parseDate),
})

const parseAtomSource = q({
  title: "title",
  link: "link",
})

const parseAtomItems = q(["entry"], {
  title: "title",
  link: "link@href",
  author: "author name",
  description: "content",
  publishedAt: q("updated", parseISO),
})

export const parseFeed = async (doc: Document) => {
  switch (doc.querySelector(":root")?.nodeName) {
    case "rss":
      return parseRSS(doc)
    case "feed":
      return parseAtom(doc)
    default:
      throw new Error("Unable to determine feed type")
  }
}
function parseAtom(doc: Document) {
  return {
    source: parseAtomSource(doc),
    items: parseAtomItems(doc),
  }
}

function parseRSS(doc: Document) {
  return {
    source: parseRSSSource(doc),
    items: parseRSSItems(doc),
  }
}
