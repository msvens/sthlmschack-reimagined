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
