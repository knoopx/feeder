import React, { useRef } from "react"
import { observer } from "mobx-react"
import { Indicator, FavIcon, TimeAgo } from "components"

const Item = ({ item, isActive, className, extended, ...props }) => {
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
        "cursor-pointer select-none flex flex-col px-6 py-3 border-b",
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
        {item.publishedAt && <TimeAgo since={item.publishedAt} />}
      </div>
      <div className="mb-2 font-medium leading-tight">
        {item.isNew && <Indicator className="-ml-4 mr-1" />} {item.title}
      </div>
      <div
        className={["text-sm leading-tight line-clamp-2", textGray]}
        style={{ whiteSpace: "normal" }}
      >
        {item.summary}
      </div>
    </div>
  )
}

export default observer(Item)
