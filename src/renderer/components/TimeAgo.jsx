import React from "react"
import { formatDistance } from "date-fns"
import { now } from "mobx-utils"
import { observer } from "mobx-react"

export const TimeAgo = observer(({ since, ...props }) => {
  return (
    <span {...props}>{formatDistance(since, now(), { addSuffix: true })}</span>
  )
})
