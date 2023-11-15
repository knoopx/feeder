import { flow, isString, isFunction, isObject, isArray, isEmpty } from "lodash"
import sizzle from "sizzle"

import { applyFilters, getAttrOrProp, parseInput } from "./util"

// {
//   value: 'a@href',
//   array: ['a@href'],
//   transform: $('a@href', (href) => href.reverse() ),
//   fn: (el) => el.querySelector('[title]'),
// }
function $object(schema: { [key: string]: any }) {
  return (el: Document | Element) =>
    Object.keys(schema).reduce((result, propName) => {
      const value = schema[propName]
      if (isEmpty(value)) {
        result[propName] = ""
      } else if (isFunction(value)) {
        result[propName] = value(el)
      } else {
        result[propName] = $(value)(el)
      }
      return result
    }, {})
}

// $(['a'], (val) => val)
// $(['.thumb-container'], {
//   key: 'a@href',
//   title: '.title@textContent',
//   thumbs: ['img@src | replace("-small", "")'],
// })
//
function $all(input: string, transform: (val: string) => string) {
  return (doc: Document) => {
    const { selector, attrName, filters } = parseInput(input)

    if (!selector) return []

    // const results = Array.from(doc.querySelectorAll(selector))
    const results = sizzle(selector, doc)
    if (isFunction(transform)) {
      if (input.includes("@")) {
        return results.map(
          flow(getAttrOrProp(attrName), applyFilters(filters), transform),
        )
      }
      return results.map(transform)
    }

    if (isObject(transform)) {
      return results.map($object(transform))
    }

    return results.map(flow(getAttrOrProp(attrName), applyFilters(filters)))
  }
}

// $('@href')
// $('a@href')
// $('a@href', (href) => href)
function $first(input, transform = (val) => val) {
  return (doc) => {
    if (isString(input)) {
      const { selector, attrName, filters } = parseInput(input)

      if (selector) {
        // return flow(
        //   getAttrOrProp(attrName),
        //   applyFilters(filters),
        //   transform,
        // )(doc.querySelector(selector))
        return flow(
          getAttrOrProp(attrName),
          applyFilters(filters),
          transform,
        )(sizzle(selector, doc)[0])
      }

      return flow(
        getAttrOrProp(attrName),
        applyFilters(filters),
        transform,
      )(doc)
    }

    // $({ href : "a@href" })
    // $({ href : "a@href" }, (res) => res.href )
    if (isObject(input)) {
      return flow($object(input), transform)(doc)
    }

    throw new Error(`Invalid query: ${JSON.stringify(input)}`)
  }
}

export default function $(input: string, ...opts) {
  // $(["query"], ...)
  if (isArray(input)) {
    if (input.length === 1) {
      return $all(...[...input, ...opts])
    }
    throw new Error(`Invalid query: ${JSON.stringify(input)}`)
  }
  // $("div@attr", ...)
  // $("@attr", ...)
  // $({key: "value"}, ...)
  if (isString(input) || isObject(input)) {
    return $first(input, ...opts)
  }

  throw new Error(`Invalid query: ${JSON.stringify(input)}`)
}

// export default (doc) =>
//   ({ item, ...selectors }) => {
//     return $(
//       [item],
//       Object.keys(selectors)
//         .filter((key) => selectors[key])
//         .reduce(
//           (acc, key) => ({
//             ...acc,
//             [key]: $(selectors[key]),
//           }),
//           {},
//         ),
//     )(doc)
//   }
