import q from "domqs"
import { parse, scrape, absolutize } from "support/parse"
import { parseISO } from "date-fns"

const parseRSS = q({
  title: "title",
  link: "link",
  publishedAt: q("pubDate", (x) => x && new Date(x)),
  description: "description",
  language: "language",
  items: q(["item"], {
    title: "title",
    link: "link",
    author: "author",
    description: "description",
    publishedAt: q("pubDate", (x) => x && new Date(x)),
  }),
})

const parseAtom = q({
  title: "title",
  link: "link",
  publishedAt: q("updated", parseISO),
  items: q(["entry"], {
    title: "title",
    link: "link@href",
    author: "author name",
    description: "content",
    publishedAt: q("updated", parseISO),
  }),
})

const resolveParser = (doc) => {
  switch (doc.querySelector(":root").nodeName) {
    case "rss":
      return parseRSS
    case "feed":
      return parseAtom
    default:
      throw new Error("Unable to determine feed type")
  }
}

export const parseFeed = async (href) => {
  const doc = await scrape(href, "text/xml")
  const parser = resolveParser(doc)
  const { items, ...source } = parser(doc)

  items.forEach((item) => {
    item.description = absolutize(
      parse(item.description),
      item.link,
    ).body.innerHTML
  })

  return { ...source, items }
}
