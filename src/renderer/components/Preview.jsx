import React, { createElement } from "react"
import classNames from "classnames"
import { Spinner } from "components"
import parse from "rehype-parse"
import unified from "unified"
import sanitize from "rehype-sanitize"
import highlight from "rehype-highlight"
import rehype2react from "rehype-react"

const processor = unified()
  .use(parse, { emitParseErrors: true, duplicateAttribute: false })
  .use(sanitize)
  .use(highlight, { subset: ["javascript", "ruby", "css"] })
  .use(rehype2react, { createElement })

export const Preview = ({ item, className }) => {
  let body = item.description

  if (item.source.readability) {
    if (!item.readableDescription) {
      return (
        <div className="relative" style={{ paddingBottom: "100%" }}>
          <div className="absolute flex flex-auto items-center justify-center h-full w-full">
            <Spinner size={48} />
          </div>
        </div>
      )
    }

    body = item.readableDescription
  }

  return (
    <div className={classNames("preview", className)}>
      {processor.processSync(body).contents}
    </div>
  )
}
