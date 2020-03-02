import React from "react"
import { inject, observer } from "mobx-react"
import { MdError, MdDelete } from "react-icons/md"
import { Spinner, Badge, FavIcon } from "components"
import classNames from "classnames"
import { formatDistance } from "date-fns"
import { now } from "mobx-utils"

const Source = ({ source, isActive, className, editMode, store, ...props }) => {
  return (
    <div
      className={classNames("cursor-pointer flex border-b", className)}
      {...props}
    >
      <div
        className={classNames(
          "flex min-w-0 flex-auto items-center px-4  h-12",
          {
            "border-l-4 border-pink-600": isActive,
            "bg-red-100": source.error,
          },
        )}
      >
        <div
          className={classNames("flex flex-auto flex-col max-w-full min-w-0", {
            "font-semibold": isActive,
          })}
        >
          <div className="flex flex-auto items-center">
            {source.error ? (
              <span className="mr-2 text-red-600" title={source.error.message}>
                <MdError size="1.25rem" />
              </span>
            ) : (
              <FavIcon className="mr-2" src={source.href} />
            )}
            <div className="min-w-0 truncate">{source.name}</div>
          </div>
          {source.updatedAt > 0 && (
            <div className="ml-6 text-gray-600 text-xs">
              {formatDistance(source.updatedAt, now(), { addSuffix: true })}
            </div>
          )}
        </div>

        <div className="flex items-center">
          {source.isLoading ? (
            <Spinner size="1.25rem" className="ml-4" />
          ) : editMode ? (
            <a
              className="text-gray-600"
              onClick={() => store.removeSource(source)}
            >
              <MdDelete size="1.25rem" />
            </a>
          ) : (
            source.newItemsCount > 0 && (
              <Badge className={classNames("ml-4 text-gray-600")}>
                {source.newItemsCount}
              </Badge>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default inject("store")(observer(Source))
