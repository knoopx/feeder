import React from "react"

export const Badge = ({ className, ...props }) => {
  return (
    <div
      className={[
        "flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-none",
        className,
      ]}
      {...props}
    />
  )
}
