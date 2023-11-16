import { Window } from "happy-dom"

import q from "./q"

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

function outputs(value, element = document) {
  return (context) => {
    expect(q(context.task.name)(element)).toEqual(value)
  }
}

// test(null, outputs(null))
// test("", outputs([]))
// test("person", outputs("John Doe"))
// test("car", outputs("Red"))
// test("car[color='blue']", outputs("Blue"))
// test("car@color", outputs("red"))
// test("car@color | upper", outputs("RED"))
// test("@color", outputs("red", document.querySelector("car")))
// test("@color | upper", outputs("RED", document.querySelector("car")))
// test("@ownerDocument", outputs(document, document.querySelector("car")))
// // test("person | q('strong')", outputs("John Doe"))

test("q(..., fn)", () => {
  expect(q("person", (x) => x)(document)).toEqual("JOHN DOE")
})
// test(
//   "@ownerDocument.querySelector('number')",
//   outputs("Two", document.querySelector("car")),
// )
