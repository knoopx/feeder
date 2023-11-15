import { inject, observer } from "mobx-react"
import { useHotkeys } from "react-hotkeys-hook"
import { ItemListItem } from "./ItemListItem"

export const ItemList = inject("store")(
  observer(({ className, extended, items, store }) => {
    useHotkeys("up", (e) => store.advanceItem(-1) && e.preventDefault())
    useHotkeys("down", (e) => store.advanceItem(1) && e.preventDefault())

    return (
      <div className={["flow-col min-w-0", className]}>
        {items.map((item) => (
          <ItemListItem
            key={item.id}
            item={item}
            extended={extended}
            isActive={item === store.activeItem}
            onClick={() => void store.setActiveItem(item)}
          />
        ))}
      </div>
    )
  }),
)
