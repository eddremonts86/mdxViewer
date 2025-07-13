/**
 * Report building and generation utilities
 */

import { writeFileSync } from "fs";

import { generateHTMLReport } from "./html-reporter";
import { generateRecommendations } from "./recommendations";
import type { CodeSmell, SmellReport } from "./types";

export function buildReport(smells: CodeSmell[]): SmellReport {
    const categories = smells.reduce(
        (acc, smell) => {
            acc[smell.category] = (acc[smell.category] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const sortedSmells = smells.slice().sort((a, b) => {
        if (a.severity !== b.severity) {
            return a.severity === "error" ? -1 : 1;
        }
        return a.file.localeCompare(b.file);
    });

    return {
        timestamp: new Date().toISOString(),
        totalFiles: [...new Set(smells.map(s => s.file))].length,
        totalSmells: smells.length,
        errors: smells.filter(s => s.severity === "error").length,
        warnings: smells.filter(s => s.severity === "warning").length,
        categories,
        smells: sortedSmells,
        recommendations: generateRecommendations(smells),
    };
}

export function writeReports(report: SmellReport): void {
    const htmlReport = generateHTMLReport(report);
    const jsonReport = JSON.stringify(report, null, 2);

    writeFileSync("code-smell-report.html", htmlReport);
    writeFileSync("code-smell-report.json", jsonReport);
}

export function logResults(report: SmellReport): void {
    console.warn("✅ Analysis complete!");
    console.warn(`📊 Found ${report.totalSmells} issues in ${report.totalFiles} files`);
    console.warn(`🔴 Errors: ${report.errors}`);
    console.warn(`🟡 Warnings: ${report.warnings}`);
    console.warn("📁 Reports generated:");
    console.warn("   - code-smell-report.html (interactive)");
    console.warn("   - code-smell-report.json (machine-readable)");

    if (report.totalSmells > 0) {
        console.warn("\n🎯 Top recommendations:");
        report.recommendations.slice(0, 3).forEach(rec => console.warn(`   ${rec}`));
    }
}
