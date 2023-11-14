import { parseDocument } from "./parseDOM"

export const fetchDoc = async (url: string) => {
  const res = await fetch(url)
  // JSON
  if (res.headers.get("Content-Type")?.includes("json")) {
    return res.json()
  }
  // HTML/XML
  const body = await res.text()
  const type = res.headers.get("Content-Type")?.includes("xml")
    ? "text/xml"
    : "text/html"

  return parseDocument(body, type, url)
}
