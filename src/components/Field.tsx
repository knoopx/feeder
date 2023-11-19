import clsx from "clsx"

export const Field = ({ title, children, className, contentClass }) => (
  <label className={clsx(":uno-field: flow-col space-y-0.5", className)}>
    <div className="font-medium">{title}</div>
    <div className={contentClass}>{children}</div>
  </label>
)
