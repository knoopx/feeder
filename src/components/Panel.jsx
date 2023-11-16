import React from "react"
import { observer } from "mobx-react"

const PanelHeader = observer(({ icon, children, className }) => {
  return (
    <div className={["PanelHeader", className]}>
      {icon}
      {children}
    </div>
  )
})

export const Panel = observer(
  ({ icon, className, contentClass, headerClass, header, children }) => {
    return (
      <div className={["Panel", className]}>
        <PanelHeader icon={icon} className={headerClass}>
          {header}
        </PanelHeader>
        <div className={["PanelContent", contentClass]}>{children}</div>
      </div>
    )
  },
)
