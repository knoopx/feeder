import { MdError } from "react-icons/md"
export const ErrorMessage: React.FC<{
  error: Error
}> = ({ error }) => (
  <pre className="text-red-600 italic flex items-center space-x-1 text-sm">
    <MdError className="w-4 h-4" />
    <span>{error.message}</span>
  </pre>
)
