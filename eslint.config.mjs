import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      
      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General code quality
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      
      // Next.js specific
      "@next/next/no-html-link-for-pages": "error",
    },
  },
  {
    files: ["prisma/seed.ts", "prisma/**/*.ts"],
    rules: {
      "no-console": "off", // Allow console in seed files
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores
    "node_modules/**",
    "app/generated/**",
    "*.config.js",
    "*.config.mjs",
    "*.config.ts",
    "prisma/migrations/**",
    "public/**",
    "tsconfig.tsbuildinfo",
  ]),
]);

export default eslintConfig;
