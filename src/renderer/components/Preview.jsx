import React, { createElement } from "react"
import { observer } from "mobx-react"
import { Spinner } from "components"
import parse from "rehype-parse"
import unified from "unified"
import sanitize from "rehype-sanitize"
import highlight from "rehype-highlight"
import rehype2react from "rehype-react"

const processor = unified()
  .use(parse, { emitParseErrors: false, duplicateAttribute: false })
  .use(sanitize)
  .use(highlight)
  .use(rehype2react, { createElement })

export const Preview = observer(({ item, className }) => {
  let content = item.description

  if (item.source.readability) {
    if (item.readability.status === "running") {
      return (
        <div className="relative" style={{ paddingBottom: "100%" }}>
          <div className="absolute flex flex-auto items-center justify-center h-full w-full">
            <Spinner size={48} />
          </div>
        </div>
      )
    }

    if (item.readability.status === "done") {
      content = item.readability.content
    }
  }

  return (
    <div className={["preview", className]}>
      {processor.processSync(content).contents}
    </div>
  )
})
