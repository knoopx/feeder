import { inject, observer } from "mobx-react"
import { SourceListPanel } from "./SourceListPanel"
import { SourceItemsPanels } from "./SourceItemListPanel"
import { SourceEditPanels } from "./SourceEditPanels"

export const Shell = inject("store")(
  observer(({ store }) => {
    return (
      <div className="PanelContainer">
        <SourceListPanel className="flex-none w-[35ch]" />
        {store.isEditing && store.activeSource ? (
          <SourceEditPanels />
        ) : (
          <SourceItemsPanels />
        )}
      </div>
    )
  }),
)
