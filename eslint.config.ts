import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";
import unicornPlugin from "eslint-plugin-unicorn";
import globals from "globals";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
    eslintJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            "**/node_modules/**",
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname
            },
            globals: {
                ...globals.browser,
                ...globals.es2021
            },
            ecmaVersion: 2021,
            sourceType: "module"
        },
        plugins: {
            unicorn: unicornPlugin,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "no-multiple-empty-lines": ["error", { "max": 1 }],
            "no-trailing-spaces": "error",
            "semi": ["warn", "always"],
            "quotes": ["warn", "double"],
            "eol-last": ["warn", "always"],
            "no-mixed-spaces-and-tabs": "error",
            "indent": ["error", 4]
        }
    }
);
