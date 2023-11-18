import React, {
  DetailedReactHTMLElement,
  PropsWithChildren,
  ReactHTML,
  ReactHTMLElement,
  ReactNode,
} from "react"
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
  ({
    icon,
    className,
    contentClass,
    headerClass,
    header,
    children,
  }: PropsWithChildren<"div"> & {
    icon: React.ReactNode
    contentClass?: string
    headerClass?: string
    header: React.ReactNode
  }) => {
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
