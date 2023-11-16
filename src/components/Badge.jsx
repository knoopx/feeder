import { observer } from "mobx-react"
import { forwardRef } from "react"

export const Badge = observer(
  forwardRef(({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium leading-none",
          className,
        ]}
        {...props}
      />
    )
  }),
)
