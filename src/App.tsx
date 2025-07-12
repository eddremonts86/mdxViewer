import { RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "@/components/globals/ErrorBoundary";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { router } from "@/router";

import "./assets/styles/App.css";

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
