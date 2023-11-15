import React from "react"

export const Indicator = ({ className }) => {
  return (
    <div
      className={["inline-block h-2 w-2 rounded-full bg-pink-600", className]}
    />
  )
}
