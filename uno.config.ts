import { defineConfig, presetTypography } from "unocss"
import { variantMatcher } from "@unocss/preset-mini/utils"
import presetTailwind from "@unocss/preset-wind"
import transformerDirectives from "@unocss/transformer-directives"
import transformerVariantGroup from "@unocss/transformer-variant-group"
import transformerCompileClass from "@unocss/transformer-compile-class"
export default defineConfig({
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
    transformerCompileClass({ classPrefix: "@" }),
  ],

  presets: [presetTailwind(), presetTypography()],
  variants: [
    variantMatcher("&", ({ selector }) => {
      return {
        parent: `html :where(${selector})`,
        selector: null,
      }
    }),
  ],
  shortcuts: {
    "text-muted": "text-gray-500 [.active_&]:text-pink-300",
    "bg-muted": "bg-gray-50",
    "flow-col": "flex flex-col flex-grow",
    "flow-row": "flex flex-row flex-grow",
    "flow-center": "items-center justify-center",
    "flow-between": "items-center justify-between",
  },
})
