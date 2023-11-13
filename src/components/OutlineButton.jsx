import React from "react"

export const OutlineButton = ({ color, className, ...props }) => (
  <button
    className={[
      `flex-auto px-4 py-2 border border-${color} rounded text-${color} hover:bg-${color}-400 hover:text-white`,
      className,
    ]}
    {...props}
  />
)

OutlineButton.defaultProps = {
  color: "pink",
}
