import React from "react"
import { inject, observer } from "mobx-react"

import { ItemListColumn } from "./ItemListColumn"
import { ItemColumn } from "./ItemColumn"

export const SourceItemsView = inject("store")(
  observer(({ store }) => (
    <>
      <ItemListColumn className="flex flex-col overflow-auto w-[60ch]" />
      <ItemColumn
        key={store.activeItem?.key}
        className="flex flex-auto flex-col"
      />
    </>
  )),
)
