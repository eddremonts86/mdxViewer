/**
 * Custom ESLint formatter that highlights code smells with colors and emojis
 * Makes code quality issues more obvious in terminal output
 */

// ANSI color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    bgRed: "\x1b[41m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
};

// Code smell categories with emojis and colors
const smellCategories = {
    complexity: { emoji: "🔴", color: colors.red, label: "COMPLEXITY" },
    length: { emoji: "📏", color: colors.yellow, label: "LENGTH" },
    maintainability: {
        emoji: "🔧",
        color: colors.cyan,
        label: "MAINTAINABILITY",
    },
    style: { emoji: "🎨", color: colors.magenta, label: "STYLE" },
    typescript: { emoji: "💙", color: colors.blue, label: "TYPESCRIPT" },
    react: { emoji: "⚛️", color: colors.green, label: "REACT" },
    default: { emoji: "⚠️", color: colors.yellow, label: "GENERAL" },
};

const ruleCategories: Record<string, keyof typeof smellCategories> = {
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

interface LintMessage {
    severity: number;
    line: number;
    column: number;
    message: string;
    ruleId?: string;
    fix?: unknown;
}

interface LintResult {
    filePath: string;
    messages: LintMessage[];
}

function getSeverityDisplay(severity: number): {
    emoji: string;
    color: string;
    label: string;
} {
    switch (severity) {
        case 2:
            return { emoji: "🚨", color: colors.red, label: "ERROR" };
        case 1:
            return { emoji: "⚠️", color: colors.yellow, label: "WARNING" };
        default:
            return { emoji: "ℹ️", color: colors.blue, label: "INFO" };
    }
}

function getCategoryDisplay(ruleId: string) {
    const category = ruleCategories[ruleId] || "default";
    return smellCategories[category];
}

function formatMessage(message: LintMessage, filePath: string): string {
    const severity = getSeverityDisplay(message.severity);
    const category = getCategoryDisplay(message.ruleId || "");

    // Format the line with colors and emojis
    let output = "";

    // File path (relative)
    const relativePath = filePath.replace(process.cwd(), "").replace(/^\//, "");
    output += `${colors.gray}${relativePath}${colors.reset}\n`;

    // Location with line and column
    output += `  ${colors.cyan}${message.line}:${message.column}${colors.reset}`;

    // Severity indicator
    output += `  ${severity.color}${severity.emoji} ${severity.label}${colors.reset}`;

    // Category indicator
    output += `  ${category.color}${category.emoji} ${category.label}${colors.reset}`;

    // Rule ID
    if (message.ruleId) {
        output += `  ${colors.gray}[${message.ruleId}]${colors.reset}`;
    }

    // Message
    output += `\n    ${colors.bright}${message.message}${colors.reset}`;

    // Auto-fixable indicator
    if (message.fix) {
        output += `  ${colors.green}✨ Auto-fixable${colors.reset}`;
    }

    return output;
}

function buildCategoryCount(results: LintResult[]): Record<string, number> {
    const categoryCount: Record<string, number> = {};

    results.forEach(result => {
        result.messages.forEach(message => {
            const category = getCategoryDisplay(message.ruleId || "").label;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
    });

    return categoryCount;
}

function buildTotals(results: LintResult[]) {
    let totalErrors = 0;
    let totalWarnings = 0;
    let fixableErrors = 0;
    let fixableWarnings = 0;

    results.forEach(result => {
        result.messages.forEach(message => {
            if (message.severity === 2) {
                totalErrors++;
                if (message.fix) fixableErrors++;
            } else {
                totalWarnings++;
                if (message.fix) fixableWarnings++;
            }
        });
    });

    return { totalErrors, totalWarnings, fixableErrors, fixableWarnings };
}

function generateSummaryHeader(): string {
    return (
        "\n" +
        "=".repeat(60) +
        "\n" +
        `${colors.bright}📊 CODE SMELL SUMMARY${colors.reset}\n` +
        "=".repeat(60) +
        "\n"
    );
}

function generateTotalsSection(
    totalErrors: number,
    totalWarnings: number,
    fixableErrors: number,
    fixableWarnings: number
): string {
    let section = "";

    if (totalErrors > 0) {
        section += `🚨 ${colors.red}${totalErrors} errors${colors.reset}`;
        if (fixableErrors > 0) {
            section += ` (${colors.green}${fixableErrors} auto-fixable${colors.reset})`;
        }
        section += "\n";
    }

    if (totalWarnings > 0) {
        section += `⚠️  ${colors.yellow}${totalWarnings} warnings${colors.reset}`;
        if (fixableWarnings > 0) {
            section += ` (${colors.green}${fixableWarnings} auto-fixable${colors.reset})`;
        }
        section += "\n";
    }

    return section;
}

function generateCategoriesSection(
    categoryCount: Record<string, number>
): string {
    if (Object.keys(categoryCount).length === 0) return "";

    let section = "\n📋 Issues by category:\n";
    Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
            const categoryInfo =
                Object.values(smellCategories).find(
                    c => c.label === category
                ) || smellCategories.default;
            section += `   ${categoryInfo.emoji} ${categoryInfo.color}${category}${colors.reset}: ${count}\n`;
        });

    return section;
}

function generateRecommendationsSection(
    totalErrors: number,
    totalWarnings: number,
    fixableErrors: number,
    fixableWarnings: number,
    categoryCount: Record<string, number>
): string {
    if (totalErrors === 0 && totalWarnings === 0) return "";

    let section = "\n💡 Quick fixes:\n";

    if (fixableErrors > 0 || fixableWarnings > 0) {
        section += `   Run ${colors.cyan}npm run lint:fix${colors.reset} to auto-fix ${fixableErrors + fixableWarnings} issues\n`;
    }
    section += `   Run ${colors.cyan}npm run code-smell-report${colors.reset} for detailed analysis\n`;

    // Priority recommendations
    if (categoryCount["COMPLEXITY"] > 5) {
        section += `   🔴 HIGH PRIORITY: ${categoryCount["COMPLEXITY"]} complexity issues need attention\n`;
    }
    if (categoryCount["TYPESCRIPT"] > 0) {
        section += `   💙 TYPESCRIPT: Improve type safety (${categoryCount["TYPESCRIPT"]} issues)\n`;
    }
    if (categoryCount["REACT"] > 0) {
        section += `   ⚛️  REACT: Fix hook dependencies (${categoryCount["REACT"]} issues)\n`;
    }

    return section;
}

function formatSummary(results: LintResult[]): string {
    const { totalErrors, totalWarnings, fixableErrors, fixableWarnings } =
        buildTotals(results);
    const categoryCount = buildCategoryCount(results);

    let summary = generateSummaryHeader();
    summary += generateTotalsSection(
        totalErrors,
        totalWarnings,
        fixableErrors,
        fixableWarnings
    );
    summary += generateCategoriesSection(categoryCount);
    summary += generateRecommendationsSection(
        totalErrors,
        totalWarnings,
        fixableErrors,
        fixableWarnings,
        categoryCount
    );
    summary += "=".repeat(60) + "\n";

    return summary;
}

export default function codeSmellFormatter(results: LintResult[]): string {
    let output = "";
    let hasMessages = false;

    // Header
    output += `\n${colors.bright}🔍 CODE SMELL ANALYSIS${colors.reset}\n`;
    output += `${colors.gray}Analyzing ${results.length} files for code quality issues...${colors.reset}\n\n`;

    results.forEach(result => {
        if (result.messages.length > 0) {
            hasMessages = true;
            result.messages.forEach(message => {
                output += formatMessage(message, result.filePath) + "\n\n";
            });
        }
    });

    if (hasMessages) {
        output += formatSummary(results);
    } else {
        output += `${colors.green}✨ No code smells detected! Your code is clean! 🎉${colors.reset}\n`;
    }

    return output;
}
