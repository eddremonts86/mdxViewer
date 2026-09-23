import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

import { EmptyPlate } from "@/components/atlas";
import { Button } from "@/components/ui/button";

/**
 * What the router shows when a route throws. React Router's own default page is
 * a bare stack trace on white; this stays in the world and says what is wrong.
 */
export function RouteError() {
    const error = useRouteError();

    const message = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : error instanceof Error
          ? error.message
          : "The surface failed before it finished drawing.";

    return (
        <EmptyPlate
            designation="Exposure failed"
            title="This surface could not be drawn"
            message={message}
            action={
                <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild>
                        <Link to="/">Open the chart</Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Reload
                    </Button>
                </div>
            }
        />
    );
}
