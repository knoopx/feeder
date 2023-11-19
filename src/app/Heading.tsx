import clsx from "clsx"
import { observer } from "mobx-react"
import { HTMLAttributes } from "react"

export const Heading: React.FC<HTMLAttributes<"span">> = observer(
  ({ className, ...props }) => (
    <span
      className={clsx(":uno-heading: text-xl font-medium", className)}
      {...props}
    />
  ),
)
