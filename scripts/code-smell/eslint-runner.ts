/**
 * ESLint execution and output parsing utilities
 */

import { execSync } from "child_process";

import { ESLINT_COMMAND, RULE_CATEGORIES, SMELL_CATEGORIES } from "./constants";
import type { CodeSmell, ESLintResult } from "./types";

export function runESLint(): string {
    try {
        return execSync(ESLINT_COMMAND, { encoding: "utf-8", cwd: process.cwd() });
    } catch (error: unknown) {
        // ESLint returns exit code 1 when there are linting errors
        const execError = error as { stdout?: string };
        return execError.stdout ?? "[]";
    }
}

export function parseESLintOutput(output: string): CodeSmell[] {
    const results: ESLintResult[] = JSON.parse(output);
    const smells: CodeSmell[] = [];

    for (const result of results) {
        for (const message of result.messages) {
            const category = RULE_CATEGORIES[message.ruleId] || "maintainability";

            smells.push({
                file: result.filePath.replace(process.cwd(), ""),
                line: message.line,
                column: message.column,
                rule: message.ruleId,
                severity: message.severity === 2 ? "error" : "warning",
                message: message.message,
                category: SMELL_CATEGORIES[category],
                fixable: message.fix !== undefined,
            });
        }
    }

    return smells;
}
