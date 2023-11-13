import React from "react"
import { inject, observer } from "mobx-react"

import { SourceListColumn } from "./SourceListColumn"
import { SplitModeColumn } from "./SplitModeColumn"

const App = observer(({ store }) => {
  return (
    <>
      <SourceListColumn className="flex flex-col w-1/4" />
      {store.mode === "split" && <SplitModeColumn />}
    </>
  )
})

export default inject("store")(App)
