import React from "react"

export const Select = ({ className, ...props }) => (
  <select
    className={[
      "appearance-none w-full mb-1 px-3 py-2 border rounded text-grey-700",
      className,
    ]}
    {...props}
  />
)
