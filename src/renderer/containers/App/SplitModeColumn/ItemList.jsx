import React, { useRef } from "react"
import { inject, observer } from "mobx-react"
import { VirtualList, Indicator, FavIcon, TimeAgo } from "components"
import { useHotkeys } from "react-hotkeys-hook"
import { throttle } from "lodash"

const Item = observer(({ item, isActive, className, extended, ...props }) => {
  const ref = useRef()

  const textGray = [
    {
      "text-pink-300": isActive,
      "text-gray-600": !isActive,
    },
  ]

  return (
    <div
      ref={ref}
      className={[
        "cursor-pointer select-none px-6 py-3 border-b",
        className,
        {
          "bg-pink-600 text-white": isActive,
        },
      ]}
      {...props}
    >
      <div
        className={[
          "flex justify-between mb-1 text-xs whitespace-no-wrap",
          textGray,
        ]}
      >
        {extended && (
          <div className="flex items-center truncate">
            <FavIcon className="mr-1" src={item.source.href} />
            <div>{item.source.title}</div>
          </div>
        )}
        <TimeAgo since={item.publishedAt} />
      </div>
      <div className="mb-2 font-medium leading-tight truncate">
        {item.isNew && <Indicator className="-ml-4 mr-1" />} {item.title}
      </div>
      <div className={["text-sm leading-tight truncate-2", textGray]}>
        {item.summary}
      </div>
    </div>
  )
})

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
