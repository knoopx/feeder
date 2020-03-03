import React, { useRef, useEffect } from "react"
import { inject, observer } from "mobx-react"
import { Indicator, FavIcon, TimeAgo } from "components"
import { useHotkeys } from "react-hotkeys-hook"

const Item = observer(({ item, isActive, className, extended, ...props }) => {
  const ref = useRef()

  useEffect(() => {
    if (isActive)
      ref.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
  }, [isActive, ref.current])

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
        "cursor-pointer select-none max-w-full px-6 py-3 border-b",
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
      <div className="mb-2 font-medium leading-none">
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
    useHotkeys("up", (e) => store.advanceItem(-1) && e.preventDefault())
    useHotkeys("down", (e) => store.advanceItem(1) && e.preventDefault())

    return (
      <div className={["flex flex-auto flex-col min-w-0", className]}>
        {store.filteredItems.map((item) => (
          <Item
            key={item.key}
            item={item}
            extended={extended}
            isActive={item === store.activeItem}
            onClick={() => void store.setActiveItem(item)}
          />
        ))}
      </div>
    )
  }),
)
