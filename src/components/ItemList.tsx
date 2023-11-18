import { inject, observer } from "mobx-react"
import { useHotkeys } from "react-hotkeys-hook"
import { ItemListItem } from "./ItemListItem"

export const ItemList = inject("store")(
  observer(
    ({ className, items, extended, activeItem, onSelect, store, ...props }) => {
      const advance = (offset: number) => (e) => {
        e.preventDefault()
        const index = activeItem ? items.indexOf(activeItem) : 0
        const next = items[index + offset]
        if (next) onSelect(next)
      }

      useHotkeys("up", advance(-1))
      useHotkeys("down", advance(1))

      return (
        <div className={["flow-col", className]}>
          {items.map((item, i) => (
            <ItemListItem
              key={i}
              item={item}
              extended={extended}
              isActive={item === activeItem}
              onClick={() => void onSelect(item)}
              {...props}
            />
          ))}
        </div>
      )
    },
  ),
)
