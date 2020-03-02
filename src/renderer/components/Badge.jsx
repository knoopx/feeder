import React from "react"
import classNames from "classnames"

export const Badge = ({ className, ...props }) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-center py-1 px-2 font-medium rounded-full text-xs leading-none",
        className,
      )}
      {...props}
    />
  )
}
