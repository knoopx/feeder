import { observer } from "mobx-react"
import { useHotkeys } from "react-hotkeys-hook"
import { ItemListItem } from "./ItemListItem"
import { Item } from "../models/Item"
import { Instance } from "mobx-state-tree"
import clsx from "clsx"

export const ItemList = observer(
  ({
    className,
    items,
    extended,
    activeItem,
    onSelect,
    ...props
  }: {
    className?: string
    items: Instance<typeof Item>[]
    extended?: boolean
    activeItem?: Instance<typeof Item> | null
    onSelect: (item: Instance<typeof Item>) => void
  }) => {
    const advance = (offset: number) => (e: KeyboardEvent) => {
      e.preventDefault()
      const index = activeItem ? items.indexOf(activeItem) : 0
      const next = items[index + offset]
      if (next) onSelect(next)
    }

    useHotkeys("up", advance(-1))
    useHotkeys("down", advance(1))

    return (
      <div className={clsx("flow-col", className)}>
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
)
