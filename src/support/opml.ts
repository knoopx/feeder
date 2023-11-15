import q from "../support/q"
import fs from "fs"

import { parseDocument } from "./parseDOM"

const parseSources = q("outline[type='rss']", {
  title: "@title",
  href: "@xmlUrl",
})

export const parseOPML = (path: string) => {
  const data = fs.readFileSync(path)
  return parseSources(parseDocument(data.toString(), "text/xml"))
}
