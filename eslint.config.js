import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", "node_modules", "public"] },
    // Configuration for TypeScript files
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: tseslint.parser,
            parserOptions: {
                project: [
                    "./tsconfig.json",
                    "./tsconfig.app.json",
                    "./tsconfig.node.json",
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],

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

            // CODE SMELL DETECTION RULES
            // ===========================

            // Function complexity - Allow moderate complexity for React components
            complexity: ["error", { max: 15 }],

            // Function length - Allow larger functions for React components
            "max-lines-per-function": [
                "error",
                {
                    max: 100,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // File length - Allow larger files for main components
            "max-lines": [
                "error",
                {
                    max: 800,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // Parameter count - detect functions with too many parameters
            "max-params": ["error", { max: 4 }],

            // Nesting depth - detect deeply nested code
            "max-depth": ["error", { max: 4 }],

            // Variable declarations and dead code - Allow unused parameters
            "no-var": "error",
            "prefer-const": "error",
            "no-unreachable": "error",
            "no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^(tw|tailwind|_)",
                    argsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],

            // Duplicate code indicators
            "no-duplicate-imports": "error",

            // Magic numbers - Allow commonly used values
            "no-magic-numbers": [
                "error",
                {
                    ignore: [
                        -1, 0, 1, 2, 3, 4, 5, 6, 8, 10, 11, 16, 18, 36, 50, 55,
                        60, 80, 95, 100, 140, 145, 200, 255, 300, 404, 500, 800,
                        1000, 30000, 60000,
                    ],
                    ignoreArrayIndexes: true,
                    ignoreDefaultValues: true,
                    detectObjects: false,
                },
            ],

            // Long identifier names - Allow shorter names for common cases
            "id-length": [
                "error",
                {
                    min: 2,
                    max: 50,
                    exceptions: [
                        "i",
                        "j",
                        "k",
                        "x",
                        "y",
                        "z",
                        "_",
                        "a",
                        "b",
                        "c",
                        "d",
                        "e",
                        "f",
                        "n",
                        "p",
                        "s",
                        "t",
                    ],
                },
            ],

            // Code formatting rules
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-trailing-spaces": "error",
            "eol-last": "error",
            "max-len": [
                "error",
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],

            // TypeScript specific code smells
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/consistent-type-definitions": [
                "error",
                "interface",
            ],
            "@typescript-eslint/prefer-readonly": "error",
            "@typescript-eslint/no-inferrable-types": "error",

            // React specific code smells
            "react-hooks/exhaustive-deps": "error",

            // Additional code smell rules
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "no-alert": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "prefer-arrow-callback": "error",
            "arrow-body-style": ["error", "as-needed"],
            "no-else-return": "error",
            "prefer-template": "error",
            "object-shorthand": "error",
            "prefer-destructuring": [
                "error",
                {
                    array: true,
                    object: true,
                },
                {
                    enforceForRenamedProperties: false,
                },
            ],
        },
    },
    // Configuration for JavaScript files (scripts folder)
    {
        extends: [js.configs.recommended],
        files: ["scripts/**/*.{js,cjs,mjs}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: { ...globals.browser, ...globals.node },
            sourceType: "module",
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            // Import sorting rules
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // Basic code quality rules
            complexity: ["error", { max: 10 }],
            "max-lines-per-function": [
                "error",
                { max: 50, skipBlankLines: true, skipComments: true },
            ],
            "max-lines": [
                "error",
                { max: 500, skipBlankLines: true, skipComments: true },
            ],
            "max-params": ["error", { max: 4 }],
            "max-depth": ["error", { max: 4 }],
            "no-var": "error",
            "prefer-const": "error",
            "no-unreachable": "error",
            "no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", ignoreRestSiblings: true },
            ],
            "no-duplicate-imports": "error",
            "no-magic-numbers": [
                "error",
                {
                    ignore: [-1, 0, 1, 2],
                    ignoreArrayIndexes: true,
                    ignoreDefaultValues: true,
                },
            ],
            "id-length": [
                "error",
                {
                    min: 2,
                    max: 50,
                    exceptions: ["i", "j", "k", "x", "y", "z", "_"],
                },
            ],

            // Code formatting rules
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-trailing-spaces": "error",
            "eol-last": "error",
            "max-len": [
                "error",
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],

            // Additional code smell rules
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "no-alert": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "prefer-arrow-callback": "error",
            "arrow-body-style": ["error", "as-needed"],
            "no-else-return": "error",
            "prefer-template": "error",
            "object-shorthand": "error",
            "prefer-destructuring": [
                "error",
                { array: true, object: true },
                { enforceForRenamedProperties: false },
            ],
        },
    }
);
