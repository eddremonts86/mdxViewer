/**
 * Formatting Utilities
 * Helper functions for formatting file names, sizes, dates, etc.
 */

import path from "path";
import { FORMAT_CONFIG, TEXT_REPLACEMENTS } from "../constants/index.js";

/**
 * Format file name to a human-readable title
 */
export const formatFileName = (fileName: string): string => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const extension = path.extname(fileName);

    let formatted = nameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Apply text replacements for common technical terms
    Object.entries(TEXT_REPLACEMENTS).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, "g");
        formatted = formatted.replace(regex, value);
    });

    return formatted + extension;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const k = FORMAT_CONFIG.SIZE_BASE;
    const decimals = FORMAT_CONFIG.SIZE_DECIMALS;
    const units = FORMAT_CONFIG.SIZE_UNITS;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${size} ${units[i]}`;
};

/**
 * Format date to human-readable format
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = FORMAT_CONFIG.MONTHS;

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

/**
 * Format API messages with placeholders
 */
export const formatMessage = (
    template: string,
    replacements: Record<string, string | number>
): string => {
    let formatted = template;

    Object.entries(replacements).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        formatted = formatted.replace(
            new RegExp(placeholder, "g"),
            value.toString()
        );
    });

    return formatted;
};
