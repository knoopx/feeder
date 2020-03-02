import React from "react"
import { inject, observer } from "mobx-react"

import { ItemListColumn } from "./ItemListColumn"
import { ItemColumn } from "./ItemColumn"

export const SplitModeColumn = observer(() => (
  <>
    <ItemListColumn className="flex flex-col overflow-auto w-1/4" />
    <ItemColumn className="flex flex-auto flex-col w-2/4" />
  </>
))
