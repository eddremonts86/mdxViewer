import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
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

            // Function complexity - detect overly complex functions
            complexity: ["error", { max: 10 }],

            // Function length - detect long functions
            "max-lines-per-function": [
                "error",
                {
                    max: 50,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // File length - detect large files
            "max-lines": [
                "error",
                {
                    max: 500,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // Parameter count - detect functions with too many parameters
            "max-params": ["error", { max: 4 }],

            // Nesting depth - detect deeply nested code
            "max-depth": ["error", { max: 4 }],

            // Variable declarations and dead code
            "no-var": "error",
            "prefer-const": "error",
            "no-unreachable": "error",
            "no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^(tw|tailwind)",
                    argsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],

            // Duplicate code indicators
            "no-duplicate-imports": "error",

            // Magic numbers
            "no-magic-numbers": [
                "error",
                {
                    ignore: [-1, 0, 1, 2],
                    ignoreArrayIndexes: true,
                    ignoreDefaultValues: true,
                    detectObjects: false,
                },
            ],

            // Long identifier names
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
    }
);
