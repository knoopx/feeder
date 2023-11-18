import { inject, observer } from "mobx-react"
import { useEffect } from "react"
import { Store } from "../models/Store"
import { Instance } from "mobx-state-tree"
import { SourcePreviewPanel } from "./SourcePreviewPanel"
import { SourceEditPanel } from "./SourceEditPanel"

export const SourceEditPanels = inject("store")(
  observer(({ store }: { store?: Instance<typeof Store> }) => {
    const { activeSource } = store

    useEffect(() => {
      activeSource.fetch(true)
    }, [activeSource])

    return (
      <>
        <SourcePreviewPanel
          className="flex-none w-[100ch]"
          activeSource={activeSource}
        />
        <SourceEditPanel activeSource={activeSource} />
      </>
    )
  }),
)
