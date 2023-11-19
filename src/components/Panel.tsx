import React, { HTMLAttributes, PropsWithChildren } from "react"
import { observer } from "mobx-react"
import clsx from "clsx"

// css`
//   ${container} {
//     ${header} {
//       ${apply`border-pink-700 border-r`}
//     }

//     ${content} {
//       ${apply`border-r`}
//     }
//   }
// `

export const PanelContainer: React.FC<HTMLAttributes<"div">> = ({
  className,
  ...props
}) => (
  <div
    {...props}
    className={clsx(
      ":uno-panel-container: flow-row",
      className,
    )}
  />
)

const PanelHeader: React.FC<
  HTMLAttributes<"div"> & {
    icon: React.ReactNode
  }
> = observer(({ icon, children, className }) => {
  return (
    <div
      className={clsx(
        ":uno-panel-header: select-none flex space-x-2 overflow-hidden items-center px-4 bg-pink-800 text-white leading-none min-h-[48px] [.\@panel-container_&]:border-r border-pink-700",
        className,
      )}
    >
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
  } & HTMLAttributes<"div">) => {
    return (
      <div className={clsx(":uno-panel: flex flex-col", className)}>
        <PanelHeader icon={icon} className={headerClass}>
          {header}
        </PanelHeader>
        <div
          className={clsx(
            ":uno-panel-content: &:flex &:flex-col &:flex-auto &:overflow-y-auto [.\@panel-container_&]:border-r ",
            contentClass,
          )}
        >
          {children}
        </div>
      </div>
    )
  },
)
