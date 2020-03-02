import React from "react"
import classNames from "classnames"
import { inject, observer } from "mobx-react"
import { sumBy } from "lodash"

import Source from "./Source"

export const SourceList = inject("store")(
  observer(({ store }) => {
    return (
      <div className="flex flex-auto flex-col overflow-auto">
        <Source
          source={{
            name: "All Sources",
            newItemsCount: sumBy(store.allSources, "newItemsCount"),
          }}
          isActive={!store.activeSource}
          onClick={() => store.setActiveSource(null)}
        />
        {store.sortedSources.map((source) => (
          <Source
            key={source.href}
            source={source}
            isActive={store.activeSource === source}
            onClick={() => store.setActiveSource(source)}
          />
        ))}
      </div>
    )
  }),
)
