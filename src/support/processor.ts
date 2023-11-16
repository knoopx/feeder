import rehypeHighlight from "rehype-highlight"
import rehypeParse from "rehype-parse"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import { unified } from "unified"

export const processor = unified()
  .use(rehypeParse, {
    fragment: true,
    emitParseErrors: false,
    duplicateAttribute: false,
  })

  .use(rehypeHighlight, { ignoreMissing: true })
  .use(rehypeStringify)

export const safeProcessor = processor()
  .use(rehypeSanitize, {
    ...defaultSchema,
    strip: ["script", "style"],
    tagNames: [...defaultSchema.tagNames, "iframe", "big"],
    attributes: {
      ...defaultSchema.attributes,
      "*": defaultSchema.attributes["*"].filter(
        (x) => !["width", "height"].includes(x),
      ),
      iframe: ["allow", "allowfullscreen", "src"],
    },
  })

export function summarize(doc?: Document) {
  const text = doc?.body?.outerHTML
  return processor()
    .use(rehypeSanitize, {
      strip: ["script", "style"],
      tagNames: ["a", "b", "i", "strong", "em"],
    })
    .processSync(text).value
}
