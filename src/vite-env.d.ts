/// <reference types="vite/client" />

declare module "*.peggy" {
  import { Parser } from "peggy"
  const parser: Parser
  export default parser
}
