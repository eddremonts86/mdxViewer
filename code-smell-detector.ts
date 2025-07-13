#!/usr/bin/env node

/**
 * Code Smell Detection and Reporting Tool - Fully Modular Version
 *
 * This script analyzes the codebase for various code smells and generates
 * detailed reports with severity levels and recommendations.
 */

import { parseESLintOutput, runESLint } from "./eslint-runner";
import { buildReport, logResults, writeReports } from "./report-builder";

function main(): void {
    console.warn("🔍 Starting code smell analysis...");

    const eslintOutput = runESLint();
    const smells = parseESLintOutput(eslintOutput);
    const report = buildReport(smells);

    writeReports(report);
    logResults(report);
}

main();
