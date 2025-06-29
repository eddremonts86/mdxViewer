import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", "node_modules", "public"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "simple-import-sort": simpleImportSort,
            tailwindcss: tailwindcss,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],

            // Tailwind CSS rules - most commonly used globally
            "tailwindcss/classnames-order": "error",
            "tailwindcss/enforces-negative-arbitrary-values": "error",
            "tailwindcss/enforces-shorthand": "error",
            "tailwindcss/migration-from-tailwind-2": "error",
            "tailwindcss/no-arbitrary-value": "off", // Allow arbitrary values
            "tailwindcss/no-custom-classname": "off", // Allow custom classes
            "tailwindcss/no-contradicting-classname": "error",
            "tailwindcss/no-unnecessary-arbitrary-value": "error",

            // Import sorting rules
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // React and React-related imports first
                        ["^react", "^react-dom"],
                        // External library imports
                        ["^[a-z]"],
                        // Internal imports with @/
                        ["^@/"],
                        // Relative imports
                        ["^\\.\\.", "^\\./"],
                        // CSS imports last
                        ["\\.css$", "\\.scss$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",

            // Code formatting rules
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-trailing-spaces": "error",
            "eol-last": "error",

            // TypeScript specific
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",

            // React specific
            "react-hooks/exhaustive-deps": "warn",
        },
    }
);
