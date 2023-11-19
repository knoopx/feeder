import clsx from "clsx"
import { forwardRef } from "react"

export const HeaderButton = forwardRef(({ className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={clsx(":uno-header-button: cursor-pointer block hover:text-pink-300", className)}
      {...props}
    />
  )
})
