const absolutizeProp = (prop, base) => (doc) => {
  Array.from(doc.querySelectorAll(`[${prop}]`)).forEach((node) => {
    try {
      node.setAttribute(prop, new URL(node.getAttribute(prop), base).toString())
    } catch (err) {
      console.warn(err)
    }
  })
  return doc
}

const renameProp = (oldName, newName) => (doc) => {
  Array.from(doc.querySelectorAll(`[${oldName}]`)).forEach((node) => {
    node.setAttribute(newName, node.getAttribute(oldName))
  })
}

export const absolutize = (doc, base) => {
  // todo: srcset

  // fix lazy-loaded images
  renameProp("data-src", "src")(doc)
  renameProp("data-lazy-src", "src")(doc)

  absolutizeProp("src", base)(doc)
  absolutizeProp("href", base)(doc)
  return doc
}

export const parse = (string, type = "text/html", base) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(string, type)
  if (type.includes("html") && base) {
    absolutize(doc, base)
  }
  return doc
}

export const scrape = async (url) => {
  const res = await fetch(url)
  const body = await res.text()
  const contentType = res.headers.get("Content-Type")

  switch (true) {
    case contentType.includes("xml"):
      return parse(body, "text/xml", url)
    case contentType.includes("html"):
      return parse(body, "text/html", url)
    default:
      throw new Error(`Cannot parse content type ${contentType}`)
  }
}
