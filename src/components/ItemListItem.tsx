import { useRef, useEffect, HTMLAttributes } from "react"
import { observer } from "mobx-react"
import { Indicator, FavIcon, TimeAgo } from "./index.tsx"
import { MdPerson } from "react-icons/md"
import { Item } from "../models/Item"
import { Instance } from "mobx-state-tree"
import { isEmpty } from "lodash"
import clsx from "clsx"

const ItemListItemAuthor: React.FC<{
  item: Instance<typeof Item>
  className?: string
}> = ({ className, item, ...props }) => (
  <div
    {...props}
    className={clsx(
      ":uno-item-list-item-author: flex flex-grow items-center space-x-1 text-xs",
      className,
    )}
  >
    <MdPerson />
    <span>{item.author}</span>
  </div>
)

const ItemListItemSource: React.FC<{
  item: Instance<typeof Item>
  className?: string
}> = ({ className, item, ...props }) => (
  <div
    {...props}
    className={clsx(":uno-item-list-item-source: flex flex-none", className)}
  >
    <FavIcon className="-ml-3 mr-1" src={item.source.baseURL} />
    <div className="text-sm">{item.source.title}</div>
  </div>
)

const ItemListItemSummary: React.FC<
  {
    item: Instance<typeof Item>
  } & HTMLAttributes<HTMLParagraphElement>
> = ({ item, className, ...props }) => (
  <p
    {...props}
    className={clsx(
      ":uno-item-list-summary: flex-none text-sm leading-tight line-clamp-3 text-muted",
      className,
    )}
    dangerouslySetInnerHTML={{ __html: item.summary }}
  />
)

export const ItemListItem = observer(
  ({
    item,
    isActive,
    className,
    extended,
    ...props
  }: {
    item: Instance<typeof Item>
    isActive: boolean
    className?: string
    extended?: boolean
  } & HTMLAttributes<HTMLDivElement>) => {
    const ref = useRef(null)
    useEffect(() => {
      if (isActive)
        ref.current.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        })
    }, [isActive, ref.current])

    return (
      <div
        ref={ref}
        className={clsx(
          ":uno-item-list-item: flex flex-col justify-between cursor-pointer select-none max-w-full px-6 py-3 border-b space-x-2",
          className,
          {
            "active bg-pink-600 text-white": isActive,
          },
        )}
        {...props}
      >
        <div className="flow-row items-center justify-between mb-1">
          <div className="flex flex-grow space-x-2">
            {/* {extended && <ItemSource item={item} />} */}
            <ItemListItemSource item={item} />
            {!isEmpty(item.author) && (
              <ItemListItemAuthor className="text-muted" item={item} />
            )}
          </div>
          <TimeAgo
            since={item.publishedAt}
            className="text-xs italic text-muted"
          />
        </div>

        <div>
          <div className="relative flex flex-grow">
            {item.isNew && (
              <Indicator className="absolute left-[-14px] top-1.5" />
            )}

            <div className="flow-col overflow-x-hidden">
              <div className="font-medium">{item.title}</div>
              <div className="flex-auto">
                {!isEmpty(item.summary) && <ItemListItemSummary item={item} />}
              </div>
            </div>

            {!isEmpty(item.image) && (
              <img
                className="ml-4 flex-none h-16 aspect-video object-cover object-center rounded border"
                src={item.image}
              />
            )}
          </div>
        </div>
      </div>
    )
  },
)
