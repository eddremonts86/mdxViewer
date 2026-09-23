import { EmptyPlate } from "@/components/atlas/EmptyPlate";

interface DocumentWelcomeProps {
    title?: string;
    message?: string;
    className?: string;
}

export function DocumentWelcome({
    title = "No object selected",
    message = "Pick a document from the plate index, or open the chart to see the whole collection at once.",
    className,
}: DocumentWelcomeProps) {
    return <EmptyPlate designation="Awaiting selection" title={title} message={message} className={className} />;
}
