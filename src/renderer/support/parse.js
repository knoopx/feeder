const absolutize = (doc, prop, base) => {
  Array.from(doc.querySelectorAll(`[${prop}]`)).forEach((node) => {
    try {
      node.attributes[prop].value = new URL(
        node.attributes[prop].value,
        base,
      ).toString()
    } catch (err) {
      console.warn(err)
    }
  })
}

// enum SupportedType {
//     "text/html",
//     "text/xml",
//     "application/xml",
//     "application/xhtml+xml",
//     "image/svg+xml"
// };
export const parse = (string, type = "text/html", base) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(string, type)
  if (type.includes("html") && base) {
    absolutize(doc, "src", base)
    absolutize(doc, "href", base)
    // todo: srcset
  }
  return doc
}

export const scrape = async (url) => {
  const res = await fetch(url)
  const body = await res.text()
  const type = res.headers.get("Content-Type").includes("html")
    ? "text/html"
    : "text/xml"
  return parse(body, type, url)
}
