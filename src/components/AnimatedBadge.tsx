import React from "react"
import { animated, useSpring } from "react-spring"

import { Badge } from "./Badge"

const Base = animated(Badge)

export const AnimatedBadge = ({ value, ...props }) => {
  const spring = useSpring({ value })
  return <Base {...props}>{spring.value.to((x) => Math.floor(x))}</Base>
}
