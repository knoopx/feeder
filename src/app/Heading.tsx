import { observer } from "mobx-react"

export const Heading: React.FC = observer(({ className, ...props }) => (
  <span className={["Heading", className]} {...props} />
))
