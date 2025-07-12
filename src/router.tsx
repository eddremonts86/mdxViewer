import { createBrowserRouter } from "react-router-dom";

import { Layout } from "@/components/globals/Layout";
import { DocumentPage } from "@/pages/DocumentPage";
import { DocumentsListPage } from "@/pages/DocumentsListPage";
import { HomePage } from "@/pages/HomePage";
import { StatisticsPage } from "@/pages/StatisticsPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "/statistics",
                element: <StatisticsPage />,
            },
            {
                path: "/users",
                element: (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Users</h1>
                        <p className="text-muted-foreground">
                            User management coming soon...
                        </p>
                    </div>
                ),
            },
            {
                path: "/settings",
                element: (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">
                            Settings page coming soon...
                        </p>
                    </div>
                ),
            },
            {
                path: "/docs",
                element: <DocumentsListPage />,
            },
            {
                path: "/document/*",
                element: <DocumentPage />,
            },
            {
                path: "*",
                element: <DocumentPage />,
            },
        ],
    },
]);
