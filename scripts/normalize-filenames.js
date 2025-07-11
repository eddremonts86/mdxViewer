#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function toKebabCase(str) {
    return (
        str
            // Handle camelCase and PascalCase
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            // Replace underscores and spaces with hyphens
            .replace(/[_\s]+/g, "-")
            // Convert to lowercase
            .toLowerCase()
            // Remove multiple consecutive hyphens
            .replace(/-+/g, "-")
            // Remove leading/trailing hyphens
            .replace(/^-+|-+$/g, "")
    );
}

function normalizeFilename(filename) {
    // Remove double extensions like .md.md or .mdx.mdx
    let normalized = filename.replace(/\.(md|mdx)\.(md|mdx)$/, ".$1");

    // Get file extension
    const ext = path.extname(normalized);
    const nameWithoutExt = path.basename(normalized, ext);

    // Convert to kebab-case
    const kebabName = toKebabCase(nameWithoutExt);

    return kebabName + ext;
}

function walkDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkDirectory(fullPath);
        } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
            const normalizedName = normalizeFilename(item);

            if (normalizedName !== item) {
                const newPath = path.join(dir, normalizedName);
                console.log(`Renaming: ${fullPath} -> ${newPath}`);

                // Check if target file already exists
                if (fs.existsSync(newPath)) {
                    console.log(
                        `  WARNING: Target file already exists, skipping: ${newPath}`
                    );
                    continue;
                }

                try {
                    fs.renameSync(fullPath, newPath);
                    console.log(`  ✓ Success`);
                } catch (error) {
                    console.log(`  ✗ Error: ${error.message}`);
                }
            }
        }
    }
}

const contentDir = path.join(__dirname, "../public/content");
console.log("Starting filename normalization...");
console.log(`Content directory: ${contentDir}`);
console.log("");

walkDirectory(contentDir);

console.log("");
console.log("Filename normalization complete!");
