import React, { useEffect } from "react"
import classNames from "classnames"
import { inject, observer } from "mobx-react"
import { Header, FavIcon, Preview } from "components"
import { MdOpenInBrowser, MdPerson, MdWeekend } from "react-icons/md"
import { formatDistance } from "date-fns"
import { now } from "mobx-utils"

export const ItemColumn = inject("store")(
  observer(({ store: { activeItem: item }, ...props }) => {
    useEffect(() => {
      item?.markAsRead()
    }, [item])

    return (
      <div {...props}>
        <Header className="justify-between">
          {item && (
            <>
              <a
                onClick={() => item.source.toggleReadability()}
                className={classNames({
                  "text-white": item.source.readability,
                })}
              >
                <MdWeekend size="1.25rem" />
              </a>

              <a href={item.link}>
                <MdOpenInBrowser size="1.25rem" />
              </a>
            </>
          )}
        </Header>
        {item ? (
          <div className="flex-auto overflow-auto">
            <div className="px-8 py-4 border-b">
              <div className="flex justify-between mb-2 text-gray-600">
                <div>
                  <div className="flex items-center">
                    <FavIcon className="mr-2" src={item.source.href} />{" "}
                    {item.source.name}
                  </div>
                  {item.author && (
                    <div className="flex items-center pl-2 text-xs whitespace-no-wrap">
                      <MdPerson className="mr-1" /> {item.author}
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-right text-sm">
                  {formatDistance(item.publishedAt, now(), { addSuffix: true })}
                </div>
              </div>

              <div className="text-2xl font-medium leading-none">
                {item.title}
              </div>
            </div>

            <Preview className="p-8" item={item} />
          </div>
        ) : (
          <div className="flex flex-auto items-center justify-center text-gray-600">
            Nothing to show
          </div>
        )}
      </div>
    )
  }),
)
