import { defineConfig } from "orval";

export default defineConfig({
  api: {
    output: {
      mode: "split",
      client: "react-query",
      target: "src/utils/api.ts",
      // Mutator is parsed with the tsconfig target - ES2017 can't parse the dynamic `import()` in customInstance
      tsconfig: { compilerOptions: { target: "esnext" } },
      override: {
        mutator: {
          path: "./src/utils/customInstance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          //   usePrefetch: true,
        },
      },
    },
    input: {
      target: "http://localhost:4000/docs-json",
    },
    hooks: {
      afterAllFilesWrite: ["pnpm prettier --write ./src/utils/api.ts"],
    },
  },
});
