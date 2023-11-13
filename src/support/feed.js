import q from "domqs"
import { scrape } from "./parse"
import { parseISO } from "date-fns"

const parseDate = (x) => {
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
  link: "link",
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

export const parseSource = async (href) => {
  const doc = await scrape(href, "text/xml")

  switch (doc.querySelector(":root").nodeName) {
    case "rss":
      return {
        source: parseRSSSource(doc),
        items: parseRSSItems(doc),
      }
    case "feed":
      return {
        source: parseAtomSource(doc),
        items: parseAtomItems(doc),
      }
    default:
      throw new Error("Unable to determine feed type")
  }
}
