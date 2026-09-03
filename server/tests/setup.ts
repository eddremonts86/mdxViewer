// Global test setup
import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
    // Setup before all tests
    console.log("Starting test suite...");
});

afterAll(async () => {
    // Cleanup after all tests
    console.log("Test suite completed");
});
