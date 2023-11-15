import { useRef, useEffect } from "react"
import { inject, observer } from "mobx-react"
import { MdError, MdDelete } from "react-icons/md"
import { Spinner, AnimatedBadge, FavIcon, TimeAgo } from "../components"

const Source = ({ source, isActive, className, editMode, store, ...props }) => {
  const ref = useRef()

  useEffect(() => {
    if (isActive) {
      ref.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [isActive])

  const onRemove = (e) => {
    e.stopPropagation()
    store.removeSource(source)
  }

  return (
    <div
      ref={ref}
      className={["flex border-b cursor-pointer select-none", className]}
      {...props}
    >
      <div
        className={[
          "flex flex-auto items-center px-4 h-16 min-w-0",
          {
            "border-l-4 border-pink-600": isActive,
            "bg-red-100": source.error,
          },
        ]}
      >
        <div
          className={[
            "flow-col max-w-full min-w-0",
            {
              "font-semibold": isActive,
            },
          ]}
        >
          <div className="flex flex-auto items-center">
            {source.error ? (
              <span className="mr-2 text-red-600" title={source.error.message}>
                <MdError size="1.25rem" />
              </span>
            ) : (
              <FavIcon className="mr-2" src={source.baseURL || source.href} />
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
                className={["ml-4 text-muted"]}
                value={source.newItemsCount}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default inject("store")(observer(Source))
