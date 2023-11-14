import React from "react";


export const Field = ({ title,children }) => (
  <label>
    <div className="font-medium">{title}</div>
    {children}
  </label>
);
