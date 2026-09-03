import { Link } from "react-router-dom";

import { ArrowLeft, Pencil, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PlateActionsProps {
    /** Absent when the service did not send the file's raw text; then there is nothing to edit. */
    onEdit?: () => void;
}

/** The row above a document plate: back to the chart, and what you can do here. */
export function PlateActions({ onEdit }: PlateActionsProps) {
    return (
        <div className="print-hide flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link to="/">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Chart
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                {onEdit ? (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" />
                    Print
                </Button>
            </div>
        </div>
    );
}
