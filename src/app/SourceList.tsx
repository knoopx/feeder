import React from "react"
import { inject, observer } from "mobx-react"
import { useHotkeys } from "react-hotkeys-hook"

import Source from "./Source"

export const SourceList = inject("store")(
  observer(({ store, editMode }) => {
    useHotkeys("shift+up", (e) => store.advanceSource(-1) && e.preventDefault())
    useHotkeys(
      "shift+down",
      (e) => store.advanceSource(1) && e.preventDefault(),
    )

    return (
      <div className="flow-col overflow-y-auto">
        <Source
          source={{
            title: "All Sources",
            updatedAt: store.updatedAt,
            newItemsCount: store.newItemsCount,
          }}
          isActive={!store.activeSource}
          onClick={() => store.setActiveSource(null)}
        />
        {store.sortedSources.map((source) => (
          <Source
            key={source.href}
            source={source}
            editMode={editMode}
            isActive={store.activeSource === source}
            onClick={() => store.setActiveSource(source)}
          />
        ))}
      </div>
    )
  }),
)
