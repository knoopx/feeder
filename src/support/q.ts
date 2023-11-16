import sizzle from "sizzle"
import { flow, isFunction, isObject, isString, isEmpty } from "lodash"
import { trim, makeContext, evalInScope } from "./util"

type Transform = (val: string) => string | object

type Schema = { [key: string]: any }
function $schema(schema: Schema) {
  return (el: Document | Element) =>
    Object.keys(schema).reduce((result, propName) => {
      const value = schema[propName]
      if (isEmpty(value)) {
        result[propName] = null
      } else if (isFunction(value)) {
        result[propName] = value(el)
      } else if (isString(value)) {
        result[propName] = $(value)(el)
      } else {
        throw new Error(`Invalid schema value: ${value}`)
      }
      return result
    }, {})
}

export default function $(expr: string, transform?: Transform) {
  return (el: Document | Element) => {
    let { selector, propName, filters } = $expr(expr)
    const chain = $filter([...filters, "auto"])

    // person
    if (isEmpty(selector) && isEmpty(propName)) return []

    const elements = isEmpty(selector) ? [el] : sizzle(selector, el)
    if (isFunction(transform)) {
      return transform(chain(elements))
    }
    if (!transform) {
      const vals = $prop(propName)(elements)
      // const chain = $filter(filters)
      return chain(vals)
    }
    if (isObject(transform)) {
      return elements.map($schema(transform))
    }
  }
}

function _expr(expr: string) {
  if (!isString(expr)) throw new Error(`Invalid expr: ${JSON.stringify(expr)}`)

  if (isEmpty(expr))
    return {
      selector: "",
      filters: [],
    }

  const [selector_propName, ...filters] = expr.split("|")

  return {
    selector: trim(selector_propName),
    filters: filters.map(trim),
  }
}

export function $expr(expr: string) {
  const { selector: selector_propName, filters } = _expr(expr)
  let [selector, propName] = selector_propName.split("@", 2)

  return {
    selector: trim(selector),
    propName: trim(propName),
    filters,
  }
}

export function $prop(propName: string) {
  return (elements: Element[]) => {
    if (!elements) return null

    if (isEmpty(propName)) {
      return elements
    }

    return elements.map((el) => {
      if (el.hasAttribute(propName)) {
        return trim(el.getAttribute(propName))
      }
      return trim(el[propName])
    })
  }
}

export function $filter(filters: string[]) {
  return (value: any) =>
    filters.reduce((result, filter) => {
      const context = makeContext(result)
      return evalInScope(filter, context)
    }, value)
}
