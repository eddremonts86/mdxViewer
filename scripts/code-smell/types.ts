/**
 * Type definitions for code smell detection and reporting
 */

export interface CodeSmell {
    file: string;
    line: number;
    column: number;
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    category: string;
    fixable: boolean;
}

export interface SmellReport {
    timestamp: string;
    totalFiles: number;
    totalSmells: number;
    errors: number;
    warnings: number;
    categories: Record<string, number>;
    smells: CodeSmell[];
    recommendations: string[];
}

export interface ESLintMessage {
    line: number;
    column: number;
    ruleId: string;
    severity: number;
    message: string;
    fix?: unknown;
}

export interface ESLintResult {
    filePath: string;
    messages: ESLintMessage[];
}
