{

function evalInScope(js, contextAsScope) {
  try {
    const result = new Function(`with (this) { return (${js}); }`).call(
      contextAsScope,
    )
    if (typeof result === 'function') {
      return result.call(contextAsScope)
    }
    return result
  } catch (e) {
    return e
  }
}

function $filter(filters) {
  return (value) => filters.reduce((acc, expr) => {
    const context = options.makeContext(acc)
    return evalInScope(expr, context)
  }, value)
}

}

root = space* list:(exprlist) space* {
  return (el) => list.flatMap((expr) => expr(el)).filter(Boolean)
}

prop = "@" n:name {
  return (el) => {
    if (!el) return null
    if (el instanceof HTMLDocument)
      el = el.documentElement
    return el.getAttribute(n)
  }
}

exprlist = a:expr b:(comma expr)* {
  return [a, ...b.flatMap(x => x[1])]
}

expr =
  "("? space* s:selector? p:prop? f:fexpr? space* ")"? f2:fexpr?
  {

  if (!f) f = (x) => x
  if (!f2) f2 = (x) => x
  return (el) => {
    let elements = options.sizzle(s, el)
    elements = elements.length === 0 && p ? [el] : elements
    if (!p) p = (x) => x
    return f2(f(elements.flatMap(p)))
  }
}

string = "'" chars:([^'])* "'" { return text() } / "\"" chars:([^"])* "\"" { return text() }
id = "#" name
class = "." name
el = name? id? class* { return text() }
selector = ((el (space+ el)*)? attr? pseudo?) { return text() }
subexprlist = subexpr (comma space* subexpr)* { return text() }
subexpr = (el / number / string / pseudo) { return text() }
pseudo = ":" name ("(" subexprlist? ")")? { return text() }
fexpr = f:(space* "|" space* filter)* { return $filter(f.map(x => x[3])) }
farg = string / number { return text() }
filter = name ("(" ((farg) (comma space* farg)*)? ")")? { return text() }
attr = "[" name (("=" / "*=" / "^=") string)? "]" { return text() }
name = [a-z]i [a-z0-9_\\\-]i* { return text() }

number = [0-9]
comma = ","
quote = "'"
dquote = "\""
space = " "
