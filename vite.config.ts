import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import peggy from "peggy"
import unoCSS from 'unocss/vite'

const vitePeggy = (options = {}) => {
  return {
    name: "vite-peggy",
    enforce: "pre",
    transform(input, id) {
      if (!id.toLowerCase().endsWith(".peggy")) return null

      try {
        const code = peggy.generate(input, {
          ...options,
          grammarSource: id,
          format: "es",
          output: "source-with-inline-map",
          trace: id.toLowerCase().includes("trace"),
          map: null,
        })

        return {
          code,
          map: null,
          warnings: null,
        }
      } catch (e) {
        if (typeof e.format === "function") {
          throw new Error(e.format([{ source: id, text: input }]))
        } else {
          throw e
        }
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    unoCSS(),
    vitePeggy({
      // trace: true,
      cache: true,
    }),
    react(),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
  },
})
