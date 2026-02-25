import { defineConfig } from "orval";

export default defineConfig({
  api: {
    output: {
      mode: "split",
      client: "react-query",
      target: "src/utils/api.ts",
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
