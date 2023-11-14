import React from "react"
import { inject, observer } from "mobx-react"

import { SourceListColumn } from "./SourceListColumn"
import { SourceItemsView } from "./SplitModeColumn"
import { SourceEditView } from "./SourceEditView"

const App = observer(({ store }) => {
  return (
    <>
      <SourceListColumn className="flex flex-col w-[35ch]" />
      {store.isEditing && store.activeSource ? (
        <SourceEditView />
      ) : (
        <SourceItemsView />
      )}
    </>
  )
})

export default inject("store")(App)
