import { Spinner } from "."
import { inject, observer } from "mobx-react"
import { useEffect } from "react"
import { safeProcessor } from "../support/processor"

export const Preview = inject("store")(
  observer(({ store, item, className }) => {
    useEffect(() => {
      if (store.oEmbeds.isSupported(item.href)) {
        store.oEmbeds.getEmbed(item.href)
      }
    }, [item.href])

    let html = item.htmlDescription

    if (item.oembed) {
      html = item.oembed.html
    }

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

      html = item.readableDescription
    }

    return (
      <div
        className={["Preview", className]}
        dangerouslySetInnerHTML={{
          __html: safeProcessor.processSync(html).value,
        }}
      />
    )
  }),
)
