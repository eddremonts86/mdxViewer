#!/usr/bin/env node

/**
 * Code Smell Detection and Reporting Tool
 *
 * This script analyzes the codebase for various code smells and generates
 * detailed reports with severity levels and recommendations.
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";

interface CodeSmell {
    file: string;
    line: number;
    column: number;
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    category: string;
    fixable: boolean;
}

interface SmellReport {
    timestamp: string;
    totalFiles: number;
    totalSmells: number;
    errors: number;
    warnings: number;
    categories: Record<string, number>;
    smells: CodeSmell[];
    recommendations: string[];
}

const SMELL_CATEGORIES = {
    complexity: "Complexity Issues",
    length: "Length Issues",
    maintainability: "Maintainability Issues",
    performance: "Performance Issues",
    style: "Style Issues",
    typescript: "TypeScript Issues",
    react: "React Issues",
    accessibility: "Accessibility Issues",
} as const;

const RULE_CATEGORIES: Record<string, keyof typeof SMELL_CATEGORIES> = {
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

function runESLint(): string {
    try {
        const command = "npx eslint src/ --format json --max-warnings 0";
        return execSync(command, { encoding: "utf-8", cwd: process.cwd() });
    } catch (error: unknown) {
        // ESLint returns exit code 1 when there are linting errors
        const execError = error as { stdout?: string };
        return execError.stdout || "[]";
    }
}

function parseESLintOutput(output: string): CodeSmell[] {
    const results = JSON.parse(output);
    const smells: CodeSmell[] = [];

    for (const result of results) {
        for (const message of result.messages) {
            const category =
                RULE_CATEGORIES[message.ruleId] || "maintainability";

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

function generateRecommendations(smells: CodeSmell[]): string[] {
    const recommendations: string[] = [];
    const categories = smells.reduce(
        (acc, smell) => {
            acc[smell.category] = (acc[smell.category] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    if (categories["Complexity Issues"] > 10) {
        recommendations.push(
            "🔴 HIGH PRIORITY: Consider breaking down complex functions into smaller, more focused functions.",
        );
        recommendations.push(
            "💡 Use the Single Responsibility Principle to reduce complexity.",
        );
    }

    if (categories["Length Issues"] > 5) {
        recommendations.push(
            "🟡 MEDIUM PRIORITY: Split large files and functions to improve readability.",
        );
        recommendations.push(
            "💡 Consider extracting utility functions or creating separate modules.",
        );
    }

    if (categories["TypeScript Issues"] > 0) {
        recommendations.push(
            "🟡 MEDIUM PRIORITY: Improve TypeScript usage for better type safety.",
        );
        recommendations.push(
            "💡 Use proper typing instead of 'any', prefer nullish coalescing and optional chaining.",
        );
    }

    if (categories["React Issues"] > 0) {
        recommendations.push(
            "🟠 IMPORTANT: Fix React hook dependencies to prevent bugs.",
        );
        recommendations.push(
            "💡 Ensure all hook dependencies are properly declared.",
        );
    }

    if (categories["Maintainability Issues"] > 15) {
        recommendations.push(
            "🔴 CRITICAL: Focus on code maintainability improvements.",
        );
        recommendations.push(
            "💡 Remove unused variables, replace magic numbers with constants.",
        );
    }

    return recommendations;
}

function generateHTMLReport(report: SmellReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Smell Report - MDXViewer</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        .chart-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .recommendations {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .recommendations h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        .recommendation {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            background: #ecf0f1;
        }
        .smells-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table { width: 100%; border-collapse: collapse; }
        th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:hover { background: #f8f9fa; }
        .severity-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .severity-error { background: #e74c3c; color: white; }
        .severity-warning { background: #f39c12; color: white; }
        .severity-info { background: #3498db; color: white; }
        .fixable { color: #27ae60; font-weight: bold; }
        .not-fixable { color: #e74c3c; }
        h1, h2, h3 { color: #2c3e50; }
        .timestamp { opacity: 0.7; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Code Smell Analysis Report</h1>
            <p class="timestamp">Generated: ${report.timestamp}</p>
            <p>Comprehensive code quality analysis for MDXViewer project</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${report.totalFiles}</div>
                <div class="stat-label">Files Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.totalSmells}</div>
                <div class="stat-label">Total Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.errors}</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${report.warnings}</div>
                <div class="stat-label">Warnings</div>
            </div>
        </div>

        <div class="chart-container">
            <h3>Issues by Category</h3>
            <canvas id="categoryChart" width="400" height="200"></canvas>
        </div>

        <div class="recommendations">
            <h3>🎯 Recommendations</h3>
            ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join("")}
        </div>

        <div class="smells-table">
            <table>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Line</th>
                        <th>Rule</th>
                        <th>Severity</th>
                        <th>Category</th>
                        <th>Message</th>
                        <th>Fixable</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.smells
        .map(
            smell => `
                        <tr>
                            <td><code>${smell.file}</code></td>
                            <td>${smell.line}:${smell.column}</td>
                            <td><code>${smell.rule}</code></td>
                            <td><span class="severity-badge severity-${smell.severity}">${smell.severity}</span></td>
                            <td>${smell.category}</td>
                            <td>${smell.message}</td>
                            <td class="${smell.fixable ? "fixable" : "not-fixable"}">
                                ${smell.fixable ? "✅ Auto-fixable" : "❌ Manual fix required"}
                            </td>
                        </tr>
                    `,
        )
        .join("")}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('categoryChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [${Object.keys(report.categories)
        .map(c => `"${c}"`)
        .join(",")}],
                datasets: [{
                    data: [${Object.values(report.categories).join(",")}],
                    backgroundColor: [
                        '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71',
                        '#3498db', '#9b59b6', '#34495e', '#95a5a6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

function main(): void {
    console.log("🔍 Starting code smell analysis...");

    const eslintOutput = runESLint();
    const smells = parseESLintOutput(eslintOutput);

    const categories = smells.reduce(
        (acc, smell) => {
            acc[smell.category] = (acc[smell.category] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const report: SmellReport = {
        timestamp: new Date().toISOString(),
        totalFiles: [...new Set(smells.map(s => s.file))].length,
        totalSmells: smells.length,
        errors: smells.filter(s => s.severity === "error").length,
        warnings: smells.filter(s => s.severity === "warning").length,
        categories,
        smells: smells.sort((a, b) => {
            if (a.severity !== b.severity) {
                return a.severity === "error" ? -1 : 1;
            }
            return a.file.localeCompare(b.file);
        }),
        recommendations: generateRecommendations(smells),
    };

    // Generate reports
    const htmlReport = generateHTMLReport(report);
    const jsonReport = JSON.stringify(report, null, 2);

    // Write reports
    writeFileSync("code-smell-report.html", htmlReport);
    writeFileSync("code-smell-report.json", jsonReport);

    console.log("✅ Analysis complete!");
    console.log(
        `📊 Found ${report.totalSmells} issues in ${report.totalFiles} files`,
    );
    console.log(`🔴 Errors: ${report.errors}`);
    console.log(`🟡 Warnings: ${report.warnings}`);
    console.log("📁 Reports generated:");
    console.log("   - code-smell-report.html (interactive)");
    console.log("   - code-smell-report.json (machine-readable)");

    if (report.totalSmells > 0) {
        console.log("\n🎯 Top recommendations:");
        report.recommendations
            .slice(0, 3)
            .forEach(rec => console.log(`   ${rec}`));
    }
}

main();
