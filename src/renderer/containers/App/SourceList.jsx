import React from "react"
import { inject, observer } from "mobx-react"
import { throttle } from "lodash"
import { useHotkeys } from "react-hotkeys-hook"

import Source from "./Source"

export const SourceList = inject("store")(
  observer(({ store, editMode }) => {
    const useKeyNavigation = (key, direction) => {
      useHotkeys(
        key,
        throttle((e) => {
          const nextIndex = store.advanceSource(direction)
          if (nextIndex >= 0) {
            e.preventDefault()
          }
        }, 100),
      )
    }

    useKeyNavigation("shift+up", -1)
    useKeyNavigation("shift+down", 1)

    return (
      <div className="flex flex-auto flex-col overflow-auto">
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
