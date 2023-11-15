import React from "react"
import { observer } from "mobx-react"

const Styled = ({
  base,
  className,
  component: Component = "div",
  ...props
}) => {
  return <Component {...props} className={[base, className]} />
}
export const Panel = observer(
  ({ className, contentClass, headerClass, header, children }) => {
    return (
      <div className={["Panel", className]}>
        <div className={["PanelHeader", headerClass]}>{header}</div>
        <div className={["PanelContent", contentClass]}>{children}</div>
      </div>
    )
  },
)
