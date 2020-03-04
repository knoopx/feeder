import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react"
import { observer, useLocalStore } from "mobx-react"

export const VirtualList = observer(
  forwardRef(({ items, itemHeight, children, bufferSize = 10 }, ref) => {
    const container = useRef()

    const store = useLocalStore(
      (local) => ({
        clientHeight: 0,
        scrollTop: 0,

        get totalHeight() {
          return local.itemHeight * local.items.length
        },
        get visibleItemsCount() {
          return Math.ceil(store.clientHeight / local.itemHeight) + 1
        },
        get firstItemIndex() {
          return Math.floor(store.scrollTop / local.itemHeight)
        },
        get firstVisibleItemIndex() {
          return Math.max(0, store.firstItemIndex - local.bufferSize)
        },
        get lastVisibleItemIndex() {
          return Math.min(
            store.firstItemIndex + local.bufferSize + store.visibleItemsCount,
            items.length,
          )
        },
        get visibleItemsOffsetY() {
          return Math.min(
            store.firstVisibleItemIndex * local.itemHeight,
            store.totalHeight,
          )
        },
        get visibleItems() {
          return local.items.slice(
            store.firstVisibleItemIndex,
            store.lastVisibleItemIndex,
          )
        },
      }),
      { items, itemHeight, bufferSize },
    )

    const onScroll = (e) => {
      store.scrollTop = e.target.scrollTop
    }

    useImperativeHandle(ref, () => ({
      scrollToIndex: (index) => {
        const itemTopPosition = index * itemHeight

        // top threshold
        if (itemTopPosition < container.current.scrollTop) {
          container.current.scrollTop = itemTopPosition
        }

        // bottom threshold
        if (
          itemTopPosition + itemHeight >
          container.current.scrollTop + store.clientHeight
        ) {
          container.current.scrollTop =
            itemTopPosition - store.clientHeight + itemHeight
        }
      },
    }))

    useEffect(() => {
      store.scrollTop = container.current.scrollTop
      store.clientHeight = container.current.clientHeight
    }, [])

    return (
      <div className="flex flex-auto overflow-hidden">
        <div
          ref={(r) => {
            container.current = r
            ref.current = r
          }}
          style={{
            overflowY: "overlay",
          }}
          onScroll={onScroll}
        >
          <div
            className="flex flex-col overflow-hidden"
            style={{
              height: store.totalHeight - store.visibleItemsOffsetY,
              transform: `translateY(${store.visibleItemsOffsetY}px)`,
            }}
          >
            {store.visibleItems.map(children)}
          </div>
        </div>
      </div>
    )
  }),
)
