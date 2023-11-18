import moment from "moment"
import { parseDocument } from "./parseDOM"

import * as dateFns from "date-fns"
import _parseHumanRelative from "parse-human-relative-time/date-fns"
import { isArray, isString, isEmpty, isFunction } from "lodash"
import { parse } from "./parsing"

const parseHumanRelative = _parseHumanRelative(dateFns)

const nullify = (x: any) => {
  if (isArray(x) && x.length === 0) {
    return null
  }

  if (isString(x) && isEmpty(x)) {
    return null
  }

  return x
}

const autoValue = (
  input: Element | string | Element[] | string[],
): string | null => {
  if (isArray(input)) {
    return autoValue(input[0])
  }

  if (input instanceof Document) {
    return input.documentElement.innerHTML
  }

  if (input instanceof Element) {
    return input.textContent
  }

  return input
}

export const trim = (value: any) => {
  if (typeof value === "string") return value.trim()
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
    value: autoValue(result),
    lower() {
      return autoValue(result).toLocaleLowerCase()
    },
    upper() {
      return autoValue(result).toLocaleUpperCase()
    },
    capitalize() {
      return result[0].toLocaleUpperCase() + result.slice(1).toLocaleLowerCase()
    },
    format(format: string) {
      if (!isArray(result)) {
        throw new Error("format() requires an array")
      }
      const values = result.map((x: any) => autoValue(x))
      return format.replace(/{(\d+)}/g, (match, number) => {
        return typeof values[number] === "undefined" ? match : values[number]
      })
    },
    split(separator: string) {
      return autoValue(result).split(separator)
    },
    join(separator: string) {
      if (!Array.isArray(result)) {
        result = [result]
      }
      return result.map(autoValue).join(separator)
    },
    replace(search: string, replace: string) {
      return autoValue(result).replace(search, replace)
    },
    auto() {
      return autoValue(result)
    },
    trim() {
      return trim(result)
    },
    append(text: string) {
      return result + text
    },
    prepend(text: string) {
      return text + result
    },
    date(format: string) {
      const value = autoValue(result)
      if (!value) return null
      if (!format) {
        const date = new Date(value)
        if (isNaN(date.getTime())) return null
      }
      if (format === "iso") return Date.parse(value)
      return moment(value, format).toDate()
    },
    relativeDate() {
      return parseHumanRelative(autoValue(result), new Date())
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
      const value = autoValue(result)
      const doc = parseDocument(value ?? "", "text/html")
      return parse(selector)(doc)
    },
  }
}
export function randomChoice(array: any[]) {
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}
export const h = (
  tag: string,
  props: { [key: string]: any },
  ...children: any[]
) => {
  const el = document.createElement(tag)
  Object.assign(el, props)
  el.append(...children)
  return el
}
