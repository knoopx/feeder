import React, { forwardRef } from "react"

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

export const HeaderButton = forwardRef(({ className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={["cursor-pointer block hover:text-pink-300", className]}
      {...props}
    />
  )
})
