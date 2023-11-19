import { formatDistance } from "date-fns"
import { now } from "mobx-utils"
import { observer } from "mobx-react"

export const TimeAgo: React.FC<{ since: Date }> = observer(
  ({ since, ...props }) => {
    if (!since || !since.getTime) {
      return null
    }
    try {
      return (
        <span {...props}>
          {formatDistance(since, now(), { addSuffix: true })}
        </span>
      )
    } catch (e) {
      return null
    }
  },
)
