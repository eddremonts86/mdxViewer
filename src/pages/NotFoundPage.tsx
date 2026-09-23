import { Link, useLocation } from "react-router-dom";

import { EmptyPlate } from "@/components/atlas/EmptyPlate";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
    const location = useLocation();

    return (
        <EmptyPlate
            designation="Off the chart"
            title="Nothing is plotted here"
            message={`No surface answers to ${location.pathname}. The chart holds every document the content folder currently contains.`}
            action={
                <Button asChild variant="outline">
                    <Link to="/">Open the chart</Link>
                </Button>
            }
        />
    );
}
