import coreWebVitals from "eslint-config-next/core-web-vitals";
import reactCompiler from "eslint-plugin-react-compiler";

const eslintConfig = [
  ...coreWebVitals,
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      // Surface anything React Compiler refuses to optimize — typically
      // side effects in render (setState during render, mutating props,
      // etc.). Disabling per-occurrence has a real cost: the affected
      // component is then skipped by the compiler's memoization pass.
      "react-compiler/react-compiler": "error",
    },
  },
  {
    // The SDK's test-data corpus is a catalogue of tournament ids and notes for
    // discovery and manual verification — dev-only. It ships on its own subpath
    // precisely so it stays out of a consumer's bundle; importing it from app
    // code would drag ~20KB of JSON into production for no runtime purpose.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@msvens/schack-se-sdk/corpus",
              message:
                "The corpus is dev-only. Use it in tests or scripts/, not in app code — it would be bundled for production.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**/*.js",
    ],
  },
];

export default eslintConfig;
