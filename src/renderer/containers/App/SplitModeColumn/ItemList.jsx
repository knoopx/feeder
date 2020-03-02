import React, { useRef, useEffect } from "react"
import classNames from "classnames"
import { inject, observer } from "mobx-react"
import { formatDistance } from "date-fns"
import { now } from "mobx-utils"
import { Indicator, FavIcon } from "components"

const Item = observer(({ item, isActive, className, extended, ...props }) => {
  const ref = useRef()

  useEffect(() => {
    if (isActive)
      ref.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
  }, [isActive, ref.current])

  const textGray = classNames({
    "text-pink-300": isActive,
    "text-gray-600": !isActive,
  })

  return (
    <div
      ref={ref}
      className={classNames(
        "max-w-full cursor-pointer px-6 select-none py-3 border-b",
        className,
        {
          "bg-pink-600 text-white": isActive,
        },
      )}
      {...props}
    >
      <div
        className={classNames(
          "mb-1 flex justify-between text-xs whitespace-no-wrap",
          textGray,
        )}
      >
        {extended && (
          <div className="flex items-center truncate">
            <FavIcon className="mr-1" src={item.source.href} />
            <div>{item.source.name}</div>
          </div>
        )}
        <div>
          {formatDistance(item.publishedAt, now(), { addSuffix: true })}
        </div>
      </div>
      <div className="mb-2 font-medium leading-none">
        {item.isNew && <Indicator className="-ml-4 mr-1" />} {item.title}
      </div>
      <div
        className={classNames("text-sm leading-tight truncate-2", textGray)}
        dangerouslySetInnerHTML={{
          __html: item.summary,
        }}
      />
    </div>
  )
})

export const ItemList = inject("store")(
  observer(({ items, className, store }) => {
    return (
      <div className={classNames("flex min-w-0 flex-auto flex-col", className)}>
        {items.map((item) => (
          <Item
            key={item.link}
            item={item}
            isActive={item === store.activeItem}
            onClick={() => void store.setActiveItem(item)}
          />
        ))}
      </div>
    )
  }),
)
