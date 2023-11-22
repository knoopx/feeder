import { Window } from "happy-dom"
import { parse, $auto } from "./parsing"

function html(text: string) {
  const window = new Window()
  window.document.body.innerHTML = text
  return window.document
}

const document = html(`
<items>
  <cars>
    <car color="red">Red</car>
    <car color="blue">Blue</car>
  </cars>
  <number value="2">Two</number>
  <person><strong>John Doe<strong></person>
</item>
`)

function outputs(value, context = document) {
  return ({ task }) => {
    const select = parse(task.name)
    expect($auto(select(context))).toEqual(value)
  }
}

function rawOutputs(value, context = document) {
  return ({ task }) => {
    const select = parse(task.name)
    expect(select(context)).toEqual(value)
  }
}

test("a.tweet-link", outputs(undefined))
test("a.tweet-link@href", outputs(undefined))
test(".dash-ed", outputs(undefined))
test(`.dash\\\:eed`, outputs(undefined))

test("person", outputs("John Doe"))
test("[color]", outputs("Red"))
test("car:last", outputs("Blue"))
test("car | upper", outputs("RED"))
test("number@value", outputs("2"))
test("@value", outputs("2", document.querySelector("number")))
test("person:contains('Doe')", outputs("John Doe"))
// test(`a[href*="/blog/"]:not(:contains("view all"))`, outputs(null))
// test("car", rawOutputs(document.querySelectorAll("car")))

// test("car[color=\"blue\"]", outputs("Blue"))
// test("car[color='blue']", outputs("Blue"))

// test(null, outputs(null))
// test("", outputs(null))
// test("person", outputs("John Doe"))
// test("car", outputs("Red"))
// test("car[color='blue']", outputs("Blue"))
// test("car@color", outputs("red"))
// test("car@color | upper", outputs("RED"))
// test("@color", outputs("red", document.querySelector("car")))
// test("@color | upper", outputs("RED", document.querySelector("car")))
// test("@ownerDocument", outputs(document, document.querySelector("car")))
// test("person | q('strong')", outputs("John Doe"))

// test("q(..., fn)", () => {
//   expect(q("person", (x) => x)(document)).toEqual("JOHN DOE")
// })
// test(
//   "@ownerDocument.querySelector('number')",
//   outputs("Two", document.querySelector("car")),
// )
