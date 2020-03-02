import React from "react"
import { MdClearAll } from "react-icons/md"
import { inject, observer } from "mobx-react"
import { Header } from "components"

import { ItemList } from "./ItemList"

export const ItemListColumn = inject("store")(
  observer(({ store, ...props }) => {
    return (
      <div {...props}>
        <Header className="justify-between border-pink-700 border-r">
          <input
            className="appearance-none outline-none flex-auto py-1 bg-transparent text-pink-500 placeholder-white"
            placeholder="Filter..."
            value={store.filter}
            onChange={(e) => {
              store.setFilter(e.target.value)
            }}
          />
          <div className="flex items-center">
            <a
              className="cursor-pointer mx-1 text-pink-500"
              onClick={store.clearItems}
            >
              <MdClearAll size="1.25rem" />
            </a>
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
