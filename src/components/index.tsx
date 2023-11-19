import clsx from "clsx"
import { HTMLAttributes } from "react"
export { AnimatedBadge } from "./AnimatedBadge"
export { Badge } from "./Badge"
export { Button } from "./Button"
export { FavIcon } from "./FavIcon"
export { HeaderButton } from "./HeaderButton"
export { Panel } from "./Panel"
export { Preview } from "./Preview"
export { Spinner } from "./Spinner"
export { TimeAgo } from "./TimeAgo"

const input =
  ":uno-input: appearance-none w-full flex-auto px-3 py-2 font-mono bg-white text-gray-700 rounded shadow-sm border"

export const textarea = clsx(":uno-textarea: resize-none", input)
const select = clsx(
  input,
  ":uno-select: truncate bg-no-repeat bg-right",
  // css`
  //   background-image: url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"%2F%3E%3C%2Fsvg%3E');
  //   background-position: right 0.75rem center;
  //   background-repeat: no-repeat;
  //   background-size: 1.2em;
  //   padding-right: 2.5rem;
  // `,
)

export const Input: React.FC<HTMLAttributes<{}>> = ({
  className,
  ...props
}) => <input {...props} className={clsx(input, className)} />

export const Select: React.FC<HTMLAttributes<{}>> = ({
  className,
  ...props
}) => <select {...props} className={clsx(select, className)} />

export const TextArea: React.FC<HTMLAttributes<{}>> = ({
  className,
  ...props
}) => <textarea {...props} className={clsx(textarea, className)} />

export const Indicator: React.FC<HTMLAttributes<{}>> = ({
  className,
  ...props
}) => (
  <div
    {...props}
    className={clsx(
      ":uno-indicator: inline-block h-2 w-2 rounded-full bg-pink-600",
      className,
    )}
  />
)
