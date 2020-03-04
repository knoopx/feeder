import React from "react"
import { animated, useSpring } from "react-spring"

import { Badge } from "./Badge"

const ABadge = animated(Badge)

export const AnimatedBadge = ({ value, ...props }) => {
  const spring = useSpring({
    value,
  })
  return (
    <ABadge {...props}>{spring.value.interpolate((x) => Math.floor(x))}</ABadge>
  )
}
