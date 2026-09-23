import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { DocumentLoader } from "@/components/document";
import { RouteError } from "@/components/globals/RouteError";
import { Layout } from "@/layouts/Layout";

// One chunk per surface: the chart canvas and the markdown pipeline are the two
// heaviest things in the app and neither belongs in the first payload.
const HomePage = lazy(() => import("@/pages/HomePage").then(module => ({ default: module.HomePage })));
const DocumentPage = lazy(() => import("@/pages/DocumentPage").then(module => ({ default: module.DocumentPage })));
const DocumentsListPage = lazy(() =>
    import("@/pages/DocumentsListPage").then(module => ({ default: module.DocumentsListPage }))
);
const StatisticsPage = lazy(() =>
    import("@/pages/StatisticsPage").then(module => ({ default: module.StatisticsPage }))
);
const TrashPage = lazy(() => import("@/pages/TrashPage").then(module => ({ default: module.TrashPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(module => ({ default: module.NotFoundPage })));

const surface = (element: React.ReactNode) => <Suspense fallback={<DocumentLoader />}>{element}</Suspense>;

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <RouteError />,
        children: [
            { index: true, element: surface(<HomePage />) },
            { path: "/docs", element: surface(<DocumentsListPage />) },
            { path: "/statistics", element: surface(<StatisticsPage />) },
            { path: "/trash", element: surface(<TrashPage />) },
            { path: "/document/*", element: surface(<DocumentPage />) },
            { path: "*", element: surface(<NotFoundPage />) },
        ],
    },
]);
