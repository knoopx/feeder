import { Spinner } from "."
import { parse as parseDocument, absolutize } from "../support/parse"
import { observer } from "mobx-react"

import rehypeHighlight from "rehype-highlight"
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import Markdown from "react-markdown"
import { unified } from "unified"

const processor = unified()
  .use(rehypeParse, {
    fragment: true,
    emitParseErrors: false,
    duplicateAttribute: false,
  })
  .use(rehypeSanitize)
  .use(rehypeHighlight)
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify)

export const Preview = observer(({ item, className }) => {
  let body = absolutize(parseDocument(item.description), item.link).body
    .innerHTML

  if (item.source.readability) {
    if (!item.readableDescription) {
      return (
        <div className="relative" style={{ paddingBottom: "100%" }}>
          <div className="flex flex-auto absolute items-center justify-center h-full w-full">
            <Spinner size={48} />
          </div>
        </div>
      )
    }

    body = item.readableDescription
  }

  return (
    <div className={["preview", className]}>
      <Markdown>{processor.processSync(body).value}</Markdown>
    </div>
  )
})
