#!/usr/bin/env node

console.log("🚀 Starting preview generation test...");

import { promises as fs } from "fs";

console.log("Imports successful");

const CONTENT_DIR = "./public/content";
const PREVIEWS_DIR = "./public/previews";

console.log("Constants defined");

async function test() {
    try {
        console.log("Testing directory access...");

        // Check if content directory exists
        const contentExists = await fs
            .access(CONTENT_DIR)
            .then(() => true)
            .catch(() => false);
        console.log("Content directory exists:", contentExists);

        if (contentExists) {
            const files = await fs.readdir(CONTENT_DIR);
            console.log("Content directory files:", files.slice(0, 5)); // Show first 5
        }
    } catch (error) {
        console.error("Test error:", error.message);
    }
}

test();
