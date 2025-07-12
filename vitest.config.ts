import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./tests/setup.ts"],
        testTimeout: 10000,
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "tests/",
                "dist/",
                "public/",
                "src/",
                "*.config.*",
            ],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
            "@server": path.resolve(__dirname, "./server"),
            "@tests": path.resolve(__dirname, "./tests"),
        },
    },
});
