/**
 * Constants and configuration for code smell detection
 */

export const SMELL_CATEGORIES = {
    complexity: "Complexity Issues",
    length: "Length Issues",
    maintainability: "Maintainability Issues",
    performance: "Performance Issues",
    style: "Style Issues",
    typescript: "TypeScript Issues",
    react: "React Issues",
    accessibility: "Accessibility Issues",
} as const;

export const RULE_CATEGORIES: Record<string, keyof typeof SMELL_CATEGORIES> = {
    complexity: "complexity",
    "max-lines-per-function": "length",
    "max-lines": "length",
    "max-params": "complexity",
    "max-depth": "complexity",
    "max-len": "length",
    "no-unused-vars": "maintainability",
    "@typescript-eslint/no-unused-vars": "maintainability",
    "no-magic-numbers": "maintainability",
    "id-length": "style",
    "@typescript-eslint/no-explicit-any": "typescript",
    "@typescript-eslint/prefer-nullish-coalescing": "typescript",
    "@typescript-eslint/prefer-optional-chain": "typescript",
    "react-hooks/exhaustive-deps": "react",
    "no-console": "maintainability",
    "prefer-const": "style",
    "arrow-body-style": "style",
};

export const ESLINT_COMMAND = "npx eslint src/ --format json --max-warnings 0";
