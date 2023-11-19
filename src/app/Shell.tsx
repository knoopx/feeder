import { inject, observer } from "mobx-react"
import { SourceListPanel } from "./SourceListPanel"
import { SourceItemsPanels } from "./SourceItemListPanel"
import { SourceEditPanels } from "./SourceEditPanels"
import { Instance } from "mobx-state-tree"
import { Store } from "../models/Store"
import { PanelContainer } from "../components/Panel"

export const Shell = inject("store")(
  observer(({ store }: { store?: Instance<typeof Store> }) => {
    return (
      <PanelContainer>
        <SourceListPanel className="flex-none max-w-[35ch]" />
        {store.isEditing && store.activeSource ? (
          <SourceEditPanels />
        ) : (
          <SourceItemsPanels />
        )}
      </PanelContainer>
    )
  }),
)
