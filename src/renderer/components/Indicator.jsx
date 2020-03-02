import React from "react"
import classNames from "classnames"

export const Indicator = ({ className }) => {
  return (
    <div
      className={classNames(
        "h-2 w-2 align-bottom mb-1 rounded-full bg-pink-600 inline-block",
        className,
      )}
    />
  )
}
