import React, { useRef } from "react"
import ReactDOM from "react-dom"
import classNames from "classnames"
import { animated, useSpring } from "react-spring"
import { usePopper, useOnClickOutside } from "hooks"
import { useHotkeys } from "react-hotkeys-hook"

export const Popover = ({
  children,
  referenceElement,
  className,
  placement,
  modifiers,
  style,
  onDismiss,
  ...props
}) => {
  const popoverRef = useRef()
  const arrowRef = useRef()

  useOnClickOutside(popoverRef, onDismiss)
  useHotkeys("escape", onDismiss)

  const spring = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(5%)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0%)",
    },
  })

  const {
    style: popperStyle,
    placement: popperPlacement,
    arrowStyle,
    scheduleUpdate,
  } = usePopper({
    referenceElement,
    popperNode: popoverRef,
    arrowNode: arrowRef,
    placement,
    modifiers,
  })

  scheduleUpdate()

  return ReactDOM.createPortal(
    <animated.div
      {...props}
      ref={popoverRef}
      style={{
        ...style,
        ...popperStyle,
        ...spring,
        transform: spring.transform.interpolate(
          (x) => `${popperStyle.transform} ${x}`,
        ),
      }}
      className={classNames("popover", popperPlacement, className)}
    >
      {children}
      <div className="arrow" ref={arrowRef} style={arrowStyle} />
    </animated.div>,
    document.querySelector("#root"),
  )
}

Popover.defaultProps = {
  onDismiss: () => {},
  placement: "auto",
}
