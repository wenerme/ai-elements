import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

const mergeConfigs = (...configs) =>
  defineConfig({
    env: Object.assign({}, ...configs.map((config) => config.env)),
    ignorePatterns: configs.flatMap((config) => config.ignorePatterns ?? []),
    overrides: configs.flatMap((config) => config.overrides ?? []),
    plugins: [...new Set(configs.flatMap((config) => config.plugins ?? []))],
    rules: Object.assign({}, ...configs.map((config) => config.rules)),
    settings: Object.assign({}, ...configs.map((config) => config.settings)),
  });

export default mergeConfigs(core, next, react, {
  ignorePatterns: [
    ".agents",
    "packages/shadcn-ui",
    "apps/docs/components/geistdocs",
    "apps/docs/lib/geistdocs",
    "apps/docs/hooks/geistdocs",
    "apps/docs/app",
    "apps/docs/geistdocs.tsx",
    "apps/docs/proxy.ts",
    "apps/docs/source.config.ts",
    "skills",
  ],
  overrides: [
    {
      files: [
        "packages/elements/__tests__/**/*.ts",
        "packages/elements/__tests__/**/*.tsx",
        "packages/elements/__tests__/**/*.js",
        "packages/elements/__tests__/**/*.jsx",
        "packages/elements/**/*.test.ts",
        "packages/elements/**/*.test.tsx",
        "packages/elements/**/*.test.js",
        "packages/elements/**/*.test.jsx",
      ],
      rules: {
        "jsx-a11y/prefer-tag-over-role": "off",
        "max-classes-per-file": "off",
        "prefer-named-capture-group": "off",
        "promise/avoid-new": "off",
        "promise/prefer-await-to-callbacks": "off",
        "react/no-this-in-sfc": "off",
        "require-unicode-regexp": "off",
        "typescript/consistent-type-imports": "off",
        "typescript/no-explicit-any": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-immediate-mutation": "off",
        "unicorn/prefer-add-event-listener": "off",
      },
    },
    {
      files: [
        "packages/examples/src/**/*.ts",
        "packages/examples/src/**/*.tsx",
      ],
      rules: {
        "eslint/no-await-in-loop": "off",
        "eslint/no-loop-func": "off",
        "promise/avoid-new": "off",
        "unicorn/consistent-function-scoping": "off",
      },
    },
    {
      files: ["packages/scripts/src/**/*.ts", "packages/scripts/src/**/*.tsx"],
      rules: {
        "eslint/no-await-in-loop": "off",
        "promise/prefer-await-to-then": "off",
      },
    },
    {
      files: ["packages/cli/**/*.js", "packages/elements/__tests__/**/*.js"],
      rules: {
        "unicorn/prefer-module": "off",
      },
    },
    {
      files: [
        "packages/elements/src/commit.tsx",
        "packages/elements/src/file-tree.tsx",
        "packages/elements/src/stack-trace.tsx",
      ],
      rules: {
        "jsx-a11y/no-noninteractive-element-interactions": "off",
      },
    },
    {
      files: ["packages/elements/src/model-selector.tsx"],
      rules: {
        "typescript/ban-types": "off",
      },
    },
  ],
  rules: {
    complexity: "off",
    "eslint/complexity": "off",
    "eslint/max-statements": "off",
    "import/no-relative-parent-imports": "off",
    "jest/prefer-called-with": "off",
    "jsx-a11y/heading-has-content": "off",
    "jsx-a11y/media-has-caption": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "max-statements": "off",
    "nextjs/no-img-element": "off",
    "no-empty-function": "off",
    "promise/avoid-new": "off",
    "promise/prefer-await-to-callbacks": "off",
    "promise/prefer-await-to-then": "off",
    "unicorn/prefer-add-event-listener": "off",
  },
});
