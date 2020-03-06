import React from "react"

export const Badge = ({ className, ...props }) => {
  return (
    <div
      className={[
        "flex items-center justify-center px-2 py-1 rounded-full bg-pink-600 text-shadow text-white text-xxs font-bold leading-none",
        className,
      ]}
      {...props}
    />
  )
}
