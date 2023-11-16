import { observer } from "mobx-react"

export const Indicator = observer(({ className }) => {
  return <div className={["Indicator", className]} />
})
