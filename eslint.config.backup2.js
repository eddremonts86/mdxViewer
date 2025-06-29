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

            // CODE SMELL DETECTION RULES
            // ===========================
            
            // Function complexity - detect overly complex functions
            "complexity": ["warn", { "max": 10 }],
            
            // Function length - detect long functions 
            "max-lines-per-function": ["warn", {
                "max": 50,
                "skipBlankLines": true,
                "skipComments": true
            }],
            
            // File length - detect large files
            "max-lines": ["warn", {
                "max": 500,
                "skipBlankLines": true,
                "skipComments": true
            }],
            
            // Parameter count - detect functions with too many parameters
            "max-params": ["warn", { "max": 4 }],
            
            // Nesting depth - detect deeply nested code
            "max-depth": ["warn", { "max": 4 }],
            
            // Variable declarations - prefer const/let over var
            "no-var": "error",
            "prefer-const": "warn",
            
            // Dead code detection
            "no-unreachable": "error",
            "no-unused-vars": ["warn", { 
                "varsIgnorePattern": "^(tw|tailwind)",
                "argsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }],
            
            // Duplicate code indicators
            "no-duplicate-imports": "error",
            
            // Magic numbers
            "no-magic-numbers": ["warn", {
                "ignore": [-1, 0, 1, 2],
                "ignoreArrayIndexes": true,
                "ignoreDefaultValues": true,
                "detectObjects": false
            }],
            
            // Long identifier names
            "id-length": ["warn", { 
                "min": 2, 
                "max": 50,
                "exceptions": ["i", "j", "k", "x", "y", "z", "_"]
            }],
            
            // TypeScript specific code smells
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { 
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/no-unnecessary-type-assertion": "warn",
            
            // React specific code smells
            "react-hooks/exhaustive-deps": "warn",

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
            "complexity": ["warn", { "max": 10 }],
            
            // Function length - detect long functions 
            "max-lines-per-function": ["warn", {
                "max": 50,
                "skipBlankLines": true,
                "skipComments": true
            }],
            
            // File length - detect large files
            "max-lines": ["warn", {
                "max": 500,
                "skipBlankLines": true,
                "skipComments": true
            }],
            
            // Parameter count - detect functions with too many parameters
            "max-params": ["warn", { "max": 4 }],
            
            // Nesting depth - detect deeply nested code
            "max-depth": ["warn", { "max": 4 }],
            
            // Variable declarations and dead code
            "no-var": "error",
            "prefer-const": "warn",
            "no-unreachable": "error",
            "no-unused-vars": ["warn", { 
                "varsIgnorePattern": "^(tw|tailwind)",
                "argsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }],
            
            // Duplicate code indicators
            "no-duplicate-imports": "error",
            
            // Magic numbers
            "no-magic-numbers": ["warn", {
                "ignore": [-1, 0, 1, 2],
                "ignoreArrayIndexes": true,
                "ignoreDefaultValues": true,
                "detectObjects": false
            }],
            
            // Long identifier names
            "id-length": ["warn", { 
                "min": 2, 
                "max": 50,
                "exceptions": ["i", "j", "k", "x", "y", "z", "_"]
            }],

            // Code formatting rules
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-trailing-spaces": "error",
            "eol-last": "error",

            // TypeScript specific code smells
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { 
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/no-unnecessary-type-assertion": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            
            // React specific code smells
            "react-hooks/exhaustive-deps": "warn",
        },
    }
);
