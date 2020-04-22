import typescript from "rollup-plugin-typescript2"

export default {
  input: "./src/index.ts",
  output: {
    format: "cjs",
    file: "./dist/index.cjs.js",
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfigDefaults: {
        include: ["./src/**/*"],
        compilerOptions: { declaration: true },
      },
    }),
  ],
  external: ["react", "prop-types", "runtypes"],
}
