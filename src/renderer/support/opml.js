import fs from "fs"

import query from "./query"
import { parse } from "./parse"

const parseSources = query(["outline[type='rss']"], {
  title: "@title",
  href: "@xmlUrl",
})

export const parseOPML = (path) => {
  const data = fs.readFileSync(path)
  return parseSources(parse(data, "text/xml"))
}
