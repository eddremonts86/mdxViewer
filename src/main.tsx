import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// Bodoni Moda names every catalogued object; its italic is the designation.
import "@fontsource/bodoni-moda/500.css";
import "@fontsource/bodoni-moda/500-italic.css";
import "@fontsource/bodoni-moda/600.css";
// Archivo carries labels, figures and controls.
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
// JetBrains Mono is for code only.
import "@fontsource/jetbrains-mono/400.css";
import "./assets/styles/index.css";
// Import View Transitions CSS
import "./assets/styles/view-transitions.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>
);
