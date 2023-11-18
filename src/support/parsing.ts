import { parse as parser } from "./parser.peggy"
import sizzle from "sizzle"
import { makeContext } from "./util"

export const autoValue = (input: string | string[] | Element | Document) => {
  if (Array.isArray(input)) {
    return autoValue(input[0])
  }

  if (input instanceof Document) {
    return input.documentElement.innerHTML
  }

  if (input instanceof Element) {
    if (input.tagName === "IMG") return input.src

    return input.textContent?.trim()
  }

  if (typeof input === "string") {
    return input?.trim()
  }

  return input
}

export function parse(expr: string) {
  // try {
  return parser(expr, {
    sizzle,
    makeContext,
  })
  // } catch (e) {
  //   throw new Error(`Error parsing "${expr}": ${e.message}`)
  // }
}
