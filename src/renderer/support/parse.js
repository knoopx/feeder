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

export const absolutize = (doc, base) => {
  // todo: srcset

  // fix lazy-loaded images
  Array.from(doc.querySelectorAll("[data-src]")).forEach((node) => {
    node.setAttribute("src", node.getAttribute("data-src"))
  })

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
  let type = "text/html"
  if (res.headers.get("Content-Type")?.includes("xml")) {
    type = "text/xml"
  }
  return parse(body, type, url)
}
