import { cn } from "@/lib/utils";

export interface DataReading {
    label: string;
    value: React.ReactNode;
}

interface DataGridProps {
    readings: DataReading[];
    /** Two columns is the plate card's grid; one column is the register's. */
    columns?: 1 | 2;
    className?: string;
}

/**
 * The coordinate table under a charted object: tracked capital keys over
 * tabular figures, aligned so values compare down the column.
 */
export function DataGrid({ readings, columns = 2, className }: DataGridProps) {
    return (
        <dl className={cn("grid gap-x-6 gap-y-2.5", columns === 2 ? "grid-cols-2" : "grid-cols-1", className)}>
            {readings.map(reading => (
                <div key={reading.label} className="flex flex-col gap-1">
                    <dt className="text-ink-dim text-[0.625rem] leading-none font-semibold tracking-[0.14em] uppercase">
                        {reading.label}
                    </dt>
                    <dd className="text-ink figures text-[0.8125rem] leading-none font-medium">{reading.value}</dd>
                </div>
            ))}
        </dl>
    );
}
