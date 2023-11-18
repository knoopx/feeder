import { PropsWithChildren, useRef } from "react"
import { MdClearAll } from "react-icons/md"
import { inject, observer } from "mobx-react"
import { Panel, HeaderButton } from "../components"
import { useHotkeys } from "react-hotkeys-hook"
import { ItemList } from "../components/ItemList"
import { Instance } from "mobx-state-tree"
import Store from "../models/Store"
import { EmptyPlaceholder } from "../components/EmptyPlaceholder"
import { Item } from "../models/Item"

export const ItemListPanel = inject("store")(
  observer(
    ({
      store,
      ...props
    }: { store?: Instance<typeof Store> } & PropsWithChildren<Panel>) => {
      const inputRef = useRef()

      useHotkeys("command+f", () => {
        inputRef.current?.focus()
      })

      useHotkeys("escape", () => {
        store.setFilter("")
        inputRef.current?.blur()
      })

      return (
        <Panel
          {...props}
          header={
            <>
              <input
                ref={inputRef}
                className="Input"
                placeholder="Filter..."
                value={store.filter}
                onChange={(e) => {
                  store.setFilter(e.target.value)
                }}
              />
              <div className="flex items-center">
                <HeaderButton
                  onClick={(e) => {
                    store.clearItems(e.ctrlKey)
                  }}
                >
                  <MdClearAll size="1.25rem" />
                </HeaderButton>
              </div>
            </>
          }
        >
          {store.filteredItems.length > 0 ? (
            <ItemList
              items={store.filteredItems}
              activeItem={store.activeItem}
              onSelect={(item: Instance<typeof Item>) =>
                void store.setActiveItem(item)
              }
              extended={!store.activeSource}
            />
          ) : (
            <EmptyPlaceholder />
          )}
        </Panel>
      )
    },
  ),
)
