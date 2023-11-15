import { useRef, useEffect, HTMLAttributes } from "react"
import { observer } from "mobx-react"
import { Indicator, FavIcon, TimeAgo } from "../components"
import { MdPerson } from "react-icons/md"
import { Item } from "../models/Item"
import { Instance } from "mobx-state-tree"
import { isEmpty } from "lodash"

const ItemListItemAuthor: React.FC<{
  item: Instance<typeof Item>
}> = ({ className, item, ...props }) => (
  <div {...props} className={["ItemListItemAuthor", className]}>
    <MdPerson />
    <span>{item.author}</span>
  </div>
)

const ItemListItemSource: React.FC<{
  item: Instance<typeof Item>
}> = ({ className, item, ...props }) => (
  <div {...props} className={["flow-row flex-none", className]}>
    <FavIcon
      className="-ml-3 mr-1"
      src={item.source.baseURL || item.source.href}
    />
    <div className="text-sm">{item.source.title}</div>
  </div>
)

const ItemListItemTitle: React.FC<{
  item: Instance<typeof Item>
}> = ({ item }) => (
  <div className="flow-row items-center mb-2 leading-none">
    {item.isNew && <Indicator className="-ml-4 mr-2 flex-none" />}
    <div className="font-medium">{item.title}</div>
  </div>
)

const ItemListItemSummary: React.FC<
  {
    item: Instance<typeof Item>
  } & HTMLAttributes<HTMLParagraphElement>
> = ({ item, className, ...props }) => (
  <p
    {...props}
    className={["ItemListItemSummary", className]}
    dangerouslySetInnerHTML={{ __html: item.summary }}
  />
)

export const ItemListItem = observer(
  ({ item, isActive, className, extended, ...props }) => {
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
        className={[
          "ItemListItem",
          className,
          {
            active: isActive,
          },
        ]}
        {...props}
      >
        <div className="flex flex-auto items-center justify-between mb-1  ">
          <div className="flow-row space-x-2">
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

        <div className="">
          <div className="relative flow-row">
            {item.isNew && (
              <Indicator className="absolute left-[-14px] top-1.5" />
            )}

            <div className="flow-col overflow-x-hidden">
              {/* {!isEmpty(item.title) && <ItemListItemTitle item={item} />} */}
              <div className="font-medium">{item.title}</div>
              <div className="flex-auto">
                {!isEmpty(item.summary) && <ItemListItemSummary item={item} />}
              </div>
            </div>

            {!isEmpty(item.image) && (
              <img
                className="ml-4 flex-none h-16 aspect-video object-cover object-center rounded border "
                src={item.image}
              />
            )}
          </div>
        </div>
      </div>
    )
  },
)
