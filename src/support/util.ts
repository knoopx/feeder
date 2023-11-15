import q from "../support/q"
import moment from "moment"
import { parseDocument } from "./parseDOM"

import * as dateFns from "date-fns"
import _parseHumanRelative from "parse-human-relative-time/date-fns"
import { isArray, isString, isEmpty, isFunction } from "lodash"

const parseHumanRelative = _parseHumanRelative(dateFns)

const nullify = (x: any) => (isEmpty(x) ? null : x)

const autoValue = (
  input: Element | string | Element[] | string[],
): string | null => {
  if (isArray(input)) {
    return nullify(autoValue(input[0]))
  }

  if (isString(input)) {
    return nullify(input.trim())
  }
  if (input instanceof Document) {
    return input.documentElement.innerHTML
  }

  if (input instanceof Element) {
    return nullify(input.textContent?.trim())
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
    return e.message
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
      if (!format) return new Date(value)
      if (format === "iso") return Date.parse(value)
      return moment(value, format).toDate()
    },
    relativeDate() {
      return parseHumanRelative(result, new Date())
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
      const results = q(selector)(doc)
      return results
    },
  }
}
