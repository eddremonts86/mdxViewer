/**
 * Ultra minimal server for debugging path-to-regexp issues
 */

import express from "express";

const app = express();
const PORT = 3002;

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Just a basic route
app.get("/api/health", (_req, res) => {
    console.log("Health endpoint called");
    res.json({ status: "ok" });
});

// Basic preview route - single level only
app.get("/api/previews/:filename", (req, res) => {
    console.log(
        `Preview endpoint called with filename: ${req.params.filename}`
    );
    res.json({ filename: req.params.filename });
});

// Start server
app.listen(PORT, () => {
    console.warn(`🚀 Ultra minimal server running on http://localhost:${PORT}`);
});

export default app;
