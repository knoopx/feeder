import { observer } from "mobx-react"
import { ItemListPanel } from "./ItemListPanel"
import { ItemPanel } from "./ItemPanel"

export const SourceItemsPanels = observer(() => (
  <>
    <ItemListPanel
      className="flex-none w-[60ch]"
      contentClass="overflow-y-auto"
    />
    <ItemPanel className="flow-col w-auto" />
  </>
))
