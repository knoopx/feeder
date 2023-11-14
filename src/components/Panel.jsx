import React from "react"
import { observer } from "mobx-react"
import { Header } from "."

export const Panel = observer(
  ({ panelClassName, className, header, children }) => {
    return (
      <div className={["flex flex-col", panelClassName]}>
        <Header className="justify-between border-pink-700">{header}</Header>
        <div className={[className, "flex flex-auto overflow-y-auto"]}>
          {children}
        </div>
      </div>
    )
  },
)
