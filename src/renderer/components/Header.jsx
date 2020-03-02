import React from "react"
import classNames from "classnames"

export const Header = ({ className, ...props }) => {
  return (
    <div
      style={{ minHeight: 48, WebkitAppRegion: "drag" }}
      className={classNames(
        "flex items-center px-4 bg-pink-800 text-white leading-none overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}
