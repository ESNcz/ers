// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "eslint.config.mjs",
      "dist/**",
      "node_modules/**",
      "database/**",
      "documentation/**",
      "storage/**",
      "webpack.config.js",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": "warn",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "Use absolute imports instead (@api/*, utilities/*).",
            },
          ],
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    // NestJS DI needs runtime class imports in injectable contexts
    files: [
      "**/*.service.ts",
      "**/*.service*.ts",
      "**/*.controller*.ts",
      "**/*.mapper*.ts",
      "**/*.guard.ts",
      "**/*.strategy.ts",
      "**/*.pipe.ts",
    ],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
);
