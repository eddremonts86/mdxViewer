import { Link } from "react-router-dom";

import { EmptyPlate } from "@/components/atlas/EmptyPlate";
import { Button } from "@/components/ui/button";

interface DocumentErrorProps {
    title?: string;
    message?: string;
    className?: string;
}

export function DocumentError({
    title = "This object is not in the catalogue",
    message = "The document was moved, renamed or deleted. The chart shows everything the folder currently holds.",
    className,
}: DocumentErrorProps) {
    return (
        <EmptyPlate
            designation="Not catalogued"
            title={title}
            message={message}
            className={className}
            action={
                <Button asChild variant="outline">
                    <Link to="/">Open the chart</Link>
                </Button>
            }
        />
    );
}
