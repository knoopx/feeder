import sizzle from "sizzle"
import moment from "moment"
import { parse as parser } from "./parser.peggy"
import { flow, isArray, isFunction, isString } from "lodash"
import { parseHumanRelative } from "./util"
import { parseDocument } from "./parseDOM"

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

export const $auto = (input: string | string[] | Element | Document) => {
  if (Array.isArray(input)) {
    return $auto(input[0])
  }
  if (input instanceof Document) {
    return input.documentElement.innerHTML
  }
  if (input instanceof HTMLImageElement) {
    return input.src
  }
  if (input instanceof Element) {
    return input.textContent?.trim()
  }
  if (typeof input === "string") {
    return input?.trim()
  }
  return input
}

export function $first(result: any) {
  if (isArray(result)) {
    return result[0]
  }
  return result
}

export const $text = (input: any) => {
  if (input instanceof Document) {
    return input.body.textContent
  }
  if (input instanceof Element) {
    return input.textContent
  }
  return null
}
export const $element = (result: any) => {
  if (result instanceof Document || result instanceof Element) return result
  return null
}

export const $html = (input: Element | string) => {
  if (input instanceof Document) {
    return input.documentElement.innerHTML
  }

  if (input instanceof Element) {
    return input.innerHTML
  }

  return null
}

export const $string = (input: any): string | null => {
  ;[
    flow($element, $text),
    flow($first, $element, $text),
    flow($first, (x) => isString(x) && x),
  ].find((fn) => {
    const result = fn(input)
    if (result !== null) {
      return result
    }
  })
  return null
}

export const $trim = (value: any) => {
  if (isString(value)) return value.trim()
  return value
}

export function evalInScope(js: string, contextAsScope: object) {
  try {
    const result = new Function(`with (this) { return (${js}); }`).call(
      contextAsScope,
    )
    if (isFunction(result)) {
      return result.call(contextAsScope)
    }
    return result
  } catch (e) {
    return e
  }
}

export function makeContext(result: any) {
  return {
    lower() {
      return $auto(result).toLocaleLowerCase()
    },
    upper() {
      return $auto(result).toLocaleUpperCase()
    },
    capitalize() {
      return result[0].toLocaleUpperCase() + result.slice(1).toLocaleLowerCase()
    },
    format(format: string) {
      if (!isArray(result)) {
        throw new Error("format() requires an array")
      }
      const values = result.map((x: any) => $auto(x))
      return format.replace(/{(\d+)}/g, (match, number) => {
        return typeof values[number] === "undefined" ? match : values[number]
      })
    },
    split(separator: string) {
      return $auto(result).split(separator)
    },
    join(separator: string) {
      if (!Array.isArray(result)) {
        result = [result]
      }
      return result.map($auto).join(separator)
    },
    replace(search: string, replace: string) {
      return $auto(result).replace(search, replace)
    },
    auto() {
      return $auto(result)
    },
    trim() {
      return $trim(result)
    },
    append(text: string) {
      return result + text
    },
    prepend(text: string) {
      return text + result
    },
    date(format: string) {
      const value = $auto(result)
      if (!value) return null
      if (!format) {
        const date = new Date(value)
        if (isNaN(date.getTime())) return null
      }
      if (format === "iso") return Date.parse(value)
      return moment(value, format).toDate()
    },
    relativeDate() {
      return parseHumanRelative($auto(result), new Date())
    },
    first() {
      if (Array.isArray(result)) {
        return result[0]
      }
      return result
    },
    last() {
      if (Array.isArray(result)) {
        return result[result.length - 1]
      }
      return result
    },
    q(selector: string) {
      const value = $auto(result)
      const doc = parseDocument(value ?? "", "text/html")
      return parse(selector)(doc)
    },
  }
}
