import { useRef, useEffect } from "react"
import { inject, observer } from "mobx-react"
import { MdDelete } from "react-icons/md"
import { Spinner, AnimatedBadge, FavIcon, TimeAgo } from "../components"
import { ErrorTooltip } from "../components/ErrorTooltip"

import cn, { clsx } from "clsx"
export const Source = inject("store")(
  observer(({ source, isActive, className, editMode, store, ...props }) => {
    const ref = useRef()

    useEffect(() => {
      if (isActive) {
        ref.current.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        })
      }
    }, [isActive])

    const onRemove = (e: KeyboardEvent) => {
      e.stopPropagation()
      store.removeSource(source)
    }

    return (
      <div
        ref={ref}
        className={clsx(
          ":uno-source: flex border-b cursor-pointer select-none",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            ":uno-source-content: flow-row items-center px-4 h-16",
            {
              "border-l-4 border-pink-600": isActive,
              "bg-red-100": source.error,
            },
          )}
        >
          <div
            className={cn("flow-col", {
              "font-semibold": isActive,
            })}
          >
            <div className="flow-row items-center">
              {source.error ? (
                <ErrorTooltip error={source.error} />
              ) : (
                <FavIcon className="mr-2" src={source.baseURL} />
              )}
              <div className="min-w-0 truncate">{source.title}</div>
            </div>
            {source.updatedAt > 0 && (
              <TimeAgo
                className="ml-6 text-muted text-xs"
                since={source.updatedAt}
              />
            )}
          </div>

          <div className="flex items-center">
            {source.isLoading ? (
              <Spinner size="1.25rem" className="ml-4" />
            ) : editMode ? (
              <a className="text-muted" onClick={onRemove}>
                <MdDelete size="1.25rem" />
              </a>
            ) : (
              source.newItemsCount > 0 && (
                <AnimatedBadge
                  className="ml-4 text-muted"
                  value={source.newItemsCount}
                />
              )
            )}
          </div>
        </div>
      </div>
    )
  }),
)
