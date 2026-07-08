import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  {
    // `public/widget.js` is the pre-built, minified embed loader bundle
    // (generated from `apps/embed`) served as a static asset — it is shipped
    // output, not source, so it is not linted (same reasoning as `dist/**`).
    ignores: ["public/widget.js"],
  },
  ...nextJsConfig,
]
