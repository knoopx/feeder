import React from "react"

export const Button = ({ color, className, ...props }) => (
  <button
    className={[
      `flex-auto px-4 py-2 rounded bg-${color} text-white hover:bg-${color}-600 font-bold`,
      className,
    ]}
    {...props}
  />
)

Button.defaultProps = {
  color: "pink",
}
