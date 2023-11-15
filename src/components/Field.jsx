import React from "react"

export const Field = ({ title, children, className }) => (
  <label className={["flow-col", className]}>
    <div className="font-medium">{title}</div>
    {children}
  </label>
)
