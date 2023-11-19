import clsx from "clsx"

export const Button = ({ className, ...props }) => (
  <button
    className={clsx(
      ":uno-button: flex-auto px-4 py-2 rounded bg-pink text-white hover:bg-pink-600 font-bold",
      className,
    )}
    {...props}
  />
)
