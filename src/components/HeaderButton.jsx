import React,{ forwardRef } from "react";


export const HeaderButton = forwardRef(({ className,...props },ref) => {
  return (
    <a
      ref={ref}
      className={["cursor-pointer block hover:text-pink-300",className]}
      {...props} />
  );
});
