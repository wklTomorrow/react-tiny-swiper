import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs", // CommonJS (适用于 require 等)
      exports: "named",
    },
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  external: ["react", "react-dom"],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    postcss({
      extensions: [".css", ".less"],
      use: [["less", { javascriptEnabled: true }]],
    }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "runtime",
    }),
    terser(),
  ],
};
