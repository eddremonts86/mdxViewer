import path from "path";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

/**
 * Two processes, two port variables. `npm run dev` starts the client and the
 * file service together, so they must not read the same one: a single `PORT`
 * would be inherited by both and they would fight over it. The client takes
 * `PORT` (which is what a launcher assigns), the file service takes `API_PORT`.
 */
const CLIENT_PORT = Number(process.env.PORT) || 5173;
const API_PORT = Number(process.env.API_PORT) || 3001;

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // @mdx-js/rollup used to sit here compiling nothing: there is not one
        // `.mdx` file in `src/`. The documents this app renders live in the
        // content folder and are fetched at runtime, so they are compiled at
        // runtime too — see src/components/markdown/MdxDocument.tsx.
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: CLIENT_PORT,
        proxy: {
            "/api": {
                target: `http://localhost:${API_PORT}`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
