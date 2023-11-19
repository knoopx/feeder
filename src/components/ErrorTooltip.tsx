import { MdError } from "react-icons/md"

export const ErrorTooltip = ({ error }) => (
  <span className="mx-2 text-red-600" title={error.message}>
    <MdError size="1.25rem" />
  </span>
)
