import React, { useEffect } from "react"
import { inject, observer } from "mobx-react"
import { Header, HeaderButton, FavIcon, Preview, TimeAgo } from "components"
import { MdOpenInBrowser, MdPerson, MdWeekend } from "react-icons/md"

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
              <HeaderButton
                onClick={() => item.source.toggleReadability()}
                className={[
                  {
                    "text-white": item.source.readability,
                  },
                ]}
              >
                <MdWeekend size="1.25rem" />
              </HeaderButton>

              <HeaderButton href={item.link}>
                <MdOpenInBrowser size="1.25rem" />
              </HeaderButton>
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
                    {item.source.title}
                  </div>
                  {item.author && (
                    <div className="flex items-center pl-2 text-xs whitespace-no-wrap">
                      <MdPerson className="mr-1" /> {item.author}
                    </div>
                  )}
                </div>
                {item.publishedAt && (
                  <TimeAgo
                    className="flex flex-col text-right text-sm"
                    since={item.publishedAt}
                  />
                )}
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
