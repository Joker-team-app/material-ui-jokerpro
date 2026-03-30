import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import ts from "typescript";

const typescriptTranspile = () => ({
  name: "typescript-transpile",
  transform(code, id) {
    if (!/\.tsx?$/.test(id)) {
      return null;
    }

    const result = ts.transpileModule(code, {
      fileName: id,
      compilerOptions: {
        target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        esModuleInterop: true,
        sourceMap: false,
      },
      reportDiagnostics: true,
    });

    if (result.diagnostics?.length) {
      const message = ts.formatDiagnosticsWithColorAndContext(
        result.diagnostics,
        {
          getCanonicalFileName: (fileName) => fileName,
          getCurrentDirectory: () => process.cwd(),
          getNewLine: () => "\n",
        }
      );

      throw new Error(message);
    }

    return {
      code: result.outputText,
      map: { mappings: "" },
    };
  },
});

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
    },
  ],
  plugins: [
    resolve({
      extensions: [".mjs", ".js", ".json", ".node", ".ts", ".tsx"],
    }),
    commonjs(),
    typescriptTranspile(),
    postcss({
      extensions: [".css"],
      extract: "joker_tokens.css",
      minimize: true,
      sourceMap: false,
    }),
  ],
  external: ["react", "react-dom"],
};
