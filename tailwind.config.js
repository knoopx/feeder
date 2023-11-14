import { fontFamily } from "tailwindcss/defaultTheme"

export const content = ["./src/**/*.{js,jsx,ts,tsx}"]
export const theme = {
  extend: {
    fontFamily: {
      logo: ["Open Sans", ...fontFamily.sans],
    },
  },
}

export const plugins = [
  ({ addVariant }) => {
    addVariant("default", "html :where(&)")
  },
]
