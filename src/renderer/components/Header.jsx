import React from "react"

export const Header = ({ className, ...props }) => {
  return (
    <div
      style={{ minHeight: 48, WebkitAppRegion: "drag" }}
      className={[
        "flex overflow-hidden items-center px-4 bg-pink-800 text-white leading-none",
        className,
      ]}
      {...props}
    />
  )
}
