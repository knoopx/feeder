import * as dateFns from "date-fns"
import sha256 from "sha256"
import _parseHumanRelative from "parse-human-relative-time/date-fns"

export const parseHumanRelative = _parseHumanRelative(dateFns)

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

export const digest = (str: any) => sha256(str).slice(0, 8)
