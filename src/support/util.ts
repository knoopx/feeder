import q from "../support/q"
import { isEmpty } from "lodash"
import moment from "moment"
import { parseDocument } from "./parseDOM"

const trim = (value) => {
  if (typeof value === "string") return value.trim()

  return value
}
// person | toUpperCase()
export function parseSimpleInput(input) {
  if (isEmpty(input))
    return {
      selector: "",
      filters: [],
    }

  const [selectorWithAttrName, ...filters] = input.split("|")

  return {
    selector: trim(selectorWithAttrName),
    filters: filters.map(trim),
  }
}

// person@name | toUpperCase()
export function parseInput(input: string) {
  const { selector: selectorWithAttrName, filters } = parseSimpleInput(input)
  const [selector, attrName = "textContent"] = selectorWithAttrName.split("@", 2)
  return {
    selector: trim(selector),
    attrName: trim(attrName),
    filters,
  }
}

export function getAttrOrProp(attrName: string) {
  return (el: Element) => {
    if (!el) return null

    if (isEmpty(attrName)) {
      return el
    }
    if (el.hasAttribute(attrName)) {
      return trim(el.getAttribute(attrName))
    }
    return trim(el[attrName])

    // return trim(eval(`this.${attrName}`)).call(node)
  }
}

function evalInScope(js: string, contextAsScope: object) {
  return new Function(`with (this) { return (${js}); }`).call(contextAsScope)
}

function makeContext(result: any) {
  return {
    value: result,
    lower() {
      return result.toLocaleLowerCase()
    },
    upper() {
      return result.toLocaleUpperCase()
    },
    capitalize() {
      return result[0].toLocaleUpperCase() + result.slice(1).toLocaleLowerCase()
    },
    split(separator: string) {
      return result.split(separator)
    },
    join(separator: string) {
      if (!Array.isArray(result)) {
        result = [result]
      }
      return result.join(separator)
    },
    replace(search: string, replace: string) {
      return result.replace(search, replace)
    },
    trim() {
      return result.trim()
    },
    append(text: string) {
      return result + text
    },
    prepend(text: string) {
      return text + result
    },
    toDate(format: string) {
      if (!format) return new Date(result)
      return moment(result, format).toDate()
    },
    q(selector: string) {
      const doc = typeof result === "string" ? parseDocument(result) : result
      return q(selector)(doc)
    },
  }
}

export function applyFilters(filters: string[]) {
  return (value: string) =>
    filters.reduce((result, filter) => {
      if (result) {
        const context = makeContext(result)
        return trim(evalInScope(filter, context))
      }
      return null
    }, value)
}
