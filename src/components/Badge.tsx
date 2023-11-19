import clsx from "clsx"
import { observer } from "mobx-react"
import { HTMLAttributes, forwardRef } from "react"

export const Badge: React.FC<HTMLAttributes<"div">> = observer(
  forwardRef(({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          ":uno-badge: flex flow-center px-2 py-1 rounded-full text-xs font-medium leading-none",
          className,
        )}
        {...props}
      />
    )
  }),
)
