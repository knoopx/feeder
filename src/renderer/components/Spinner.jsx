import React from "react"

export const Spinner = ({ size, color, className }) => (
  <svg
    className={["spinner", className]}
    width={size}
    height={size}
    viewBox="0 0 100 100"
  >
    <g transform="translate(10 10)">
      <circle
        fill="none"
        stroke={color}
        strokeDasharray={`${(2 * Math.PI * 40) / 4} ${2 * Math.PI * 40 * 3}`}
        strokeWidth="20"
        cx="40"
        cy="40"
        r="40"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        fill="none"
        opacity="0.3"
        stroke={color}
        strokeWidth="20"
        cx="40"
        cy="40"
        r="40"
      />
    </g>
  </svg>
)

Spinner.defaultProps = {
  size: 50,
  color: "gray",
}
