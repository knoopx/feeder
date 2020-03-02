import React from "react"

export const Link = ({ className, ...props }) => (
  <a
    className={["cursor-pointer inline-flex items-center", className]}
    {...props}
  />
)
