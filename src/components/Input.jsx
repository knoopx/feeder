import React from "react"

export const Input = ({ className, ...props }) => (
  <input
    className={[
      "appearance-none w-full mb-1 px-3 py-2 border rounded text-grey-700",
      className,
    ]}
    {...props}
  />
)
