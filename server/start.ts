/**
 * The file service's entry point: take the app and bind it to a port.
 */

import app from "./app.js";
import { SERVER_CONFIG } from "./constants/index.js";

const server = app.listen(SERVER_CONFIG.PORT, () => {
    console.warn(`MDX Viewer file service on http://localhost:${SERVER_CONFIG.PORT}`);
    console.warn(`Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
    console.warn(
        `Allowed origins: ${SERVER_CONFIG.ALLOWED_ORIGINS.length > 0 ? SERVER_CONFIG.ALLOWED_ORIGINS.join(", ") : "same-origin only"}`
    );
});

const shutdown = () => {
    console.warn("Shutting down the file service");
    server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
