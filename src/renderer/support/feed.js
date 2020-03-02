import query from "support/query"
import { parse, scrape } from "support/parse"
import { parseISO } from "date-fns"

const htmlDecode = (input) => {
  const doc = parse(input, "text/html")
  return doc.documentElement.textContent
}

const parseRSSSource = query({
  name: "title",
  link: "link",
  description: "description",
  language: "language",
})

const parseRSSItems = query(["item"], {
  guid: "guid",
  title: "title",
  link: "link",
  author: "author",
  description: "description",
  publishedAt: query("pubDate", (x) => new Date(x)),
})

const parseAtomSource = query({
  name: "title",
  link: "link",
})

const parseAtomItems = query(["entry"], {
  guid: "link:not([rel])@href",
  title: "title",
  link: "link@href",
  author: "author",
  description: "content",
  publishedAt: query("updated", parseISO),
})

export const parseSource = async (href) => {
  const doc = await scrape(href, "text/xml")
  console.log(`parsing source ${href}`)

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
