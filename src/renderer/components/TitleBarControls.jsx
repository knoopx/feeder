import React, { useRef, useEffect } from "react"
import { useHover } from "hooks"
import { remote } from "electron"

const Control = ({ className, ...props }) => {
  return (
    <div
      className={[
        "flex items-center justify-center mr-2 last-child:mr-0 rounded-full",
        className,
      ]}
      style={{
        width: 12,
        height: 12,
        color: "rgba(0,0,0,0.6)",
      }}
      {...props}
    />
  )
}

export const TitleBarControls = () => {
  const ref = useRef()
  const isHovered = useHover(ref)
  const win = remote.getCurrentWindow()

  return (
    <div ref={ref} className="flex">
      <Control
        className="bg-red-500"
        onClick={() => {
          win.close()
        }}
      >
        {isHovered && (
          <svg width="10px" height="10px" viewBox="0 0 20 20">
            <polygon
              fill="currentColor"
              points="15.9,5.2 14.8,4.1 10,8.9 5.2,4.1 4.1,5.2 8.9,10 4.1,14.8 5.2,15.9 10,11.1 14.8,15.9 15.9,14.8 11.1,10 "
            />
          </svg>
        )}
      </Control>
      <Control
        className="bg-yellow-500"
        onClick={() => {
          win.minimize()
        }}
      >
        {isHovered && (
          <svg width="10px" height="10px" viewBox="0 0 20 20">
            <rect fill="currentColor" x="2.4" y="9" width="15.1" height="2" />
          </svg>
        )}
      </Control>
      <Control
        className="bg-green-500"
        onClick={() => {
          win.isMaximized() ? win.unmaximize() : win.maximize()
        }}
      >
        {isHovered &&
          (win.isMaximized() ? (
            <svg width="10px" height="10px" viewBox="0 0 20 20">
              <path
                fill="currentColor"
                d="M8.7,10H1l9,8.8v-7.5C9.3,11.2,8.7,10.7,8.7,10z"
              />
              <path
                fill="currentColor"
                d="M11.3,10H19l-9-8.8v7.5C10.7,8.8,11.3,9.3,11.3,10z"
              />
            </svg>
          ) : (
            <svg width="10px" height="10px" viewBox="0 0 20 20">
              <path
                fill="currentColor"
                d="M5.3,16H13L4,7v7.7C4.6,14.7,5.3,15.4,5.3,16z"
              />
              <path
                fill="currentColor"
                d="M14.7,4H7l9,9V5.3C15.4,5.3,14.7,4.6,14.7,4z"
              />
            </svg>
          ))}
      </Control>
    </div>
  )
}
