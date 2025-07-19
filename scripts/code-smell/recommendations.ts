/**
 * Recommendation generation utilities
 */

import type { CodeSmell } from "./types";

export function generateRecommendations(smells: CodeSmell[]): string[] {
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
        recommendations.push("💡 Use the Single Responsibility Principle to reduce complexity.");
    }

    if (categories["Length Issues"] > 5) {
        recommendations.push("🟡 MEDIUM PRIORITY: Split large files and functions to improve readability.");
        recommendations.push("💡 Consider extracting utility functions or creating separate modules.");
    }

    if (categories["TypeScript Issues"] > 0) {
        recommendations.push("🟡 MEDIUM PRIORITY: Improve TypeScript usage for better type safety.");
        recommendations.push("💡 Use proper typing instead of 'any', prefer nullish coalescing and optional chaining.");
    }

    if (categories["React Issues"] > 0) {
        recommendations.push("🟠 IMPORTANT: Fix React hook dependencies to prevent bugs.");
        recommendations.push("💡 Ensure all hook dependencies are properly declared.");
    }

    if (categories["Maintainability Issues"] > 15) {
        recommendations.push("🔴 CRITICAL: Focus on code maintainability improvements.");
        recommendations.push("💡 Remove unused variables, replace magic numbers with constants.");
    }

    return recommendations;
}
