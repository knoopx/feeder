import { Selectors } from "../models/Source"
import { Instance } from "mobx-state-tree"
import { parse, $auto } from "./parsing"

const absolutizeProp = (prop: string, base: string) => (doc: Document) => {
  Array.from(doc.querySelectorAll(`[${prop}]`)).forEach((node) => {
    try {
      node.setAttribute(
        prop,
        new URL(node.getAttribute(prop) ?? "", base).toString(),
      )
    } catch (err) {
      console.warn(err)
    }
  })
  return doc
}

export const absolutize = (doc: Document, base: string) => {
  // todo: srcset

  // fix lazy-loaded images
  Array.from(doc.querySelectorAll("[data-src]")).forEach((node) => {
    node.setAttribute("src", node.getAttribute("data-src") ?? "")
  })

  absolutizeProp("src", base)(doc)
  absolutizeProp("href", base)(doc)
  return doc
}

export const parseDocument = (
  text: string,
  type: DOMParserSupportedType = "text/html",
  base?: string,
) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, type)
  if (type.includes("html") && base) {
    absolutize(doc, base)
  }
  return doc
}
export const parseDOM = (
  doc: Document,
  selectors: Instance<typeof Selectors>,
) => {
  const { item, ...itemSelectors } = selectors
  return parse(item)(doc).map((el: Element) =>
    Object.keys(itemSelectors).reduce(
      (acc: { [key: string]: any }, key: string) => ({
        ...acc,
        [key]: $auto(parse(itemSelectors[key])(el)),
      }),
      {},
    ),
  )
}
