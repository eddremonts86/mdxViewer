/**
 * Custom ESLint formatter that highlights code smells with colors and emojis
 * Makes code quality issues more obvious in terminal output
 */

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};

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

const ruleCategories = {
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

function getSeverityDisplay(severity) {
    switch (severity) {
        case 2:
            return { emoji: "🚨", color: colors.red, label: "ERROR" };
        case 1:
            return { emoji: "⚠️", color: colors.yellow, label: "WARNING" };
        default:
            return { emoji: "ℹ️", color: colors.blue, label: "INFO" };
    }
}

function getCategoryDisplay(ruleId) {
    const category = ruleCategories[ruleId] || "default";
    return smellCategories[category];
}

function formatMessage(message, filePath) {
    const severity = getSeverityDisplay(message.severity);
    const category = getCategoryDisplay(message.ruleId || "");

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

function buildTotals(results) {
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

function buildCategoryCount(results) {
    const categoryCount = {};

    results.forEach(result => {
        result.messages.forEach(message => {
            const category = getCategoryDisplay(message.ruleId || "").label;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
    });

    return categoryCount;
}

function formatSummary(results) {
    const { totalErrors, totalWarnings, fixableErrors, fixableWarnings } =
        buildTotals(results);
    const categoryCount = buildCategoryCount(results);

    let summary = "\n" + "=".repeat(60) + "\n";
    summary += `${colors.bright}📊 CODE SMELL SUMMARY${colors.reset}\n`;
    summary += "=".repeat(60) + "\n";

    // Totals
    if (totalErrors > 0) {
        summary += `🚨 ${colors.red}${totalErrors} errors${colors.reset}`;
        if (fixableErrors > 0) {
            summary += ` (${colors.green}${fixableErrors} auto-fixable${colors.reset})`;
        }
        summary += "\n";
    }

    if (totalWarnings > 0) {
        summary += `⚠️  ${colors.yellow}${totalWarnings} warnings${colors.reset}`;
        if (fixableWarnings > 0) {
            summary += ` (${colors.green}${fixableWarnings} auto-fixable${colors.reset})`;
        }
        summary += "\n";
    }

    // Category breakdown
    if (Object.keys(categoryCount).length > 0) {
        summary += "\n📋 Issues by category:\n";
        Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .forEach(([category, count]) => {
                const categoryInfo =
                    Object.values(smellCategories).find(
                        c => c.label === category
                    ) || smellCategories.default;
                summary += `   ${categoryInfo.emoji} ${categoryInfo.color}${category}${colors.reset}: ${count}\n`;
            });
    }

    // Recommendations
    if (totalErrors > 0 || totalWarnings > 0) {
        summary += "\n💡 Quick fixes:\n";
        if (fixableErrors > 0 || fixableWarnings > 0) {
            summary += `   Run ${colors.cyan}npm run lint:fix${colors.reset} to auto-fix ${fixableErrors + fixableWarnings} issues\n`;
        }
        summary += `   Run ${colors.cyan}npm run code-smell-report${colors.reset} for detailed analysis\n`;

        // Priority recommendations
        if (categoryCount["COMPLEXITY"] > 5) {
            summary += `   🔴 HIGH PRIORITY: ${categoryCount["COMPLEXITY"]} complexity issues need attention\n`;
        }
        if (categoryCount["TYPESCRIPT"] > 0) {
            summary += `   💙 TYPESCRIPT: Improve type safety (${categoryCount["TYPESCRIPT"]} issues)\n`;
        }
        if (categoryCount["REACT"] > 0) {
            summary += `   ⚛️  REACT: Fix hook dependencies (${categoryCount["REACT"]} issues)\n`;
        }
    }

    summary += "=".repeat(60) + "\n";

    return summary;
}

module.exports = function codeSmellFormatter(results) {
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
};
