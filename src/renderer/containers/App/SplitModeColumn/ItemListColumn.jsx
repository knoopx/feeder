import React, { useRef } from "react"
import { MdClearAll } from "react-icons/md"
import { inject, observer } from "mobx-react"
import { Header, HeaderButton } from "components"
import { useHotkeys } from "react-hotkeys-hook"

import { ItemList } from "./ItemList"

export const ItemListColumn = inject("store")(
  observer(({ store, ...props }) => {
    const inputRef = useRef()

    useHotkeys("command+f", () => {
      inputRef.current?.focus()
    })

    useHotkeys("escape", () => {
      store.setFilter("")
      inputRef.current?.blur()
    })

    return (
      <div {...props}>
        <Header className="justify-between border-pink-700 border-r">
          <input
            ref={inputRef}
            className="appearance-none outline-none flex-auto mr-2 py-1 bg-transparent text-white placeholder-pink-500"
            placeholder="Filter..."
            value={store.filter}
            onChange={(e) => {
              store.setFilter(e.target.value)
            }}
          />
          <div className="flex items-center">
            <HeaderButton onClick={store.clearItems}>
              <MdClearAll size="1.25rem" />
            </HeaderButton>
          </div>
        </Header>

        <div className="flex flex-auto overflow-auto border-r">
          {store.filteredItems.length > 0 ? (
            <ItemList
              items={store.filteredItems}
              extended={!store.activeSource}
            />
          ) : (
            <div className="flex flex-auto items-center justify-center text-gray-600">
              Nothing to show
            </div>
          )}
        </div>
      </div>
    )
  }),
)
