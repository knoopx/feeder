import { PropsWithChildren, useEffect } from "react"
import { inject, observer } from "mobx-react"
import { Panel, HeaderButton, FavIcon, Preview, TimeAgo } from "../components"
import { MdOpenInBrowser, MdPerson, MdWeekend } from "react-icons/md"
import { Instance } from "mobx-state-tree"
import { EmptyPlaceholder } from "../components/EmptyPlaceholder"
import { Store } from "../models/Store"

export const ItemPanel = inject("store")(
  observer(
    ({
      store: { activeItem: item },
      ...props
    }: {
      store?: Instance<typeof Store>
    } & PropsWithChildren<Panel>) => {
      useEffect(() => {
        item?.update({ isNew: false })
      }, [item])

      return (
        <Panel
          {...props}
          // panelClassName="flex-auto"
          header={
            item && (
              <div className="flex flex-auto justify-between">
                <HeaderButton
                  onClick={() => item.source.toggleReadability()}
                  className={[
                    "px-2",
                    {
                      "text-white": item.source.readability,
                    },
                  ]}
                >
                  <MdWeekend size="1.25rem" />
                </HeaderButton>

                <HeaderButton href={item.href} target="_blank">
                  <MdOpenInBrowser size="1.25rem" />
                </HeaderButton>
              </div>
            )
          }
        >
          {item ? (
            <div className="flex-auto overflow-y-auto">
              <div className="px-8 py-4 border-b">
                <div className="flex justify-between mb-2 text-muted">
                  <div className="flow-row items-center">
                    <div className="flex items-center">
                      <FavIcon
                        className="mr-2"
                        src={item.source.baseURL || item.source.href}
                      />{" "}
                      {item.source.title}
                    </div>
                    {item.author && (
                      <div className="flex items-center pl-2 text-xs whitespace-no-wrap">
                        <MdPerson className="mr-1" /> {item.author}
                      </div>
                    )}
                  </div>
                  <TimeAgo
                    className="flex flow-col text-right text-sm"
                    since={item.publishedAt}
                  />
                </div>

                <div className="text-2xl font-medium leading-none">
                  {item.title}
                </div>
              </div>

              <Preview className="p-8" item={item} />
            </div>
          ) : (
            <EmptyPlaceholder />
          )}
        </Panel>
      )
    },
  ),
)
