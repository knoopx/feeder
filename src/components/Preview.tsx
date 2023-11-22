import { Spinner } from "."
import { inject, observer } from "mobx-react"
import { useEffect } from "react"
import { safeProcessor } from "../support/processor"
import { Instance } from "mobx-state-tree"
import { Store } from "../models/Store"
import clsx from "clsx"

export const Preview: React.FC<{
  item: any
  className?: string
  store?: Instance<typeof Store>
}> = inject("store")(
  observer(({ store, item, className }) => {
    useEffect(() => {
      if (store.oEmbeds.isSupported(item.href)) {
        store.oEmbeds.getEmbed(item.href)
      }
    }, [item.href])

    let html = item.oembed ? item.oembed.html : item.description

    if (item.source.readability) {
      if (!item.readableDescription) {
        return (
          <div className="relative" style={{ paddingBottom: "100%" }}>
            <div className="flow-row absolute flow-center h-full w-full">
              <Spinner size={48} />
            </div>
          </div>
        )
      }

      html = item.readableDescription
    }

    return (
      <div
        className={clsx("preview text-lg", className)}
        dangerouslySetInnerHTML={{
          __html: safeProcessor.processSync(html).value,
        }}
      />
    )
  }),
)
