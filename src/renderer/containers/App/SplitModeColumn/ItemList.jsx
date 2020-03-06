import React, { useRef } from "react"
import { inject, observer } from "mobx-react"
import { VirtualList } from "components"
import { useHotkeys } from "react-hotkeys-hook"
import { throttle } from "lodash"

import Item from "./Item"

export const ItemList = inject("store")(
  observer(({ className, extended, store }) => {
    const ITEM_HEIGHT = 115

    const ref = useRef()

    const useKeyNavigation = (key, direction) => {
      useHotkeys(
        key,
        throttle((e) => {
          const nextIndex = store.advanceItem(direction)
          if (nextIndex >= 0) {
            e.preventDefault()
            ref.current.scrollToIndex(nextIndex)
          }
        }, 100),
      )
    }

    useKeyNavigation("up", -1)
    useKeyNavigation("down", 1)

    return (
      <div className={["flex flex-auto flex-col min-w-0", className]}>
        <VirtualList
          ref={ref}
          items={store.filteredItems}
          itemHeight={ITEM_HEIGHT}
        >
          {(item) => (
            <Item
              style={{ height: ITEM_HEIGHT }}
              key={item.key}
              item={item}
              extended={extended}
              isActive={item === store.activeItem}
              onClick={() => {
                store.setActiveItem(item)
              }}
            />
          )}
        </VirtualList>
      </div>
    )
  }),
)
